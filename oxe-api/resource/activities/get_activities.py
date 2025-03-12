from flask_apispec import MethodResource, doc
from flask_restful import Resource, reqparse
from flask import jsonify

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from utils.serializer import Serializer

class GetActivities(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['activities'],
         description='Get all public activities',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })
    @catch_exception
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=None, location='args')
        parser.add_argument('limit', type=int, default=None, location='args')
        args = parser.parse_args()

        page = args['page']
        limit = args['limit']

        query = self.db.session.query(self.db.tables["activities"])

        if page is not None and limit is not None:
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)

        total_activities = self.db.session.query(self.db.tables["activities"]).count()
        data = query.all()

        if not data:
            raise ObjectNotFound("No activities found")

        data = Serializer.serialize(data, self.db.tables["activities"])

        return jsonify({
            'activities': data,
            'total': total_activities,
            'page': page,
            'limit': limit
        })
