# -*- coding: utf-8 -*-
from os.path import abspath, dirname

# Application configuration
DEBUG = False
SECRET_KEY = "secret"
HOST = "127.0.0.1"
DOMAIN = "localhost"
PORT = 8000

# Google APIs
GOOGLE_DEVELOPER_KEY = ""

JSON_AS_ASCII = False

# Flask-Session
SESSION_TYPE = "filesystem"
SESSION_PERMANENT = True

# Sql Alchemy
SQLALCHEMY_DATABASE_URI = "postgres://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(
    dbhost="postgres",
    dbname="flask-skeleton",
    dbusername="flask-skeleton",
    dbpassword="mysecretpassword")

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_POOL_SIZE = 10
SQLALCHEMY_POOL_TIMEOUT = -1

# Role-based access control
RBAC_DENY_ALL_BY_DEFAULT = False

# JWT Configuration
REFRESH_TOKEN_EXPIRATION = 24 # hours
JWT_EXPIRATION = 3600 # seconds
JWT_AUTH_HEADER_PREFIX = "Bearer"
JWT_ALGORITHM = "HS256"