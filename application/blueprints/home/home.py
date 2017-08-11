# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, jsonify, request
from jinja2 import TemplateNotFound
from .. import app

node = Blueprint("home", __name__, template_folder="templates")

@node.route("/index")
def index():
    return render_template("home/index.html")