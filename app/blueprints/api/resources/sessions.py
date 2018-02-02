import bcrypt

from flask import request, current_app as app
from sqlalchemy.orm.exc import MultipleResultsFound

from core.response import json_response
from app import db, jwtm
from app.models import User

def post():
    """Create a new login session

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

    payload = {
        'auth_key': user.gen_auth_key()
    }
    db.session.commit()

    jwt_token = jwtm.generate_token(payload)

    return json_response({ "success" : True, "auth_key": jwt_token })

@jwtm.jwt_required
def delete():
    """Delete a login session

        * Returns:
            + HTTP code:
                - 200: If creating login sesappsion succeeds
                - 401: If creating login session fails
            + JSON:
                - jwt_token: The jwt token for subsequent authorization
                - error: The error message if creating login session fails
    """
    user = jwtm.user._get_current_object()
    user.auth_key = None
    db.session.commit()

    return json_response({
        "success" : True,
        "user": {
            "fullname": user.fullname,
            "username": user.username,
            "email": user.email,
            "auth_key": user.auth_key
        }
    })