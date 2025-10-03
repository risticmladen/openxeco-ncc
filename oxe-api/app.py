from flask import Flask, redirect
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_restful import Api
from sqlalchemy.engine.url import URL
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from flask_apispec.extension import FlaskApiSpec
from datetime import timedelta

from seeder.seeder import DatabaseSeeder
from utils.re import has_mail_format
from utils.resource import get_admin_post_resources

from db.db import DB

import socket
import sys

from config import config  # pylint: disable=wrong-import-position

# Manage DB connection
db_uri = URL(**config.DB_CONFIG)

# Init Flask and set config
app = Flask(__name__, template_folder="template")
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {}
app.config["ERROR_404_HELP"] = False

app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=4)
app.config["JWT_TOKEN_LOCATION"] = ['headers', 'cookies', 'query_string']
app.config["JWT_COOKIE_SECURE"] = config.ENVIRONMENT != "dev"
app.config['JWT_COOKIE_CSRF_PROTECT'] = False

app.config['CORS_HEADERS'] = 'Content-Type'
app.config["CORS_SUPPORTS_CREDENTIALS"] = True
app.config["CORS_ORIGINS"] = config.CORS_ORIGINS if config.CORS_ORIGINS else []

app.config['MAIL_SERVER'] = config.MAIL_SERVER
app.config['MAIL_PORT'] = config.MAIL_PORT
app.config['MAIL_USERNAME'] = config.MAIL_USERNAME
app.config['MAIL_PASSWORD'] = config.MAIL_PASSWORD
app.config['MAIL_USE_TLS'] = config.MAIL_USE_TLS == "True"
app.config['MAIL_USE_SSL'] = config.MAIL_USE_SSL == "True"
app.config['MAIL_DEFAULT_SENDER'] = config.MAIL_DEFAULT_SENDER

app.config['PROPAGATE_EXCEPTIONS'] = True

app.config['SESSION_COOKIE_SECURE'] = True

app.config['SCHEDULER_API_ENABLED'] = False

app.config['APISPEC_SWAGGER_URL'] = '/doc/json'
app.config['APISPEC_SWAGGER_UI_URL'] = '/doc'
app.config['APISPEC_SPEC'] = APISpec(
    title='openXeco API',
    version='v1.15',
    plugins=[MarshmallowPlugin()],
    openapi_version='2.0.0'
)

# Create DB instance
db = DB(app)

# Add additional plugins
cors = CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
mail = Mail(app)
docs = FlaskApiSpec(app)

# Init and set the resources for Flask
api = Api(app)

app.logger.info("Booting OpenXeco API on Render")


@app.route('/<generic>')
def undefined_route(generic):
    return '', 404


@app.route('/')
def root_route():
    return redirect("/doc", code=302)


def create_initial_admin(email, password):
    if not has_mail_format(email):
        raise Exception("The email does not have the right format")

    if db.get_count(db.tables["User"]) > 0:
        app.logger.warning("The initial admin has been ignored as there is at least one user in the database")
        return

    admin = create_row_if_not_exists(
        db.tables["User"],
        {
            "email": email,
            "password": bcrypt.generate_password_hash(password),
            "is_active": 1,
            "is_admin": 1,
            "status": "ACCEPTED",
        },
        f"Initial user {email}"
    )

    user_group = create_row_if_not_exists(
        db.tables["UserGroup"],
        {"name": "Administrator"},
        "'Administrator' user group"
    )

    create_row_if_not_exists(
        db.tables["UserGroupAssignment"],
        {"user_id": admin.id, "group_id": user_group.id},
        "User group assignment"
    )

    app.logger.warning(f"The initial admin has been created with the following password: {password}")


def create_admin_rights():
    user_group = db.get(db.tables["UserGroup"], {"name": "Administrator"})[0]

    for resource in get_admin_post_resources(api):
        create_row_if_not_exists(
            db.tables["UserGroupRight"],
            {"group_id": user_group.id, "resource": resource},
            "User group right '/user/add_user_group_right'"
        )

    app.logger.warning(f"Admin rights have been updated")


def create_row_if_not_exists(table, row, log_base):
    copied_row = row.copy()

    if "password" in copied_row:
        del copied_row["password"]

    obj = db.get(table, copied_row)

    if len(obj) == 1:
        app.logger.info(f"{log_base} already created\n")
        obj = obj[0]
    elif len(obj) > 1:
        raise Exception("Too much objects found")
    else:
        obj = db.insert(row, table)
        app.logger.info(f"{log_base} created\n")

    return obj


def check_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(3)  # 3 second timeout
    result = sock.connect_ex(('127.0.0.1', int(config.PORT)))
    if result == 0:
        sys.exit(f"Port {config.PORT} is used, maybe you are already running a docker container?")


FILES_TO_SEED = [
    { "table":"Country", "file": "countries.csv" },
    { "table":"Expertise", "file": "expertise.csv" },
    { "table":"Industry", "file": "industries.csv" },
    { "table":"Profession", "file": "professions.csv" },
    { "table":"Domain", "file": "domains.csv" },
    { "table":"Location", "file": "locations.csv" },
    { "table":"Sector", "file": "sectors.csv" },
    { "table":"Involvement", "file": "involvement.csv" },
    { "table":"Department", "file": "departments.csv" },
]


def seed_initial_data():
    seeder = DatabaseSeeder(db)
    for file in FILES_TO_SEED:
        seeder.seed_from_csv(file["table"], file["file"])


if __name__ in ('app', '__main__'):
    # check_port()

    from routes import set_routes
    set_routes({"api": api, "db": db, "mail": mail, "docs": docs})

    if config.INITIAL_ADMIN_EMAIL:
        create_initial_admin(config.INITIAL_ADMIN_EMAIL, config.INITIAL_ADMIN_PASSWORD)

    create_admin_rights()

    seed_initial_data()

    app.debug = config.ENVIRONMENT == "dev"
    if __name__ == "__main__":
        app.run(host='0.0.0.0', port=int(config.PORT))
