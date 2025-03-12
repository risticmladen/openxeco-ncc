from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from sqlalchemy import distinct
from sqlalchemy import or_
from datetime import datetime, timedelta

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetEcosystemActivity(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['analytics'],
         description='Get the analytics of the ecosystem activity based on the logs',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        log = self.db.tables["Log"]
        usr = self.db.tables["User"]
        art = self.db.tables["Article"]

        non_admin_user_ids = [u[0] for u in self.db.get(usr, {"is_admin": False}, ["id"])]
        non_admin_user_emails = [u[0] for u in self.db.get(usr, {"is_admin": False}, ["email"])]
        # data = self.db.get(usr, {"is_admin": False}, ["email"])
        # non_admin_user_emails = [u[1] for u in data] if data else []

        data = {
            "news_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "NEWS")
                    .filter(art.status == "PUBLIC")
                    # .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "faqs_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "FAQ")
                    .filter(art.status == "PUBLIC")
                    # .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "announcements_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "ANNOUNCEMENTS")
                    .filter(art.status == "PUBLIC")
                    # .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "account_creation":
                {str(o[0]): o[1] for o in self.db.session.query(usr)
                    .with_entities(func.DATE(usr.sys_date), func.count(usr.id))
                    # .filter(usr.is_admin.is_(False))
                    .filter(usr.sys_date > datetime.today() - timedelta(days=365))
                    .group_by(func.DATE(usr.sys_date))
                    .all()},
            "action":
                {str(o[0]): o[1] for o in self.db.session.query(log)
                    .with_entities(func.DATE(log.sys_date), func.count(log.id))
                    .filter(log.user_id.in_(non_admin_user_ids))
                    .filter(log.status_code == 200)
                    .filter(log.request_method == "POST")
                    .filter(log.sys_date > datetime.today() - timedelta(days=365))
                    .group_by(func.DATE(log.sys_date))
                    .all()},
            "users_logged":
                {str(o[0]): o[1] for o in self.db.session.query(log)
                    .with_entities(func.DATE(log.sys_date), log.params)
                    # .filter(log.user_id.in_(non_admin_user_emails))
                    .filter(log.status_code == 200)
                    .filter(log.request_method == "POST")
                    .filter(log.request == "/account/login")
                    .filter(or_(*[log.params.contains(email) for email in non_admin_user_emails]))  # filter the params field to contain any of the non_admin_user_emails
                    .filter(log.sys_date > datetime.today() - timedelta(days=30))
                    .group_by(log.params)
                    .all()}
        }

        return data, "200 "
