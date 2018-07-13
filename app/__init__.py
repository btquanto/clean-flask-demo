# -*- coding: utf-8 -*-
# Libraries
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from core.access import LoginManager

# Flask plugins
db = SQLAlchemy()
lm = LoginManager()
session = Session()