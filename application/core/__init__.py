# -*- coding: utf-8 -*-

# Flask plugins
from flask_login import LoginManager
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from .access import RBAC


# Allow server-side session
db = SQLAlchemy()
login_manager = LoginManager()
session = Session()
rbac = RBAC()
