# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from flask_login import UserMixin as LoginUserMixin
from core.access import UserMixin as RbacUserMixin
from app import db, rbac

users_roles = db.Table(
    "users_roles",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE")),
    db.Column("role_id", db.Integer, db.ForeignKey("roles.id", ondelete="CASCADE"))
)

class User(db.Model, LoginUserMixin, RbacUserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(255))
    username = db.Column(db.String(255))
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))

    # Others
    roles = db.relationship("Role", secondary=users_roles, lazy="dynamic")
    access_tokens = db.relationship("AccessToken", lazy="dynamic", cascade="all, delete-orphan")

    def generate_token(self, lifetime):
        from app.models import AccessToken

        # Clean up expired tokens
        AccessToken.query.filter(
            AccessToken.user_id == self.id,
            AccessToken.expiration >= datetime.now()
        ).delete()

        access_token = AccessToken()
        access_token.user_id = self.id
        return access_token.generate_token(lifetime)

    def validate_token(self, token):
        from app.models import AccessToken

        # Find the jwt token, validate it, and return
        access_token = AccessToken.query.filter(token=token).scalar()
        return access_token and access_token.validate_token() or False

    def refresh_token(self, refresh_token, lifetime):
        from app.models import AccessToken

        # Clean up expired tokens
        AccessToken.query.filter(
            AccessToken.user_id == self.id,
            AccessToken.expiration >= datetime.now()
        ).delete()

        # Find the jwt token, refresh it, and return
        access_token = AccessToken.query.filter(refresh_token=refresh_token).scalar()
        return access_token and access_token.refresh(lifetime)
