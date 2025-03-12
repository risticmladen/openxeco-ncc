from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetForum(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get information about all forums',
         responses={
             "200": {},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def get(self):

        # Get all entries from forums_forum table
        data = self.db.get(self.db.tables["forums_forum"])

        if len(data) == 0:
            return [], 200  # Return an empty list if no forums are found

        # Convert all forum data to a list of dictionaries
        forums_data = [forum.__dict__ for forum in data]

        # Remove unnecessary attributes from each forum entry
        for forum in forums_data:
            del forum['_sa_instance_state']

        return forums_data, 200

