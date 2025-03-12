from flask_apispec import MethodResource, doc, use_kwargs
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound

class UpdateActivity(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['activities'],
         description='Update an activity',
         responses={
             "200": {},
             "404": {"description": "Activity not found"},
         })
    @use_kwargs({
        'id': fields.Int(required=True),
        'date': fields.Str(required=True),
        'start_time': fields.Str(required=True),
        'start_time': fields.Str(required=True),
        'end_time': fields.Str(required=True),
        'title': fields.Str(required=True),
        'description': fields.Str(required=True),
        'organizers': fields.Str(required=True),
        'link': fields.Str(required=True),
    }, location="json")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):
        activity_id = kwargs["id"]

        existing_activity = self.db.get(self.db.tables["activities"], {"id": activity_id})
        if not existing_activity:
            raise ObjectNotFound("Activity not found")

        activity_data = {
            'id': activity_id,
            'date': kwargs["date"],
            'start_time': kwargs["start_time"],
            'end_time': kwargs["end_time"],
            'title': kwargs["title"],
            'description': kwargs["description"],
            'organizers': kwargs["organizers"],
            'link': kwargs["link"],
        }

        self.db.merge(activity_data, self.db.tables["activities"])

        return {"message": "Activity updated successfully"}, 200
