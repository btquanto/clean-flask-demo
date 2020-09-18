# -*- coding: utf-8 -*-
'''
    .access.login_manager
    -------------------------
    The LoginManager class
    Inspired from the plugin Flask-Login, added with a few customizations
    Allows Flask to have multiple instances of LoginManager
    Needs more works in order to be more secured
'''
from functools import wraps
from types import SimpleNamespace as Dummy
from werkzeug.local import LocalProxy
from flask import (has_request_context, current_app as app, request, session, jsonify)

# Find the stack on which we want to store the user
# Starting with Flask 0.9, the _app_ctx_stack is the correct one,
# before that we need to use the _request_ctx_stack.
try:
    from flask import _app_ctx_stack as stack
except ImportError:
    from flask import _request_ctx_stack as stack

from .mixins import AnonymousUserMixin

class LoginManager(object):

    def __init__(self, app=None):
        self.id = str(self.__hash__())
        self.user = LocalProxy(lambda: self._load_user_from_context())
        self.blueprints = {}
        self.anonymous_user = AnonymousUserMixin()

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self._secret_key = app.config['SECRET_KEY']

    def _load_user_from_context(self):
        data = getattr(stack.top, self.id, {}) if has_request_context() else {}
        user = data.get("user", None) or self._reload_user() or self.anonymous_user
        return user

    def _save_user_to_context(self, user):
        data = getattr(stack.top, self.id, {}) if has_request_context() else {}
        data['user'] = user
        setattr(stack.top, self.id, data)

    def _set_callback(self, name, func, blueprint=None):
        if blueprint:
            _blueprint = self.blueprints.get(blueprint, Dummy())
            setattr(_blueprint, name, func)
            self.blueprints[blueprint] = _blueprint
        else:
            setattr(self, name, func)

    def _get_callback(self, name, blueprint=None, default=None):
        if blueprint:
            _blueprint = self.blueprints.get(blueprint, None)
            func = getattr(_blueprint, name, None)
        return func or getattr(self, name, None) or default

    def _callback(self, func, callback, blueprint):
        def decorator(_func):
            @wraps
            def wrapper(*args, **kwargs):
                return _func(*args, **kwargs)
            self._set_callback(callback, _func, blueprint)
            return wrapper

        if func is not None:
            return decorator(func)
        return decorator

    def unauthorized_response(self, *args, blueprint=None):
        func, = args or (None,)
        return self._callback(func, "_unauthorized_response", blueprint)

    def user_loader(self, *args, blueprint=None):
        func, = args or (None,)
        return self._callback(func, "_user_loader", blueprint)

    def user_reloader(self, *args, blueprint=None):
        func, = args or (None,)
        return self._callback(func, "_user_reloader", blueprint)

    def login_handler(self, *args, blueprint=None):
        func, = args or (None,)
        return self._callback(func, "_login_handler", blueprint)

    def after_login(self, *args, blueprint=None):
        func, = args or (None,)
        return self._callback(func, "_after_login", blueprint)

    @property
    def _load_user(self):
        return self._get_callback('_user_loader', request.blueprint, lambda : self.anonymous_user)

    @property
    def _reload_user(self):
        def _user_reloader():
            _session = self.session
            user_id = _session.get('current_user_id', None)
            if user_id is not None:
                user = self._load_user(user_id)
                if user is not None:
                    stack.top.user = user
                    return user
            return self.anonymous_user
        return self._get_callback('_user_reloader', request.blueprint, _user_reloader)

    @property
    def session(self):
        # Every login_manager instance should have its own session
        _session = session.get(self.id, {})
        session[id] = _session
        return session

    @property
    def _unauthorize_response(self):
        def _unauthorized_response():
            return jsonify({
                "code" : "Unauthorized",
                "message": "User is not authenticated"
            })
        return self._get_callback('_unauthorized_response', request.blueprint, _unauthorized_response)

    @property
    def login(self):
        def _login_handler(user):
            self._save_user_to_context(user)
            _session = self.session
            _session['current_user_id'] = user.get_id()

        def _after_login(*args, **kwargs):
            pass

        login_handler = self._get_callback('_login_handler', request.blueprint, _login_handler)
        after_login = self._get_callback('_after_login', request.blueprint, _after_login)

        def _login(*args, **kwargs):
            login_handler(*args, **kwargs)
            after_login(*args, **kwargs)

        return _login

    def logout(self):
        session.clear()
        self._save_user_to_context(self.anonymous_user)

    def login_required(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if self.user.is_authenticated:
                return func(*args, **kwargs)
            return self._unauthorize_response()
        return wrapper
