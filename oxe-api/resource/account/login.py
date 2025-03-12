from flask import render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_bcrypt import check_password_hash
from flask_restful import Resource
from utils.token import generate_otp, hash_otp
from utils.mail import send_email
from webargs import fields
from datetime import datetime, timedelta
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class Login(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['account'],
         description='Create an access and a refresh cookie by log in with an email and a password',
         responses={
             "200": {},
             "401.a": {"description": "Wrong email/password combination"},
             "401.b": {"description": "This account is not active. Please check your email for an activation link."},
         })
    @use_kwargs({
        'email': fields.Str(),
        'password': fields.Str(),
    })
    @catch_exception
    def post(self, **kwargs):

        #we add a try catch when user either delete his account and try to login again.
        try:
            data = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})
           
           #initialize error_date with current time when we first create the columns
           #error_date is responsible for when the user put wrong password to count how many minutes has passed.

            if data[0].error_date=='0000-00-00 00:00:00':
                self.db.merge({
                        "id": data[0].id,
                        "error_date": datetime.now(),
                    }, self.db.tables["User"])
            current_datetime=data[0].error_date

            #we update the date_login with the current time in order to subtract with the
            self.db.merge({
                    "id": data[0].id,
                    "date_login": datetime.now(),
                }, self.db.tables["User"])

        # If the user is not found, we simulate the whole process with a blank password.
        # This is done to limit the time discrepancy factor against the user enumeration exploit
        # CF: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

            password = data[0].password if len(data) > 0 else "Imp0ssiblePassword~~"
            
            if not check_password_hash(password, kwargs['password']):

                #get the latest updated days
                data = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})

                #check if the user fail less than 5 times we just update the attempts column
                if data[0].attempts<5:
                    self.db.merge({
                        "id": data[0].id,
                        "attempts": data[0].attempts+1,
                    }, self.db.tables["User"])
                    print(data[0].attempts)
                #if the user failed 5 times we get the error date and the current time subtract them and if the time that has pass between them is more 
                # than 30 minutes (1800 seconds) then we 0 the attempts and update the error date with the current time
                #otherwise we either return wrong password or too many failed attempts based on we we have
                elif data[0].attempts==5:
                    print("uyayyy")
                    # print(type(current_datetime))
                    error_date= data[0].error_date
                    date_login=data[0].date_login
                    timestamp_difference = error_date.timestamp() - date_login.timestamp()
                    print("The difference in timestamps is:", timestamp_difference)

                    if abs(error_date.timestamp()-date_login.timestamp())>120:
                        self.db.merge({
                            "id": data[0].id,
                            "attempts": 0,
                        }, self.db.tables["User"])
                    
                    if data[0].attempts==0:
                        self.db.merge({
                            "id": data[0].id,
                            "error_date": datetime.now(),
                        }, self.db.tables["User"])
                        
                        return "", "401 Wrong email/password combination"
                    else:
                        return "","401 Too many failed attempts. Your account is blocked for 30 minutes."
                

                return "", "401 Wrong email/password combination"
            #here we do the same thing but when the user succefully put the correct password but has already been locked from his/her account
            elif data[0].attempts==5:
                    error_date= data[0].error_date
                    date_login=data[0].date_login
                    timestamp_difference = error_date.timestamp() - date_login.timestamp()
                    print("The difference in timestamps is:", timestamp_difference)

                    if abs(error_date.timestamp()-date_login.timestamp())>120:
                        self.db.merge({
                            "id": data[0].id,
                            "attempts": 0,
                        }, self.db.tables["User"])
                    
                    if data[0].attempts==0:
                        self.db.merge({
                            "id": data[0].id,
                            "error_date": datetime.now(),
                        }, self.db.tables["User"])
                    else:
                        return "","401 Too many failed attempts. Your account is blocked for 30 minutes."

            if not data[0].is_active:
                return "", "401 This account is has been disabled."

            if not data[0].is_admin and data[0].status == "NEW":
                return "", "401 This account is not active. Please check your email for an activation link."

        except:
            return "", "401 Please create an account. This email does not exist in our database."
    
        # delete old otp if exists
        old_otp = self.db.get(self.db.tables["UserOtp"], {"user_id": data[0].id})
        if len(old_otp) > 0:
            self.db.delete(self.db.tables["UserOtp"], {"user_id": data[0].id})

        # create new otp
        otp = generate_otp()
        self.db.insert({
            "token":  hash_otp(otp),
            "user_id": data[0].id,
        }, self.db.tables["UserOtp"])


        # send otp to user
        send_email(self.mail,
            subject=f"Login One Time Pin",
            recipients=[kwargs["email"]],
            html_body=render_template(
                'login_otp.html',
                email=kwargs["email"],
                token=otp,
            )
        )

        return {}, "200 "
