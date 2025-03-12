import os
import flask
import io
import PIL
import traceback
from PIL import Image
from flask import request
from exception.error_while_saving_file import ErrorWhileSavingFile
from werkzeug.utils import secure_filename
from flask_apispec import MethodResource
from flask_restful import Resource
from flask_apispec import use_kwargs, doc
import datetime
from decorator.log_request import log_request
import base64

UPLOAD_FOLDER = 'uploads/profile_pictures'

class UploadProfilePic(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    @log_request
    @doc(tags=['account'],
        description='Upload profile picture of the user authenticated by the token',
        responses={
            "200": {},
            "400": {"description": "Invalid request"},
            "422.a": {"description": "The image is not provided"},
            "422.b": {"description": "The user ID is not provided"},
        })
    def post(self, **kwargs):
        file_json = flask.request.json
        thumbnail_stream = io.BytesIO(base64.b64decode(file_json["image"].split(",")[-1]))

        # Create Thumbnail file

        fixed_height = 100
        try:
            image = Image.open(thumbnail_stream)
        except PIL.UnidentifiedImageError:
            return "", "422 The data sent is not identified as an image"

        height_percent = (fixed_height / float(image.size[1]))
        width_size = int((float(image.size[0]) * float(height_percent)))
        thumbnail = image.resize((width_size, fixed_height), PIL.Image.NEAREST)

        thumbnail_stream = io.BytesIO()
        thumbnail = thumbnail.convert("RGB")
        thumbnail.save(thumbnail_stream, format="JPEG")

        image = {
            "thumbnail": thumbnail_stream.getvalue(),
            "height": image.size[1],
            "width": image.size[0],
            "creation_date": datetime.date.today()
        }

        stream = io.BytesIO(base64.b64decode(file_json["image"].split(",")[-1]))
        try:
            f = open(os.path.join("./uploads/profile_pictures/", str(file_json['user_id'])), 'wb')
            f.write(stream.read())
            f.close()
        except Exception:
            # self.db.delete(self.db.tables["Image"], {"id": image.id})
            traceback.print_exc()
            raise ErrorWhileSavingFile
        
        return "Image uploaded successfully", 200
    


    


    
