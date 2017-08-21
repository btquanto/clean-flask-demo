# -*- coding: utf-8 -*-
import os
from flask import render_template, request, url_for, redirect, send_from_directory
from werkzeug.utils import secure_filename

from application import app, db, login_manager, session, rbac, es
from application.models import User, Role
from application.core.access import load_user
from application.core.reverse_proxied import ReverseProxied
from application.blueprints import home, user, elastic

# Constants
CONFIGURATION_FILE = "config/flaskconfig.py"

# Configuration
app.config.from_pyfile(CONFIGURATION_FILE, silent=False)
app.wsgi_app = ReverseProxied(app.wsgi_app)

# SQLAlchemy
db.init_app(app)

# Flask-Login
login_manager.init_app(app)
login_manager.user_loader(load_user)

# Flask-Session
session.init_app(app)

# RBAC
rbac.init_app(app)
rbac.role_model(Role)
rbac.user_model(User)

# Elastic Search
es.init_app(app)

# Register blueprints
app.register_blueprint(home.node, url_prefix="/home")
app.register_blueprint(user.node, url_prefix="/user")
app.register_blueprint(elastic.node, url_prefix="/elastic")

# Default route
@app.route('/')
def bootstrap():
    return redirect('/elastic/index')

@app.route('/elastic')
def elastic():
    return redirect('/elastic/index')

# For a given file, return whether it's an allowed type or not
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

@app.route("/download/<filename>")
def download(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

@app.route("/download/page/<filename>")
def download_page(filename):
    return send_from_directory(app.config['PAGES_FOLDER'], filename)

@app.route('/success/')
def success():
    return render_template('index.html')

@app.route('/error/')
def error():
    return render_template('upload.html')

# Route that will process the file upload
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'files' not in request.files:
            return "No file part"
        files = request.files.getlist("files")

        if not files:
            return "No selected file"

        if files:
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
#        return redirect(url_for('download',
#                                            filename=filename))

    return render_template("upload.html")


if __name__ == '__main__':
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=True)
