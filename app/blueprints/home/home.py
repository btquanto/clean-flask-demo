# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, jsonify, request, current_app as app, redirect
from jinja2 import TemplateNotFound

node = Blueprint("home", __name__, template_folder="templates")

@node.route("/")
def index():
    return render_template("home/index.html")