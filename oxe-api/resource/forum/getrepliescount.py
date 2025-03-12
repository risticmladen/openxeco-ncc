from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetRepliesCount(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get the count of replies for a thread by ID',
         params={'id': {'description': 'The ID of the thread'}},
         responses={
             "200": {"description": "Success"},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def get(self, id):

        # Get the count of posts from posts_post table by thread ID
        count = self.db.session.query(self.db.tables["posts_post"]).filter_by(thread_id=id).count()

        return {"count": count}, 200
