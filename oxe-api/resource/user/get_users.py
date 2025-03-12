from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy import func, case
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from flask_jwt_extended import get_jwt_identity


class GetUsers(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Get users. The request returns a restricted amount of information '
                     '(id, email, is_admin, is_active, accept_communication)',
         responses={
             "200": {},
         })
    @use_kwargs({
        'ids': fields.DelimitedList(fields.Int(), required=False),
        'email': fields.Str(required=False),
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'admin_only': fields.Bool(required=False),
        'first_name' : fields.Str(required=False),
        'last_name' : fields.Str(required=False),
        'status' : fields.Str(required=False),
    }, location="query")
    @jwt_required
    @catch_exception
    def get(self, **kwargs):
        user_id = get_jwt_identity() 
        print(user_id)
        user = (self.db.session.query(self.db.tables["User"]).filter_by(id=user_id).first() )
        if user:
            if user.community_access == 0:
                print("Not accepted")
                return {"message": "Not accepted User"}, 200
            
        query = self.db.session.query(self.db.tables["User"])\
						.outerjoin(self.db.tables["UserProfile"], self.db.tables["User"].id == self.db.tables["UserProfile"].user_id)\
            .with_entities(self.db.tables["User"].id,
                           self.db.tables["User"].email,
                           self.db.tables["User"].first_name,
                           self.db.tables["User"].last_name,
                           self.db.tables["User"].is_admin,
                           self.db.tables["User"].is_active,
                           self.db.tables["User"].status,
                           self.db.tables["User"].accept_communication,
													 self.db.tables["UserProfile"].entity_name
													 )\
             .order_by(
                 case(
                     [(self.db.tables["UserProfile"].entity_name == None, 1)],
                      else_= 0
                    ).asc(),		
									self.db.tables["UserProfile"].entity_name.asc(),
                  self.db.tables["User"].last_name.asc())
						# .order_by(self.db.tables["User"].email.asc())

        if "ids" in kwargs:
            query = query.filter(self.db.tables["User"].id.in_(kwargs['ids']))

        if "email" in kwargs:
            query = query.filter(func.lower(self.db.tables["User"].email).like("%" + kwargs["email"] + "%"))

        if "first_name" in kwargs:
            query = query.filter(func.lower(self.db.tables["User"].first_name).like("%" + kwargs["first_name"] + "%"))

        if "last_name" in kwargs:
            query = query.filter(func.lower(self.db.tables["User"].last_name).like("%" + kwargs["last_name"] + "%"))

        if "status" in kwargs:
            query = query.filter(func.lower(self.db.tables["User"].status).like("%" + kwargs["status"] + "%"))

        if "admin_only" in kwargs and kwargs["admin_only"] is True:
            query = query.filter(self.db.tables["User"].is_admin.is_(True))

        paginate = query.paginate(kwargs['page'], kwargs['per_page'])
        users = [u._asdict() for u in paginate.items]

        return {
            "pagination": {
                "page": kwargs['page'],
                "pages": paginate.pages,
                "per_page": kwargs['per_page'],
                "total": paginate.total,
            },
            "items": users,
        }, "200 "
