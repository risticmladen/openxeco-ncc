from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateMyProfile(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Add a user profile',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing"},
         })
    @use_kwargs({
        'data': fields.Dict(required=True, allow_none=False),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):
        user_id = get_jwt_identity()
        db_profile = self.db.get(self.db.tables["UserProfile"], {"user_id": get_jwt_identity()})
        profile = kwargs["data"]

        self.db.merge({
            'id': user_id,
            'first_name': profile['first_name'],
            'last_name': profile['last_name'],
            'telephone': profile['telephone'],
        }, self.db.tables["User"])

        self.db.merge({
            'id': db_profile[0].id,
            'user_id': user_id,
            'gender': profile['gender'],
            'entity_name': kwargs["data"]['entity_name'],
            'vat_number': kwargs["data"]['vat_number'],
            'website': kwargs["data"]['website'],
            'company_email': kwargs["data"]['company_email'],
            'company_phone': kwargs["data"]['company_phone'],
            'position_organization': kwargs["data"]['position_organization'],
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

        }, self.db.tables["UserProfile"])

        return "", "200 "
