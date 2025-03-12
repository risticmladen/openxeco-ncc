from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateProfile(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db
 
    @log_request
    @doc(tags=['public'],
         description='Add a user profile',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing"},
         })
    @use_kwargs({
        'user_id': fields.Int(),
        'data': fields.Dict(required=True, allow_none=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):
        user_id = kwargs["user_id"]
        
        # db_profile = self.db.get(self.db.tables["UserProfile"], {"user_id": user_id})

        self.db.merge({
            'id': user_id,
            'first_name': kwargs["data"]['first_name'],
            'last_name': kwargs["data"]['last_name'],
            'telephone': kwargs["data"]['telephone'],
            'is_vcard_public': kwargs["data"]['public'],
            'status': "ACCEPTED",
        }, self.db.tables["User"])

        profile_data = {
            'user_id': user_id,
            'gender': kwargs["data"]['gender'],
            'public': kwargs["data"]['public'],
            'entity_name': kwargs["data"]['entity_name'],
            'vat_number': kwargs["data"]['vat_number'],
            'website': kwargs["data"]['website'],
            'company_email': kwargs["data"]['company_email'],
            'company_phone': kwargs["data"]['company_phone'],
            'position_organization' : kwargs["data"]['position_organization'],
            'address' : kwargs["data"]['address'],
            'city': kwargs["data"]['city'],
            'postal_code': kwargs["data"]['postal_code'],
            'po_box': kwargs["data"]['po_box'],
            'headquarter_address': kwargs["data"]['headquarter_address'],
            'headquarter_city': kwargs["data"]['headquarter_city'],
            'headquarter_postal_code': kwargs["data"]['headquarter_postal_code'],
            'headquarter_po_box': kwargs["data"]['headquarter_po_box'],
            'organizations_types': kwargs["data"]['organizations_types'],
            'other': kwargs["data"]['other'],
            'eu_member': kwargs["data"]['eu_member'],
            'eu_country': kwargs["data"]['eu_country'],
            'majority_shares': kwargs["data"]['majority_shares'],
            'shares_country': kwargs["data"]['shares_country'],
            'comply_article_eu': kwargs["data"]['comply_article_eu'],
            'taxonomy_types': kwargs["data"]['taxonomy_types'],
            'person_expertise': kwargs["data"]['person_expertise'],
            'field_article_expertise': kwargs["data"]['field_article_expertise'],
            'taxonomy_other': kwargs["data"]['taxonomy_other'],
            'detail_expertise': kwargs["data"]['detail_expertise'],
            'achieve_join_community': kwargs["data"]['achieve_join_community'],
            'contribution_community': kwargs["data"]['contribution_community'],
        }

        db_profile = self.db.get(self.db.tables["UserProfile"], {"user_id": user_id})

        if len(db_profile) > 0:
            profile_data['id'] = db_profile[0].id

        self.db.merge(profile_data, self.db.tables["UserProfile"])

        return "", "200 "
