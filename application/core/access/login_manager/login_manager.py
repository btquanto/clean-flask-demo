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
from werkzeug.local import LocalProxy
from flask import (has_request_context, _request_ctx_stack,
                    current_app, request, session, jsonify)

from .mixins import AnonymousUserMixin

class LoginManager(object):

    def __init__(self, app=None, with_session=True):
        if app is not None:
            self.init_app(app, with_session)

    def init_app(self, app, with_session=True):
        self.user = LocalProxy(lambda: self.load_current_user())
        self._with_session = with_session
        self.anonymous_user = AnonymousUserMixin()

    def unauthorize_callback(self, func):
        @wraps
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        self._unauthorize_callback = func
        return wrapper

    def reload_user_callback(self, func):
        @wraps
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        self._reload_user_callback = func
        return wrapper

    def login_user_callback(self, func):
        @wraps
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        self._login_user_callback = func
        return wrapper

    def user_loader(self, func):
        @wraps
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        self._load_user = func
        return wrapper

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
        return getattr(self, '_unauthorize_callback', _unauthorize_callback)

    @property
    def load_user(self):
        return getattr(self, '_load_user', lambda : self.anonymous_user)

    @property
    def reload_user(self):
        def _reload_user_callback():
            if self._use_session:
                _session = self.session
                user_id = _session['user_id']
                user = self.load_user(user_id)
                if user is not None:
                    return user
            return self.anonymous_user
        return getattr(self, '_reload_user_callback', _reload_user_callback)

    @property
    def login_user(self):
        def _user_login_callback(user, remember):
            _request_ctx_stack.top.user = user
            self.login_user_callback(user, remember)
            return user

        return getattr(self, '_login_user_callback', _login_user_callback)

    def load_current_user(self):
        from flask import current_app as app
        if has_request_context() and not hasattr(_request_ctx_stack.top, 'user'):
            user = self.reload_user()
            if user is None:
                return self.anonymous_user
            return user
        return getattr(_request_ctx_stack.top, 'user', self.anonymous_user)

    def login_required(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if self.user.is_authenticated:
                return func(*args, **kwargs)
            return self.unauthorized()
        return wrapper
