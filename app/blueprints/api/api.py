# -*- coding: utf-8 -*-
from flask import Blueprint, request, current_app as app

from app import jwtm
from core.response import json_response

node = Blueprint("api", __name__, template_folder="templates")

@node.route("/")
def index():
    return json_response({ "success": True })

@node.route("/sessions", methods=["GET", "POST", "DELETE"])
def resource_sessions():
    from .resources import sessions

    if request.method == "GET":
        return sessions.get()

    if request.method == "POST":
        return sessions.post()

    if request.method == "DELETE":
        return sessions.delete()

@node.route("/users", methods=["POST", "DELETE"])
def resource_users():
    from .resources import users

    if request.method == "POST":
        return users.post()

    if request.method == "DELETE":
        return users.delete()


@jwtm.unauthorize_callback(blueprint=node.name)
def on_authentication_failed():
    return json_response({
        "error" : "unauthorized"
    }, 401)