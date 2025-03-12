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

class EditPost(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Edit an existing post in the thread',
         params={
             'post_id': {'description': 'The ID of the post', 'type': 'integer', 'required': True},
             'content': {'description': 'The new content of the post', 'type': 'string', 'required': True},
             'document': {'description': 'The document file', 'type': 'file', 'required': False},
         },
         responses={
             "200": {"description": "Post edited successfully"},
             "400": {"description": "Invalid input"},
             "401": {"description": "Unauthorized"},
             "404": {"description": "Post not found"},
         })
    @jwt_required
    @catch_exception
    def post(self):
        data = request.form
        document = request.files.get('document')

        if not data or not all(key in data for key in ('post_id', 'content')):
            return {"message": "Invalid input"}, 400

        try:
            post_model = self.db.tables["posts_post"]
            post_to_edit = self.db.session.query(post_model).filter_by(id=data['post_id']).first()

            if not post_to_edit:
                return {"message": "Post not found"}, 404

            # Update the post content
            post_to_edit.content = data['content']
            post_to_edit.edited = 1
            post_to_edit.edited_date = datetime.now()
            post_to_edit.updated_at = datetime.now()

            if document:
                # Delete the previous file if it exists
                if post_to_edit.filename:
                    old_file_path = os.path.join("uploads/post_documents/", post_to_edit.filename)
                    if os.path.exists(old_file_path):
                        os.remove(old_file_path)

                # Save the new document
                filename = f"{os.path.splitext(document.filename)[0]}_{post_to_edit.id}{os.path.splitext(document.filename)[1]}"
                file_path = f"uploads/post_documents/{filename}"
                document.save(file_path)
                post_to_edit.filename = filename

            # Update the last_activity column in the threads_threads table
            thread_model = self.db.tables["threads_thread"]
            thread = self.db.session.query(thread_model).filter_by(id=post_to_edit.thread_id).first()
            if thread:
                thread.last_activity = datetime.now()
                self.db.session.merge(thread)

            self.db.session.merge(post_to_edit)
            self.db.session.commit()
            return {"message": "Post edited successfully"}, 200
        except Exception as e:
            logging.error("Error while editing post: %s", str(e))
            return {"message": str(e)}, 500
