# -*- coding: utf-8 -*-
from flask import current_app as app, jsonify
from flask import request
from ..models import User
from ..application import db, es, lm, apilm

@apilm.reload_user_callback
def reload_user_callback():
    auth_key = request.values.get("auth", None)
    if auth_key:
        user = User.query.filter_by(auth_key=auth_key).scalar()
        return user
    return apilm.anonymous_user

@apilm.unauthorize_callback
def unauthorize_callback():
    return jsonify({
        "success" : False,
        "error" : "Access denied"
    })