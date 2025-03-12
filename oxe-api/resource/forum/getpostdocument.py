from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask import send_file, jsonify, make_response, abort
import os

class GetPostDocument(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get the document associated with a post',
         params={
             'post_id': {'description': 'The ID of the post', 'type': 'integer', 'required': True}
         },
         responses={
             "200": {"description": "Document retrieved successfully"},
             "401": {"description": "Unauthorized"},
             "404": {"description": "Post or document not found"}
         })
    @jwt_required
    @catch_exception
    def get(self, post_id):
        # Query the database for the post
        post = self.db.session.query(self.db.tables["posts_post"]).filter_by(id=post_id).first()
        
        # If no post or post does not have an associated document
        if not post or not post.filename:
            return {"message": "Post not found or no document associated with the post"}, 404

        # Define the path to the file
        file_path = f"uploads/post_documents/{post.filename}"

        # Check if file exists
        if not os.path.exists(file_path):
            return {"message": "Document not found on the server"}, 404

        # Send the file for download
        return send_file(file_path, as_attachment=True)
