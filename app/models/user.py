# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from flask_login import UserMixin as LoginUserMixin
from core.access import UserMixin as RbacUserMixin
from app import db, rbac

users_roles = db.Table(
    "users_roles",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id")),
    db.Column("role_id", db.Integer, db.ForeignKey("roles.id"))
)

class User(db.Model, LoginUserMixin, RbacUserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(255))
    username = db.Column(db.String(255))
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))

    # Other columns
    roles = db.relationship(
        "Role",
        secondary=users_roles,
        backref=db.backref("users", lazy="dynamic"),
        lazy="dynamic"
    )

    def add_role(self, role):
        self.roles.append(role)

    def add_roles(self, roles):
        for role in roles:
            self.add_role(role)

    def get_roles(self):
        for role in self.roles:
            yield role

    def generate_token(self, expiration):
        from app.models import JWTToken

        # Clean up certain tokens
        JWTToken.query.filter(
            JWTToken.user_id == self.id,
            JWTToken.expiration >= (datetime.now() + timedelta(hours=app.config["REFRESH_TOKEN_EXPIRATION"]))
        ).delete()

        jwt_token = JWTToken()
        jwt_token.user_id = self.id
        token, refresh_token = jwt_token.generate_token(expiration)

        return token, refresh_token

    def validate_token(self, token):
        from app.models import JWTToken

        # Find the jwt token
        jwt_token = JWTToken.query.filter(token=token).scalar()

        if jwt_token:
            return jwt_token.validate_token()

        return False

    def refresh_token(self, refresh_token, expiration):
        from app.models import JWTToken

        # Clean up certain tokens
        JWTToken.query.filter(
            JWTToken.user_id == self.id,
            JWTToken.expiration >= (datetime.now() + timedelta(hours=app.config["REFRESH_TOKEN_EXPIRATION"]))
        ).delete()

        # Find the jwt token
        jwt_token = JWTToken.query.filter(refresh_token=refresh_token).scalar()

        if jwt_token:
            return jwt_token.refresh_token()

        return None
