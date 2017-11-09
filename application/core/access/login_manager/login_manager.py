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
from flask import (has_request_context, _request_ctx_stack,
                    current_app as app, request, session, jsonify)

from .mixins import AnonymousUserMixin

class LoginManager(object):

    def __init__(self, app=None, with_session=True):
        self.user = LocalProxy(lambda: self._load_current_user())
        self.blueprints = {}
        self._with_session = with_session
        self.anonymous_user = AnonymousUserMixin()

        if app is not None:
            self.init_app(app, with_session)

    def init_app(self, app, with_session=True):
        pass

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
            app.logger.info(func)
        return func or getattr(self, name, None)

    def _load_current_user(self):
        if has_request_context() and not hasattr(_request_ctx_stack.top, 'user'):
            user = self.reload_user()
            if user is None:
                return self.anonymous_user
            return user
        return getattr(_request_ctx_stack.top, 'user', self.anonymous_user)

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
    def session(self):
        _session = session.get(self.__hash__, {})
        session[self.__hash__] = _session
        return _session

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
            if self._with_session:
                _session = self.session
                user_id = _session['user_id']
                user = self.load_user(user_id)
                if user is not None:
                    return user
            return self.anonymous_user
        return self._get_callback('_reload_user_callback', request.blueprint) or _reload_user_callback

    @property
    def login_user(self):
        def _user_login_callback(user, remember):
            _request_ctx_stack.top.user = user
            self.login_user_callback(user, remember)
            return user
        return self._get_callback('_login_user_callback', request.blueprint) or _login_user_callback

    def login_required(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if self.user.is_authenticated:
                return func(*args, **kwargs)
            return self.unauthorized()
        return wrapper
