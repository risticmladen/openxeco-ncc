from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetForumById(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get information about a forum by ID',
         params={'id': {'description': 'The ID of the forum'}},
         responses={
             "200": {},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def get(self, id):

        # Get the forum entry from forums_forum table by ID
        forum = self.db.get(self.db.tables["forums_forum"], {"id": id})

        if len(forum) == 0:
            return {"message": "Forum not found"}, 404

        # Convert the forum data to a dictionary
        forum_data = forum[0].__dict__

        # Remove unnecessary attributes from the forum entry
        del forum_data['_sa_instance_state']

        return forum_data, 200
