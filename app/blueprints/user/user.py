# -*- coding: utf-8 -*-
import bcrypt

from flask import Blueprint, render_template, jsonify, request, current_app as app, session
from jinja2 import TemplateNotFound
from sqlalchemy.orm.exc import MultipleResultsFound

from app import db, lm
from app.models import User

node = Blueprint("user", __name__, template_folder="templates")

def handle_register():
    fullname = request.values.get("fullname", None)
    username = request.values.get("username", None)
    email = request.values.get("email", None)
    password = request.values.get("password", None)

    if not [param for param in [fullname, username, email, password] if param]:
        return {
            "success" : False,
            "error" : "missing_params"
        }

    if User.query.filter_by(username=username).first() is not None:
        return {
            "success" : False,
            "error" : "user_already_existed"
        }

    user = User()
    user.fullname = fullname
    user.username = username
    user.email = email
    user.password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    db.session.add(user)
    db.session.commit()

    return {"success" : True}

def handle_login():
    username = request.values.get("username", None)
    password = request.values.get("password", None)

    if not username and password:
        return {
            "success" : False,
            "error" : "missing_params"
        }, None

    try:
        user = User.query.filter_by(username=username).scalar()
    except MultipleResultsFound:
        return {
            "success" : False,
            "error" : "duplicated_users_found"
        }, None
    except Exception as e:
        app.logger.error(e)
        return {
            "success" : False,
            "error" : "server_error"
        }, None

    if user is None:
        return {
            "success" : False,
            "error" : "user_not_found"
        }, None

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return {
            "success" : False,
            "error" : "password_mismatched"
        }, None

    auth_key = user.gen_auth_key()
    db.session.commit()

    return {
        "success" : True,
        "auth_key": auth_key
    }, user

def handle_refresh_token():
    user = lm.user
    auth_key = user.refresh_token()
    if auth_key:
        return {
            "success" : True,
            "auth_key": auth_key
        }

    return {
        "success": False,
        "error": "Failed to refresh token"
    }

@node.route("/api/register", methods=['GET', 'POST'])
def api_register():
    return jsonify(handle_register())

@node.route('/api/login', methods=['GET', 'POST'])
def api_login():
    response, user = handle_login()
    return jsonify(response)

@node.route('/login', methods=['GET', 'POST'])
def login():
    response, user = handle_login()

    if(user is not None):
        lm.login_user(user, True)

    return jsonify(response)

@node.route('/api/refresh_token', methods=['GET', 'POST'])
@lm.login_required
def refresh_token():
    return jsonify(handle_refresh_token())