import bcrypt
from datetime import datetime, timedelta

from flask import request, current_app as app
from sqlalchemy.orm.exc import MultipleResultsFound

from core.response import json_response
from app import db, jwtm
from app.models import User

@jwtm.jwt_required
def get():
    """Refresh the login session by refreshing the authentication token

        * Returns:
            + HTTP code:
                - 200: If refreshing session succeeds
                - 401: If refreshing session fails
            + JSON:
                - jwt_token: The jwt token for subsequent authorization
                - error: The error message if refreshing session fails
    """
    user = jwtm.user._get_current_object()

    payload = {
        'auth_key': user.auth_key,
        'exp': datetime.now() + timedelta(seconds=app.config['JWT_EXPIRATION'])
    }
    db.session.commit()

    jwt_token = jwtm.generate_token(payload)

    return json_response({ "auth_key": jwt_token })


def post():
    """Create a new login session

        * Params:
            @username: The user's username
            @password: The user's password

        * Returns:
            + HTTP code:
                - 200: If creating login session succeeds
                - 401: If user fails to authenticate
                - 400: If server excounters an unusual error
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
        return json_response({ "error" : "duplicated_users_found" }, 400)
    except Exception as e:
        app.logger.error(e)
        return json_response({ "error" : "server_error" }, 400)

    if user is None:
        return json_response({ "error" : "user_not_found" }, 401)

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return json_response({ "error" : "password_mismatched" }, 401)

    access_token = user.generate_token(timedelta(seconds=app.config['TOKEN_LIFETIME']))

    db.session.add(access_token)
    db.session.commit()

    payload = {
        'token': access_token.token,
        'exp': datetime.now() + timedelta(seconds=app.config['JWT_LIFETIME'])
    }
    jwt_token = jwtm.generate_token(payload)

    return json_response({
        "jwt_token": jwt_token,
        "refresh_token": access_token.refresh_token
    })

@jwtm.jwt_required
def delete():
    """Delete a login session

        * Returns:
            + HTTP code:
                - 200: If deleting login session succeeds
                - 401: If deleting login session fails
            + JSON:
                - success: True if deleting login session succeeds
                - error: The error message if deleting login session fails
    """
    user = jwtm.user._get_current_object()
    db.session.commit()

    return json_response({ "success" : True })