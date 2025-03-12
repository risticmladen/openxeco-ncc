from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_already_existing import ObjectAlreadyExisting


class AddProfile(MethodResource, Resource):

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
        'user_id': fields.Int(),
        'data': fields.Dict(required=True, allow_none=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):
        user_id = kwargs["user_id"]

        user = self.db.session.query(self.db.tables["User"]).filter_by(id=user_id).first()
        if user:
            email = user.email
            password = user.password
        else:
            return {"message": "User not found"}, 404
        
        self.db.merge({
            'id': user_id,
            'first_name': kwargs["data"]['first_name'],
            'last_name': kwargs["data"]['last_name'],
            'telephone': kwargs["data"]['telephone'],
            # 'is_vcard_public': kwargs["data"]['public'],
            'status': "ACCEPTED",
            'community_access': 1, 
        }, self.db.tables["User"])
        try:
            self.db.insert({
                'user_id': user_id,
                'gender': kwargs["data"]['gender'],
                'entity_name': kwargs["data"]['entity_name'],
                'vat_number': kwargs["data"]['vat_number'],
                'website': kwargs["data"]['website'],
                'company_email': kwargs["data"]['company_email'],
                'company_phone': kwargs["data"]['company_phone'],
                'position_organization': kwargs["data"]['position_organization'],
                'address': kwargs["data"]['address'],
                'city': kwargs["data"]['city'],
                'postal_code': kwargs["data"]['postal_code'],
                'po_box': kwargs["data"]['po_box'],
                'headquarter_address': kwargs["data"].get('headquarter_address') or kwargs["data"]['address'],
                'headquarter_city': kwargs["data"].get('headquarter_city') or kwargs["data"]['city'],
                'headquarter_postal_code': kwargs["data"].get('headquarter_postal_code') or kwargs["data"]['postal_code'],
                'headquarter_po_box': kwargs["data"].get('headquarter_po_box') or kwargs["data"]['po_box'],
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
                'article_compy_regulation':kwargs["data"]['article_compy_regulation'],
                'detail_expertise': kwargs["data"]['detail_expertise'],
                'achieve_join_community': kwargs["data"]['achieve_join_community'],
                'contribution_community': kwargs["data"]['contribution_community'],
                'ncc_consent': kwargs["data"]['ncc_consent'],
                'signature': kwargs["data"]['signature'],
                'registration_date': datetime.now(),

            }, self.db.tables["UserProfile"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e
        return "", "200 "
