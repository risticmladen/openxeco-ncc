from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.response import build_no_cors_response


class GetPublicEntityEnums(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['public'],
         description='Get the enumerations of entity fields',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        data = {
            "status": self.db.tables["Entity"].status.prop.columns[0].type.enums,
            "legal_status": self.db.tables["Entity"].legal_status.prop.columns[0].type.enums,
            "entity_type": self.db.tables["Entity"].entity_type.prop.columns[0].type.enums,
            "size": self.db.tables["Entity"].size.prop.columns[0].type.enums,        
        }
        print(data)
        return build_no_cors_response(data)
