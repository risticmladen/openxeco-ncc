from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask import request
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from datetime import datetime
import os
import logging

class DeletePost(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Delete a post from the forum',
         params={
             'post_id': {'description': 'The ID of the post to be deleted', 'type': 'integer', 'required': True},
         },
         responses={
             "200": {"description": "Post deleted successfully"},
             "400": {"description": "Invalid input"},
             "401": {"description": "Unauthorized"},
             "404": {"description": "Post not found"},
         })
    @jwt_required
    @catch_exception
    def post(self):
        data = request.get_json()

        if not data or 'post_id' not in data:
            return {"message": "Invalid input"}, 400

        post_id = data['post_id']

        try:
            post_model = self.db.tables["posts_post"]

            post_to_delete = self.db.session.query(post_model).filter_by(id=post_id).first()

            if not post_to_delete:
                return {"message": "Post not found"}, 404

            # Delete the associated file if it exists
            if post_to_delete.filename:
                file_path = os.path.join("uploads/post_documents/", post_to_delete.filename)
                if os.path.exists(file_path):
                    os.remove(file_path)

            thread_id = post_to_delete.thread_id

            self.db.session.delete(post_to_delete)
            self.db.session.commit()

            thread_model = self.db.tables["threads_thread"]
            thread = self.db.session.query(thread_model).filter_by(id=thread_id).first()
            if thread:
                thread.last_activity = datetime.now()
                self.db.session.merge(thread)
                self.db.session.commit()

            return {"message": "Post deleted successfully"}, 200
        except Exception as e:
            logging.error("Error while deleting post: %s", str(e))
            return {"message": str(e)}, 500
