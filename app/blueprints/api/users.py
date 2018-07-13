import bcrypt
from datetime import datetime, timedelta

from flask import request, current_app as app
from sqlalchemy.orm.exc import MultipleResultsFound

from core.response import json_response
from app import db
from app.models import User

from . import node

@node.route("/users", methods=['POST'])
def register():
    """Create a new user

        * Params:
            @fullname: The user's fullname
            @username: The user's username
            @email: The user's email
            @password: The user's password

        * Returns:
            + HTTP code:
                - 200: If creating new user succeeds
                - 400: If creating user fails due to some errors
            + JSON:
                - jwt_token: The jwt token for subsequent authorization
                - error: The error message if creating user fails
    """
    fullname = request.values.get("fullname", None)
    username = request.values.get("username", None)
    email = request.values.get("email", None)
    password = request.values.get("password", None)

    if not [param for param in [fullname, username, email, password] if param]:
        return json_response({
            "error" : "missing_params"
        }, 400)

    if User.query.filter_by(username=username).first() is not None:
        return json_response({
            "error" : "user_already_existed"
        }, 400)

    user = User()
    user.fullname = fullname
    user.username = username
    user.email = email
    user.password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    db.session.add(user)
    db.session.commit()

    return json_response(user.as_dict())