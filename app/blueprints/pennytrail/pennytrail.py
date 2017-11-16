# -*- coding: utf-8 -*-
import bcrypt

from flask import Blueprint, render_template, jsonify, request, current_app as app
from jinja2 import TemplateNotFound
from sqlalchemy.orm.exc import MultipleResultsFound

from application import db, apilm
from application.models import User

node = Blueprint("pennytrail", __name__, template_folder="templates")

@node.route("/api/index", methods=['GET', 'POST'])
def index():
    return jsonify({
        "success" : True
    })

@node.route("/api/view", methods=['GET', 'POST'])
@apilm.login_required
def view_user():
    return jsonify({
        "success" : True,
        "key" : app.config['GOOGLE_DEVELOPER_KEY'],
        "blueprint": node.name,
        "user" : {
            "username" : apilm.user.username,
            "auth" : apilm.user.auth_key
        }
    })

@apilm.reload_user_callback(blueprint=node.name)
def reload_user_callback():
    auth_key = request.values.get("auth", None)
    if auth_key:
        user = User.query.filter_by(auth_key=auth_key).scalar()
        return user
    return apilm.anonymous_user

@apilm.unauthorize_callback(blueprint=node.name)
def unauthorized_callback():
    return "You are freaking unauthorized! Get out of here!\n"