from flask_apispec import MethodResource, doc, use_kwargs
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound

class DeleteActivity(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['activities'],
         description='Delete an activity',
         responses={
             "200": {"description": "Activity deleted successfully"},
             "404": {"description": "Activity not found"},
         })
    @use_kwargs({
        'id': fields.Int(required=True)
    }, location="json")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):
        activity_id = kwargs["id"]

        existing_activity = self.db.get(self.db.tables["activities"], {"id": activity_id})
        if not existing_activity:
            raise ObjectNotFound("Activity not found")

        self.db.delete(self.db.tables["activities"], {"id": activity_id})

        return {"message": "Activity deleted successfully"}, 200
