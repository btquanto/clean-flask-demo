# -*- coding: utf-8 -*-
from flask import Blueprint, request, current_app as app

from app import jwtm
from core.response import json_response

node = Blueprint("api", __name__, template_folder="templates")

@node.route("/")
def index():
    return json_response({ "success": True })

@node.route("/sessions", methods=["POST", "DELETE"])
def resource_sessions():
    from .resources import sessions

    if request.method == "POST":
        return sessions.post()

    if request.method == "DELETE":
        return sessions.delete()

@node.route("/test", methods=["GET"])
def test():
    from .resources import test

    if request.method == "GET":
        return test.get()


@jwtm.unauthorize_callback(blueprint=node.name)
def on_authentication_failed():
    return json_response({
        "error" : "unauthorized"
    }, 401)