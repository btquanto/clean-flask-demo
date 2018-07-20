# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from flask_login import UserMixin as LoginUserMixin
from app import db

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }
