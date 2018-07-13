# -*- coding: utf-8 -*-
from flask import Blueprint, request, current_app as app

from app import lm
from core.response import json_response

node = Blueprint("api", __name__, template_folder="templates")

@node.route("/")
def index():
    return json_response({ "success": True })

from .auth import *
from .users import *