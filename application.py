# -*- coding: utf-8 -*-
from flask import Flask, redirect, url_for, send_from_directory

from app import db, lm, apilm, session, rbac, es
from app.blueprints import user, home
from app.models import User, Role
from core.reverse_proxied import ReverseProxied
from application.blueprints import home, user, pennytrail

# Configuration
app = Flask(__name__)
app.config.from_object("config.flaskconfig")
app.wsgi_app = ReverseProxied(app.wsgi_app)

# SQLAlchemy
db.init_app(app)

# Flask-Session
session.init_app(app)

# Login Managers
def user_loader(user_id):
    return User.get(user_id)

lm.init_app(app)
lm.user_loader(user_loader)

apilm.init_app(app, with_session=True)
apilm.user_loader(user_loader)

# RBAC
rbac.init_app(app)
rbac.role_model(Role)
rbac.user_model(User)

# Elastic Search
es.init_app(app)

# Register blueprints

app.register_blueprint(home.node, url_prefix="/home")
app.register_blueprint(user.node, url_prefix="/user")
app.register_blueprint(pennytrail.node, url_prefix="/pennytrail")

# Default route
@app.route('/')
def bootstrap():
    return redirect('/home/index')

if __name__ == '__main__':
    app.run(host=app.config['HOST'],
            port=app.config['PORT'],
            debug=True)
