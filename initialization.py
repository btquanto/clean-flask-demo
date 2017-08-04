# -*- coding: utf-8 -*-
from flask import redirect, url_for

from application import app, db, login_manager, session, rbac
from application.models import User, Role
from application.core.access import load_user
from application.core.reverse_proxied import ReverseProxied
from application.blueprints import home

# Constants
CONFIGURATION_FILE = "config/flaskconfig.py"

# Configuration
app.config.from_pyfile(CONFIGURATION_FILE, silent=False)
app.wsgi_app = ReverseProxied(app.wsgi_app)

# SQLAlchemy
db.init_app(app)

# Flask-Login
login_manager.init_app(app)
login_manager.user_loader(load_user)

# Flask-Session
session.init_app(app)

# RBAC
rbac.init_app(app)
rbac.role_model(Role)
rbac.user_model(User)

# Register blueprints
app.register_blueprint(home.node, url_prefix="/home")

# Default route
@app.route('/')
def bootstrap():
    return redirect('/home/index')

if __name__ == '__main__':
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=True)
