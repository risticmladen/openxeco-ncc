from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request

class GetThreadCompany(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get information about a company by user ID',
         params={'id': {'description': 'The user ID of the creator'}},
         responses={
             "200": {},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def get(self, id):
        # Define the default user profile with null values
        default_user_profile = {
            "id": None,
            "gender": None,
            "sector": None,
            "residency": None,
            "mobile": None,
            "experience": None,
            "domains_of_interest": None,
            "how_heard": None,
            "public": None,
            "user_id": id,
            "profession_id": None,
            "industry_id": None,
            "nationality_id": None,
            "expertise_id": None,
            "entity_name": None,
            "vat_number": None,
            "website": None,
            "company_email": None,
            "company_phone": None,
        }

        # Get the user profile from UserProfile table by user ID
        user_profile = self.db.get(self.db.tables["UserProfile"], {"user_id": id})

        if len(user_profile) == 0:
            return default_user_profile, 200

        user_profile = user_profile[0].__dict__
        # print(user_profile)
        del user_profile['_sa_instance_state']

        return user_profile, 200
