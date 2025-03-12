from flask_apispec import MethodResource, doc
from flask_restful import Resource
from flask import jsonify, request

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from utils.serializer import Serializer

class AddActivity(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['activities'],
         description='Add a new public activity',
         responses={
             "200": {},
             "400": {"description": "Bad Request"},
         })
    @catch_exception
    def post(self):
        activity = request.get_json()

        if not activity:
            return {"message": "Bad Request"}, 400

        new_activity = {
            "date": activity.get("date"),
            "start_time": activity.get("start_time"),
            "end_time": activity.get("end_time"),
            "title": activity.get("title"),
            "description": activity.get("description"),
            "organizers": activity.get("organizers"),
            "link": activity.get("link"),
        }

        self.db.insert(new_activity, self.db.tables["activities"])

        return {"message": "Activity added successfully"}, 200
