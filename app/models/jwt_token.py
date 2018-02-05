# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from app import db, rbac

class JWTToken(db.Model):
    __tablename__ = "jwt_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(255), nullable=False)
    refresh_token = db.Column(db.String(255), nullable=False)
    expiration = db.Column(db.DateTime, nullable=False)

    # Other columns
    user = db.relationship("User", backref=db.backref("jwt_tokens", lazy="dynamic"), lazy="dynamic")

    def generate_token(self, expiration):
        self.token = secrets.token_hex(32)
        self.refresh_token = secrets.token_hex(32)
        self.session_expiry = datetime.now() + expiration
        return self.token, self.refresh_token

    def validate_token(self):
        return datetime.now() < self.expiration

    def refresh_token(self, expiration):
        self.token = secrets.token_hex(32)
        self.session_expiry = datetime.now() + expiration
        return self.token


