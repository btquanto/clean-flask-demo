# -*- coding: utf-8 -*-
# Monkey patch
# from gevent import monkey
import eventlet, logging
from flask import Flask, redirect, url_for, send_from_directory
from app import db, lm, jwtm, session, rbac, es, socketio
from app.blueprints import user, home, rtc, admin, api
from app.models import User, Role
from core.reverse_proxied import ReverseProxied

# Configuration
eventlet.monkey_patch()
# monkey.patch_all()

app = Flask(__name__)
app.config.from_object("config.flaskconfig")
app.wsgi_app = ReverseProxied(app.wsgi_app)

# SQLAlchemy
db.init_app(app)

# SocketIO
socketio.init_app(app, async_mode='eventlet')

# Flask-Session
session.init_app(app)

# Login Managers
def user_loader(user_id):
    return User.query.filter_by(id=user_id).scalar()

lm.init_app(app, with_session=True)
lm.user_loader(user_loader)

# JWT Manager
def jwt_user_loader(payload):
    auth_key = payload["auth_key"]
    user = User.query.filter_by(auth_key=auth_key).scalar()
    return user if user and not user.is_token_expired() else None

jwtm.init_app(app)
jwtm.user_loader(jwt_user_loader)

# RBAC
rbac.init_app(app)
rbac.role_model(Role)
rbac.user_model(User)

# Elastic Search
es.init_app(app)

# Register blueprints
app.register_blueprint(admin.node, url_prefix="/admin")
app.register_blueprint(api.node, url_prefix="/api")
app.register_blueprint(home.node, url_prefix="/home")
app.register_blueprint(user.node, url_prefix="/user")
app.register_blueprint(rtc.node, url_prefix="/rtc")

# Logger
logger = logging.getLogger('gunicorn.error')
app.logger.handlers.extend(logger.handlers)
app.logger.setLevel(logging.INFO)

# Default route
@app.route('/')
def bootstrap():
    return redirect('/home/')

@app.route('/nodes/<path:filename>')
def nodes_static(filename):
    return send_from_directory(app.root_path + '/node_modules/', filename)

if __name__ == '__main__':
    import logging
    logging.getLogger('socketIO-client').setLevel(logging.INFO)
    logging.basicConfig(filename='logs/flask.log',level=logging.DEBUG)

    socketio.run(app=app,
                    debug=True,
                    host=app.config['HOST'],
                    port=app.config['PORT'])
