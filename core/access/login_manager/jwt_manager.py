# -*- coding: utf-8 -*-
'''
    .access.login_manager
    -------------------------
    The JWTManager class

    JWT Flow

    * Login:

    1. Client: POST /login { username, password }
    2. Server: user = User.query.filter(username=username)
    3. Server: user.validate(password)
    4. Server: auth_key = user.gen_auth_key()
    5. Server: return jwt_token = jwt.encode(auth_key, secret)
    6. Client: localStorage["jwt_token"] = jwt_token

    * Authenticate:

    1. Client: POST /api/do_something -H Authorization: Bearer localStorage["jwt_token"]
    2. Server: auth_key = jwt.decode(jwt_token, secret)
    3. Server: user = User.query.filter(auth_key=auth_key)
    4. Server: return do_something() if user else 403

'''
import jwt
from functools import wraps
from types import SimpleNamespace as Dummy
from werkzeug.local import LocalProxy
from flask import (has_request_context, current_app as app, request, session, jsonify)

# Find the stack on which we want to store the database connection.
# Starting with Flask 0.9, the _app_ctx_stack is the correct one,
# before that we need to use the _request_ctx_stack.
try:
    from flask import _app_ctx_stack as stack
except ImportError:
    from flask import _request_ctx_stack as stack

from .mixins import AnonymousUserMixin

class JWTManager(object):

    def __init__(self, app=None):
        self.user = LocalProxy(lambda: self._load_current_user())
        self.blueprints = {}
        self.anonymous_user = AnonymousUserMixin()

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self._secret_key = app.config['SECRET_KEY']
        self._auth_prefix = app.config.get('JWT_AUTH_HEADER_PREFIX') or 'Bearer'
        self._auth_algorithm = app.config.get('JWT_ALGORITHM') or 'HS256'

    def _set_callback(self, name, func, blueprint=None):
        if blueprint:
            _blueprint = self.blueprints.get(blueprint, Dummy())
            setattr(_blueprint, name, func)
            self.blueprints[blueprint] = _blueprint
        else:
            setattr(self, name, func)

    def _get_callback(self, name, blueprint=None):
        if blueprint:
            _blueprint = self.blueprints.get(blueprint, None)
            func = getattr(_blueprint, name, None)
        return func or getattr(self, name, None)

    def _load_current_user(self):
        user = self.reload_user()
        if user is None:
            return self.anonymous_user
        return user

    def _callback(self, callback, blueprint):
        def decorator(func):
            @wraps
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            self._set_callback(callback, func, blueprint)
            return wrapper

        if callable(blueprint):
            func = blueprint
            blueprint = None
            return decorator(func)

        return decorator

    def unauthorize_callback(self, blueprint=None):
        return self._callback("_unauthorize_callback", blueprint)

    def reload_user_callback(self, blueprint=None):
        return self._callback("_reload_user_callback", blueprint)

    def login_user_callback(self, blueprint=None):
        return self._callback("_login_user_callback", blueprint)

    def user_loader(self, blueprint=None):
        return self._callback("_user_loader", blueprint)

    @property
    def unauthorized(self):
        def _unauthorize_callback():
            return jsonify({
                "success" : False
            })
        return self._get_callback('_unauthorize_callback', request.blueprint) or _unauthorize_callback

    @property
    def load_user(self):
        return self._get_callback('_user_loader', request.blueprint) or (lambda : self.anonymous_user)

    @property
    def reload_user(self):
        def _reload_user_callback():
            auth_header = request.headers.get('Authorization', None)
            if auth_header:
                prefix, jwt_token = auth_header.split()
                if prefix is self._auth_prefix and jwt_token:
                    try:
                        payload = jwt.decode(jwt_token, self._secret_key, algorithms=[self._auth_algorithm])
                        user = self.load_user(payload)
                        if user is not None:
                            return user
                    except jwt.InvalidTokenError:
                        pass

            return self.anonymous_user

        return self._get_callback('_reload_user_callback', request.blueprint) or _reload_user_callback

    def generate_token(self, user):
        def _token_generator(user):
            auth_key = user.auth_key
            return jwt.encode({ "auth_key" : auth_key }, self._secret_key, algorithms=[self._auth_algorithm])
        pass

    def jwt_required(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if self.user.is_authenticated:
                return func(*args, **kwargs)
            return self.unauthorized()
        return wrapper
