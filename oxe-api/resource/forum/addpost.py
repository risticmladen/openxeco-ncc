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
import subprocess  # For running ClamAV

class AddPost(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Add a new post to the thread',
         params={
             'content': {'description': 'The content of the post', 'type': 'string', 'required': True},
             'thread_id': {'description': 'The ID of the thread', 'type': 'integer', 'required': True},
             'creator_id': {'description': 'The ID of the creator', 'type': 'integer', 'required': True},
             'document': {'description': 'The document file', 'type': 'file', 'required': False},
         },
         responses={
             "200": {"description": "Post added successfully"},
             "400": {"description": "Invalid input"},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def post(self):
        data = request.form
        document = request.files.get('document')

        if not data or not all(key in data for key in ('content', 'thread_id', 'creator_id')):
            return {"message": "Invalid input"}, 400

        new_post = {
            "content": data['content'],
            "updated_at": datetime.now(),
            "creator_id": data['creator_id'],
            "thread_id": data['thread_id'],
            "filename": None
        }

        try:
            post_model = self.db.tables["posts_post"]
            new_post_entry = post_model(**new_post)
            self.db.session.add(new_post_entry)
            self.db.session.commit()

            post_id = new_post_entry.id  # Get the new post ID

            if document:
                # Save the file temporarily to scan it
                filename = f"{os.path.splitext(document.filename)[0]}_{post_id}{os.path.splitext(document.filename)[1]}"
                file_path = f"uploads/post_documents/{filename}"
                document.save(file_path)

                # Detect malware
                if self.detect_malware(file_path):
                    # Delete the file if it's malicious
                    os.remove(file_path)
                    return {"message": "Malicious file detected!"}, 400
                else:
                    new_post_entry.filename = filename

            thread_model = self.db.tables["threads_thread"]
            thread = self.db.session.query(thread_model).filter_by(id=data['thread_id']).first()
            if thread:
                thread.last_activity = datetime.now()
                self.db.session.merge(thread)

            self.db.session.commit()
            return {"message": "Post added successfully"}, 200
        except Exception as e:
            logging.error("Error while adding new post: %s", str(e))
            return {"message": str(e)}, 500

    def detect_malware(self, file_path):
        """
        Scans the file using ClamAV Daemon (clamd).
        Returns True if the file is malicious, False otherwise.
        """
        try:
            # Use clamdscan for faster scanning
            result = subprocess.run(['clamdscan', file_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            # Check if ClamAV daemon detected an infected file
            if b'Infected files: 1' in result.stdout:
                return True
        except Exception as e:
            logging.error("Malware detection failed: %s", str(e))

        print("Everything is fine")
        return False

