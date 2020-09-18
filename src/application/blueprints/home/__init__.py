# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, current_app as app, jsonify, request
from jinja2 import TemplateNotFound

blueprint = Blueprint("home", __name__, template_folder="templates")

@blueprint.route("/index")
def index():
    app.logger.info("Logging")
    return render_template("home/index.html")

@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    return "Login"
