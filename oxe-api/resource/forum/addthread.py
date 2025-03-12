from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask import request
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from datetime import datetime
import logging


class AddThread(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Add a new thread to the forum',
         params={
             'name': {'description': 'The name of the thread', 'type': 'string', 'required': True},
             'content': {'description': 'The content of the thread', 'type': 'string', 'required': True},
             'forum_id': {'description': 'The ID of the forum', 'type': 'integer', 'required': True},
             'creator_id': {'description': 'The ID of the creator', 'type': 'integer', 'required': True},
         },
         responses={
             "200": {"description": "Thread added successfully"},
             "400": {"description": "Invalid input"},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def post(self):
        data = request.get_json()

        if not data or not all(key in data for key in ('name', 'content', 'forum_id', 'creator_id')):
            return {"message": "Invalid input"}, 400

        new_thread = {
            "name": data['name'],
            "pinned": 0,  # Default to false
            "content": data['content'],
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
            "creator_id": data['creator_id'],
            "forum_id": data['forum_id'],
        }

        try:
            # Access the threads_thread table model correctly
            thread_model = self.db.tables["threads_thread"]
            self.db.session.add(thread_model(**new_thread))
            self.db.session.commit()
            return {"message": "Thread added successfully"}, 200
        except Exception as e:
            logging.error("Error while adding new thread: %s", str(e))
            return {"message": str(e)}, 500
