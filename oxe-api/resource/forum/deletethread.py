from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask import request
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
import logging


class DeleteThread(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Delete a thread and its posts from the forum',
         params={
             'thread_id': {'description': 'The ID of the thread to be deleted', 'type': 'integer', 'required': True},
         },
         responses={
             "200": {"description": "Thread and its posts deleted successfully"},
             "400": {"description": "Invalid input"},
             "401": {"description": "Unauthorized"},
             "404": {"description": "Thread not found"},
         })
    @jwt_required
    @catch_exception
    def post(self):
        
        data = request.get_json()

        if not data or 'thread_id' not in data:
            return {"message": "Invalid input"}, 400

        thread_id = data['thread_id']
        print(thread_id)

        try:
            # Access the threads_thread and posts_post table models correctly
            thread_model = self.db.tables["threads_thread"]
            post_model = self.db.tables["posts_post"]

            # Find the thread to delete
            thread_to_delete = self.db.session.query(thread_model).filter_by(id=thread_id).first()

            if not thread_to_delete:
                print("hello")
                return {"message": "Thread not found"}, 404

            # Delete associated posts
            posts_to_delete = self.db.session.query(post_model).filter_by(thread_id=thread_id).all()
            for post in posts_to_delete:
                self.db.session.delete(post)

            # Delete the thread
            self.db.session.delete(thread_to_delete)
            self.db.session.commit()
            
            return {"message": "Thread and its posts deleted successfully"}, 200
        except Exception as e:
            logging.error("Error while deleting thread and its posts: %s", str(e))
            return {"message": str(e)}, 500
