from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetThreadCreator(MethodResource, Resource):

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
        user = self.db.get(self.db.tables["User"], {"id": id})

        if len(user) == 0:
            return {"message": "Forum not found"}, 404
        
        if len(user) == 0:
            return "", "401 The user has not been found"

        user = user[0].__dict__
        print(user)
        del user["password"]
        del user['_sa_instance_state']

        return user, "200 "



 