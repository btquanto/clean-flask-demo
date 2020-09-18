# -*- coding: utf-8 -*-
# Libraries
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from core.access import RBAC, LoginManager

# Flask plugins
db = SQLAlchemy()
login_manager = LoginManager()
session = Session()
rbac = RBAC()