# -*- coding: utf-8 -*-
# Libraries
from flask import Flask
from flask import redirect, url_for

from .core.reverse_proxied import ReverseProxied

from .core import db, login_manager, session, rbac
from .core.reverse_proxied import ReverseProxied

# Constants
CONFIGURATION_FILE = "config/flaskconfig.py"

# Create the application
app = Flask(__name__)
app.config.from_pyfile(CONFIGURATION_FILE, silent=True)
app.wsgi_app = ReverseProxied(app.wsgi_app)

# /*** Initializing Flask plugins

# SQLAlchemy
db.init_app(app)

# Flask-Login
from .core.access import load_user
login_manager.init_app(app)
login_manager.user_loader(load_user)

# RBAC
rbac.init_app(app)
from .models import User, Role
rbac.role_model(Role)
rbac.user_model(User)

# Flask-Session
session.init_app(app)
# ***/

# Register blueprints
from .blueprints import home
app.register_blueprint(home.node, url_prefix="/home")

# Default route
@app.route('/')
def bootstrap():
    return redirect('/home/index')