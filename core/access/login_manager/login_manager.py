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

    def __init__(self, app=None, with_session=True):
        self.user = LocalProxy(lambda: self._load_current_user())
        self.blueprints = {}
        self.anonymous_user = AnonymousUserMixin()

        if app is not None:
            self.init_app(app, with_session)

    def init_app(self, app, with_session=True):
        self._secret_key = app.config['SECRET_KEY']
        self._with_session = with_session

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

    def _load_current_user(self):
        app.logger.debug("Load Current User")
        if has_request_context() and not hasattr(stack.top, 'user'):
            app.logger.debug("Doesn't have user in stack")
            user = self.reload_user()
            if user is None:
                app.logger.debug("Failed to reload user")
                return self.anonymous_user
            app.logger.debug("Reload user succeeded")
            return user
        return getattr(stack.top, 'user', self.anonymous_user)

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

    def unauthorize_callback(self, *args, blueprint=None):
        func, = args or None,
        return self._callback(func, "_unauthorize_callback", blueprint)

    def reload_user_callback(self, *args, blueprint=None):
        func, = args or None,
        return self._callback(func, "_reload_user_callback", blueprint)

    def login_user_callback(self, *args, blueprint=None):
        func, = args or None,
        return self._callback(func, "_login_user_callback", blueprint)

    def user_loader(self, *args, blueprint=None):
        func, = args or None
        return self._callback(func, "_user_loader", blueprint)

    @property
    def session(self):
        # _session = session.get(self.__hash__(), {})
        # session[self.__hash__()] = _session
        return session

    @property
    def unauthorized(self):
        def _unauthorize_callback():
            return jsonify({
                "success" : False
            })
        return self._get_callback('_unauthorize_callback', request.blueprint, _unauthorize_callback)

    @property
    def load_user(self):
        return self._get_callback('_user_loader', request.blueprint, lambda : self.anonymous_user)

    @property
    def reload_user(self):
        def _reload_user_callback():
            app.logger.debug("With Session? {withSession}".format(withSession=self._with_session))
            if self._with_session:
                _session = self.session
                user_id = _session.get('user_id', None)
                app.logger.debug("User ID: {user_id}".format(user_id=user_id))
                if user_id is not None:
                    app.logger.debug(self.load_user)
                    app.logger.debug(user_id)
                    user = self.load_user(user_id)
                    if user is not None:
                        stack.top.user = user
                        return user
            return self.anonymous_user
        return self._get_callback('_reload_user_callback', request.blueprint, _reload_user_callback)

    @property
    def login_user(self):
        def _login_user_callback(user, remember=False):
            stack.top.user = user
            _session = self.session
            _session['user_id'] = user.get_id()
            _session['remember'] = remember
            return user
        return self._get_callback('_login_user_callback', request.blueprint, _login_user_callback)

    def logout(self):
        session.clear()
        stack.top.user = self.anonymous_user

    def login_required(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if self.user.is_authenticated:
                return func(*args, **kwargs)
            return self.unauthorized()
        return wrapper
