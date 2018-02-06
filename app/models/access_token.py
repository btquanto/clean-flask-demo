# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from app import db, rbac

class AccessToken(db.Model):
    __tablename__ = "access_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = db.Column(db.String(255), nullable=False)
    refresh_token = db.Column(db.String(255), nullable=False)
    expiration = db.Column(db.DateTime, nullable=False)

    # Others
    user = db.relationship("User")

    def generate_token(self, lifetime):
        self.token = secrets.token_hex(32)
        self.refresh_token = secrets.token_hex(32)
        self.expiration = datetime.now() + lifetime
        return self

    def validate_token(self):
        return datetime.now() < self.expiration

    def refresh(self, lifetime):
        self.token = secrets.token_hex(32)
        self.expiration = datetime.now() + lifetime
        return self