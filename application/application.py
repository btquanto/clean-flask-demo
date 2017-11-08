# -*- coding: utf-8 -*-
# Libraries
from flask import Flask

from flask_login import LoginManager
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from .core.access import RBAC, LoginManager as APILoginManager
from .core.elastic import FlaskElasticsearch

# The application
app = Flask(__name__)

# Flask plugins
db = SQLAlchemy()
lm = LoginManager()
apilm = APILoginManager()
session = Session()
rbac = RBAC()
es = FlaskElasticsearch()