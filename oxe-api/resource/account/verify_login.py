from datetime import datetime, timedelta
from flask import make_response, request
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token
from utils.cookie import set_cookie
from webargs import fields
from utils.token import verify_otp
import pytz #new
from decorator.catch_exception import catch_exception

def convert_to_cyprus_time(timestamp):
        # Convert timestamp to UTC datetime object
        utc_dt = datetime.utcfromtimestamp(timestamp)

        # Add 3 hours to account for the MariaDB server time zone
        utc_dt += timedelta(hours=3)

        # Define Cyprus time zone
        cyprus_tz = pytz.timezone('Europe/Nicosia')

        # Convert UTC datetime to Cyprus time
        cyprus_dt = pytz.utc.localize(utc_dt).astimezone(cyprus_tz)

        return cyprus_dt

class VerifyLogin(MethodResource, Resource):

    db = None
    mail = None
 
    def __init__(self, db, mail):
        self.db = db
        self.mail = mail
    
    

    @doc(tags=['account'],
         description='Verify login token',
         responses={
             "200": {},
             "422.a": {"description": "This one time pin is invalid"},
             "422.b": {"description": "This one time pin has expired"},
         })
    @use_kwargs({
        'email': fields.Str(),
        'token': fields.Str(),
    })
    @catch_exception
    def post(self, **kwargs):

        user = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})
        otp = self.db.get(self.db.tables["UserOtp"], {"user_id": user[0].id})
        
        # token = self.get(self.db.tables["User"],{"att"})
        print(user[0].attempts)
        if len(otp) < 1:
            return "", "422 This one time pin is invalid."

        # Verify token
        if not verify_otp(kwargs["token"], otp[0].token):

            return "", "422 This one time pin is invalid."
        token_timestamp = otp[0].timestamp.timestamp()

        
        token_timestamp = convert_to_cyprus_time(token_timestamp)
        print(token_timestamp)
        token_timestamp=token_timestamp.timestamp()
        now_timestamp = datetime.now().timestamp()
        print(now_timestamp)
        if now_timestamp - token_timestamp > 120:
            return "", "422 This one time pin has expired."

        # delete token if valid
        self.db.delete(self.db.tables["UserOtp"], {"id": otp[0].id})

        access_token_expires = timedelta(hours=4)
        refresh_token_expires = timedelta(hours=4)
        access_token = create_access_token(identity=str(user[0].id), expires_delta=access_token_expires)
        refresh_token = create_refresh_token(identity=str(user[0].id), expires_delta=refresh_token_expires)

        response = make_response({
            "user": user[0].id,
        })

        now = datetime.now()

        
        response = set_cookie(request, response, "access_token_cookie", access_token, now + timedelta(days=1))
        response = set_cookie(request, response, "refresh_token_cookie", refresh_token, now + timedelta(days=365))

        return response
