from flask import request, render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
import base64

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.mail import send_email, send_email_with_attachment
from utils.re import has_mail_format

class SendMail(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['mail'],
         description='Send an email with or without attachment',
         responses={
             "200": {},
             "404": {"description": "This mail template does not exist"},
         })
    @use_kwargs({
        'subject': fields.Str(),
        'address': fields.Str(),
        'content': fields.Str(),
        'user_as_cc': fields.Bool(required=False, allow_none=True),
        'attachment_filename': fields.Str(required=False, allow_none=True),
        'attachment_data': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", 500, {"message": "Impossible to find the origin. Please contact the administrator"}

        cc = None

        if 'user_as_cc' in kwargs and kwargs['user_as_cc'] is True:
            data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

            if len(data) < 1:
                return "", 500, {"message": "The user has not been found"}

            if data[0].email is None or not has_mail_format(data[0].email):
                return "", 500, {"message": "The user does not have a correct email address"}

            cc = [data[0].email]

        if 'attachment_filename' in kwargs and 'attachment_data' in kwargs:
            try:
                attachment_data = base64.b64decode(kwargs['attachment_data'].split(',')[1])
                attachments = [(kwargs['attachment_filename'], attachment_data)]
                send_email_with_attachment(self.mail,
                                           subject=kwargs["subject"],
                                           recipients=[kwargs["address"]],
                                           cc=cc,
                                           html_body=render_template(
                                               'generic_mail.html',
                                               content=kwargs["content"],
                                           ),
                                           attachments=attachments)
            except Exception as e:
                logging.error(e)
                return {"message": "Error decoding attachment data"}, 500
        else:
            try:
                send_email(self.mail,
                           subject=kwargs["subject"],
                           recipients=[kwargs["address"]],
                           cc=cc,
                           html_body=render_template(
                               'generic_mail.html',
                               content=kwargs["content"],
                           ),
                           )
            except Exception as e:
                logging.error(e)
                return {"message": "Error sending email"}, 500

        return "", 200

