# -*- coding: utf-8 -*-
# Libraries
import os
from importlib import import_module
from flask import Flask
from flask import redirect, url_for

from core.reverse_proxied import ReverseProxied
from core import db, login_manager, session, rbac
from .config.urls import blueprints, default_route

# Constants
CONFIGURATION_FILE = "config/settings.py"

# Create the application
app = Flask(__name__)
app.config.from_pyfile(CONFIGURATION_FILE, silent=False)
app.wsgi_app = ReverseProxied(app.wsgi_app)

# /*** Initializing Flask plugins

# SQLAlchemy
db.init_app(app)

for dirpath, _, filenames in os.walk('application/models'):
    for filename in filenames:
        if filename.endswith("py") and not filename in ['__init__.py']:
            path = os.path.join(dirpath, os.path.splitext(filename)[0])
            import_module(path.replace(os.sep, '.'))

# Flask-Login
# from .core.access import load_user
# login_manager.init_app(app)
# login_manager.user_loader(load_user)

rbac.init_app(app)
from .models.user import User
from .models.role import Role
rbac.role_model(Role)
rbac.user_model(User)

# Flask-Session
session.init_app(app)
# ***/

# Register blueprints
for blueprint, prefix in blueprints:
    app.register_blueprint(blueprint, url_prefix=prefix)

# Default route
@app.route('/')
def bootstrap():
    return redirect(default_route)