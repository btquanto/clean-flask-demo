# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, current_app as app, redirect
from jinja2 import TemplateNotFound
from core.response import json_response

node = Blueprint("api", __name__, template_folder="templates")

@node.route("/")
def index():
    return json_response({ "success": True })

@node.route("/auth/sessions", methods=["POST", "DELETE"])
def create_session():
    """Handle login session

        * Method: POST
            * Params:
                @username: The user's username
                @password: The user's password
            * Returns:
                + HTTP code:
                    - 200: If creating login session succeeds
                    - 401: If creating login session fails
                + JSON:
                    - jwt_token: The jwt token for subsequent authorization
                    - error: The error message if creating login session fails
    """

    username = request.values.get("username", None)
    password = request.values.get("password", None)

    if not username and password:
        return json_response({ "error": "missing_params" }, 401)

    try:
        user = User.query.filter_by(username=username).scalar()
    except MultipleResultsFound:
        return json_response({ "error" : "duplicated_users_found" }, 401)
    except Exception as e:
        app.logger.error(e)
        return json_response({ "error" : "server_error" }, 401)

    if user is None:
        return json_response({ "error" : "user_not_found" }, 401)

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return json_response({ "error" : "password_mismatched" }, 401)

    auth_key = user.gen_auth_key()
    db.session.commit()

    return json_response({ "success" : True, "auth_key": auth_key })