import bcrypt
from datetime import datetime, timedelta

from flask import request, current_app as app
from sqlalchemy.orm.exc import MultipleResultsFound

from core.response import json_response
from app import db, lm
from app.models import User
from . import node

@node.route("/auth/status", methods=["GET"])
def status():
    user = lm.user._get_current_object()

    if user.is_authenticated:
        return json_response(user.as_dict())

    return json_response({
        "error": "UNAUTHORIZED",
        "message": "User is not logged in"
    }, 400)

@node.route("/auth/login", methods=["POST", "GET"])
def login():
    username = request.values.get("username", None)
    email = request.values.get("email", None)
    password = request.values.get("password", None)

    if not (bool(username) ^ bool(email)) and password:
        return json_response({
            "error": "VALIDATION_FAILED",
            "message": "Missing or invalid parameters"
        }, 400)

    try:
        if username:
            user = User.query.filter_by(username=username).scalar()
        else:
            user = User.query.filter_by(email=email).scalar()
    except MultipleResultsFound:
        return json_response({
            "error" : "VALIDATION_FAILED",
            "message": "Duplicated users found"
        }, 400)
    except Exception as e:
        return json_response({
            "error" : "SERVER_ERROR",
            "message": "Unhandled server error"
        }, 500)

    if user is None:
        return json_response({
            "error" : "UNAUTHORIZED",
            "message": "Invalid username or password"
        }, 400)

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return json_response({
            "error" : "UNAUTHORIZED",
            "message": "Invalid username or password"
        }, 400)

    lm.login_user(user)

    return json_response(user.as_dict())

@node.route("/auth/logout", methods=["GET", "POST"])
def logout():
    lm.logout()
    return json_response({}, 204)
