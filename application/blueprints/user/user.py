# -*- coding: utf-8 -*-
import bcrypt

from flask import Blueprint, render_template, jsonify, request
from jinja2 import TemplateNotFound
from sqlalchemy.orm.exc import MultipleResultsFound

from .. import app, db
from ...models import User

node = Blueprint("user", __name__, template_folder="templates")

@node.route("/register", methods=['GET', 'POST'])
def register():
    username = request.values.get("username", None)
    password = request.values.get("password", None)

    if not username and password:
        return jsonify({
            "success" : False,
            "error" : "missing_params"
        })

    if User.query.filter_by(username=username).first() is not None:
        return jsonify({
            "success" : False,
            "error" : "user_already_existed"
        })

    user = User()
    user.username = username
    user.password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    db.session.add(user)
    db.session.commit()

    return jsonify({"success" : True})

@node.route('/login', methods=['POST'])
def login():
    username = request.values.get("username", None)
    password = request.values.get("password", None)

    if not username and password:
        return jsonify({
            "success" : False,
            "error" : "missing_params"
        })
    
    try:
        user = User.query.filter_by(username=username).scalar()
    except MultipleResultsFound:
        return jsonify({
            "success" : False,
            "error" : "duplicated_users_found"
        })
    except Exception as e:
        app.logger.error(e)
        return jsonify({
            "success" : False,
            "error" : "server_error"
        })

    if user is None:
        return jsonify({
            "success" : False,
            "error" : "user_not_found"
        })

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return jsonify({
            "success" : False,
            "error" : "password_mismatched"
        })
        
    return jsonify({"success" : True})