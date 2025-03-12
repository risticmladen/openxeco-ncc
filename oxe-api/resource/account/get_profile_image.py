import os
from flask import request, jsonify
from flask_apispec import MethodResource, doc
from flask_restful import Resource
from decorator.log_request import log_request
from decorator.catch_exception import catch_exception
from exception.image_not_found import ImageNotFound
import base64

# UPLOAD_FOLDER = './uploads/profile_pictures/'

class GetProfilePic(MethodResource, Resource):
    def __init__(self, db):
        self.db = db
        # if not os.path.exists(UPLOAD_FOLDER):
        #     os.makedirs(UPLOAD_FOLDER)
    
    @catch_exception
    @log_request
    @doc(tags=['account'],
         description='Get profile picture of the user by user_id',
         params={
             'user_id': {'description': 'User ID of the profile picture to fetch', 'in': 'query', 'type': 'string'}
         },
         responses={
             "200": {"description": "Profile picture retrieved successfully"},
             "404": {"description": "Profile picture not found"},
             "422": {"description": "Invalid input"}
         })
    def get(self, id):
        try:
            file_path = os.path.join("./uploads/profile_pictures/", id)
            with open(file_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return jsonify({"image": f"data:image/jpeg;base64,{encoded_string}"})
        except FileNotFoundError:
            raise ImageNotFound

class UploadProfilePic(MethodResource, Resource):
    def __init__(self, db):
        self.db = db
        if not os.path.exists("./uploads/profile_pictures/"):
            os.makedirs("./uploads/profile_pictures/")

    @catch_exception
    @log_request
    @doc(tags=['account'],
         description='Upload profile picture for the user',
         params={
             'user_id': {'description': 'User ID for the profile picture', 'in': 'formData', 'type': 'string'},
             'image': {'description': 'Base64 encoded image', 'in': 'formData', 'type': 'string'}
         },
         responses={
             "200": {"description": "Profile picture uploaded successfully"},
             "400": {"description": "Bad request"}
         })
    def post(self):
        user_id = request.form['user_id']
        image_data = request.form['image']
        
        # Extract Base64 data
        base64_data = image_data.split(",")[1]
        
        try:
            # Decode Base64 data
            img_data = base64.b64decode(base64_data)
            file_path = os.path.join("./uploads/profile_pictures/", user_id)
            
            with open(file_path, "wb") as f:
                f.write(img_data)
            
            return jsonify({"message": "Profile picture uploaded successfully"}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 400
