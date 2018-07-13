# -*- coding: utf-8 -*-
import eventlet, logging
from flask import Flask, redirect, url_for, send_from_directory
from app import db, lm, session
from app import blueprints
from app.models import User
from core.reverse_proxied import ReverseProxied

# Configuration
eventlet.monkey_patch()

app = Flask(__name__)
app.config.from_object("config.default")
try:
    app.config.from_object("config.local")
except Exception as ignored:
    pass
app.wsgi_app = ReverseProxied(app.wsgi_app)

# SQLAlchemy
db.init_app(app)

# Flask-Session
session.init_app(app)

# Login Managers
def load_user_by_id(user_id):
    from flask import current_app as app
    app.logger.debug("Loading user")
    user = User.query.get(user_id)
    app.logger.debug(user)
    return user

lm.init_app(app, with_session=True)
lm.user_loader(load_user_by_id)

# Register blueprints
app.register_blueprint(blueprints.api.node, url_prefix="/api")

# Logger
gunicornLogging = logging.getLogger('gunicorn.error')
fileLogging = logging.FileHandler('logs/flask.log')

app.logger.handlers.extend(gunicornLogging.handlers)
app.logger.addHandler(fileLogging)
app.logger.addHandler(logging.StreamHandler())

app.logger.setLevel(logging.DEBUG)

# Default route
@app.route('/')
def bootstrap():
    return redirect('/app/')