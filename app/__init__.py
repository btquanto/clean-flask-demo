# -*- coding: utf-8 -*-
# Libraries
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from core.access import RBAC, LoginManager, JWTManager
from core.elastic import FlaskElasticsearch

# Flask plugins
db = SQLAlchemy()
lm = LoginManager()
jwtm = JWTManager()
session = Session()
rbac = RBAC()
es = FlaskElasticsearch()
socketio = SocketIO()