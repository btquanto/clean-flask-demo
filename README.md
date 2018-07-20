# Flask-Skeleton

A skeleton for developing flask applications

# Quickstart

Make sure you have `docker` and `docker-compose` installed. If you don't, install them following instructions on [Docker's website](https://www.docker.com/). You will also need `npm` for building es6 and sass

1. Create `docker-compose.yml` from `docker-compose.yml.template`. Edit `docker-compose.yml` as fit (recommended).

    ```
    cp docker-compose.yml.template docker-compose.yml
    ```

2. Create `config/local.py` and override configurations from `config/default.py` as fit.
3. Edit `wsgi/gunicorn.ini` as fit.
4. Run `docker-compose`. You may need to run this command as sudo if you haven't added your user into the `docker` group.

    ```
    docker-compose up
    ```
5. Run `docker-compose exec flask python3 flaskscript.py db upgrade` to create database tables
6. Run `docker-compose exec node npm install` to install js dependencies
7. Run `docker-compose exec node npm start` to generate javascript and css assets

# Features

## PostgreSQL

Using the PostgreSQL image from [Docker Store](https://store.docker.com/images/postgres)

## Nginx

Using the Nginx image from [Docker Store](https://store.docker.com/images/nginx)

The nginx's configuration file for the server is located at `scripts/nginx.conf`

This nginx service is not a necessity. You can remove it, and use nginx or any http server on your host to serve the website.

You may as well config uwsgi to serve as a http server. Just make sure you know what you are doing.

## Flask

Using the Flask image from [Docker Hub](https://hub.docker.com/r/btquanto/docker-flask-py3/). The image is based on `alpine-3.6`, and includes:

```
bash
linux-headers
g++
py3-pip
build-base
python3-dev
libffi-dev
freetype-dev
libpng-dev
jpeg-dev
postgresql-dev
```

To access the flask container's shell, use the following command.

```
docker-compose exec flask /bin/bash
```

### Python packages

Default Python packages include. You can edit them in `requirements.txt`

```
alembic==0.9.1
elasticsearch==5.4.0
eventlet==0.21.0
flask-alchemydumps==0.0.10
flask-bcrypt==0.7.1
flask-login==0.4.0
flask-migrate==2.1.1
flask-script==2.0.6
flask-session==0.3.1
flask-sqlalchemy==2.3.2
flask==0.12.2
google-api-python-client==1.6.4
jinja2==2.9.6
psycopg2==2.7.3.2
python-dateutil==2.6.1
pytz==2017.3
simplejson==3.12.0
sqlalchemy==1.1.15
uwsgi==2.0.15
```

If building some packages fails, you should extend the `btquanto/docker-flask-py3` image with added build dependencies.

### Entrypoint

The `entrypoint` script is `scripts/flask.sh`. The current version of the file is something like this:

```sh
#!/bin/bash

DEBUG=false;
SKIP_REQUIREMENTS_CHECK=false;

set -e

cd /src

if ! [ -f config/flaskconfig.py ]
then
    echo "Configuration file `config/flaskconfig.py` not found"
    echo "Please create one using `config/flaskconfig.py.template` as the template"
    exit 0;
fi;

if [ -f requirements.txt ]
then
    if ! $SKIP_REQUIREMENTS_CHECK
    then
        echo "Checking for package updates...";
        pip3 install -Ur requirements.txt;
    fi;
fi;
if $DEBUG
then
    python3 application.py
else
    if [ -f config/uwsgi_config.ini ]
    then
        exec uwsgi --ini config/uwsgi_config.ini --logto ./logs/uwsgi.log
    else
        exec uwsgi --socket 0.0.0.0:8000 -w application:app
    fi;
fi;
```

* `DEBUG` is `true`

    Access the app through port `8000` (default). The app would then be run using the command `python3 application.py`, so check the output of `docker-compose up` for logging.

* `DEBUG` is `false`

    The app is then served by `uwsgi` on port `8000`. However, `uwsgi` isn't an http server by default, so you'll have to access it via the `nginx` service through port `8080`. You can change this behaviour through editing `config/uwsgi_config.ini`.

    If `config/uwsgi_config.ini` is not found, `uwsgi` will be started using the following command

    ```
    exec uwsgi --socket 0.0.0.0:8000 -w application:app
    ```

### Features

#### Structure

1. `app` module

    The app module contains the application's logic. The logic of the application is governed by its models, and blueprints (can also be called controllers, if you're not familiar with the blueprint concept)

    1. `app.blueprints` module

    This is where the blueprints are located. Each blueprint will have its own package

    To create a new blueprint, for example the `home` blueprint:

    * Create a subfolder inside `app/blueprint`. For example `app/blueprints/home`
    * Create an `__init__.py` file, so that Python will treat the folder as a package. Put the following content:

        ```python
        from .home import node
        ```
    * Create a Python file with the same name with the blueprint inside the blueprint package, in this case, it's `app/blueprints/home/home.py`. Put in the following content:

        ```python
        # -*- coding: utf-8 -*-
        from flask import Blueprint
        node = Blueprint("home", __name__, template_folder="templates")
        ```

    And that's the basic for a new blueprint. What's left is to register it with the application object in the `application` module

    2. `app.models` module

    Here is where all the **SQLAlchemy** models are located.

    To create a new model, for example the `User` model:

    * Add a new Python file, for example, `user.py` in `app/models`, containing the code for the model class
    * Here is an example of a basic model class. You should checkout the documentations for `Flask-SQLAlchemy` and `SQLAlchemy` to learn more.

        ```python
        # -*- coding: utf-8 -*-
        from app import db

        class User(db.Model):
            __tablename__ = 'users'

            id = db.Column(db.Integer, primary_key=True)
            username = db.Column(db.String(30))
            password = db.Column(db.String(255))
            auth_key = db.Column(db.String(255))
            session_expiry = db.Column(db.DateTime, nullable=True)
        ```
    * Import the model into `app/models/__init__.py`

        ```python
        from .user import User
        ```

    To use the model, for example in the blueprints, you would then just need to

    ```python
    from app.models import User
    ```

    3. `app/__init__.py`

    Here initializes all the plugins that the application/blueprints/models would depend on.

2. `core` module

    Here lies the codes that would be independent from the application logic, meaning it can be shared among different application. Examples of such codes are:

    * Flask plugins
    * Utilities
    * Overrides of plugins and Flask components

    **Notes:** Nothing from `core` folder should ever import anything from `application` and `app` modules. The `core` module must always be separated from the application logic.

3. `application` module

    The application module initialize the flask application, import configuration, and initialize plugins with the application object. It also registers the blueprints and their prefixes.

4. `config.flaskconfig` module

    Here lies all the configuration for the flask application. The `application` module will retrieve the configurations via the `app.config.from_object` function.

5. `flaskscript.py`

    The entrypoint for running `Flask-Script`. This will handle database migration, as well as other custom scripts, like, for example, initializing data for a role-base access control system. Read more [here](#Flask-Script)

6. `components` folder

    1. `components/js` folder

    This is where you put in Javascript components for ReactJs. I'll talk more about this in the [Generating Js and Scss](#Generating Js and Scss) section.

    2. `components/scss` folder

    This is where you put in Scss modules. I'll talk more about this in the [Generating Js and Scss](#Generating Js and Scss) section.

#### Flask-Script

In order to run any script, you need access to a shell inside the flask container (if you're using docker, that is)

    ```
    docker-compose exec flask /bin/bash
    ```
In `flaskscript.py`, I have already included `Flask-Migrate`. You can add others, just checkout the `Flask-Script` documentation.

`Flask-Migrate` is a very great tool for database migration. Do a Google search if you don't know what database migration means.

`Flask-Migrate` runs via `Flask-Script`, which loads its configurations from `config.flaskconfig`, so make sure you have the configuration for the database connection ready.

Before doing any migration, you need to initialize `Flask-Migrate`.

```
python3 flaskscript.py db init
```

This will create a table named `alembic` inside your database. The table will keep track of your database versions.

`flaskscript.py` loads all the models from `app.models`, so remember to import your models in `app/models/__init__.py`.

To generate a new migration after adding/changing your model,

```
python3 flaskscript.py db migrate -m "Your migration message"
```

To run your migration

```
python3 flaskscript.py db upgrade
```

You can read more about Flask-Migrate commandline options with the `--help` option

```
python3 flaskscript.py db --help
```

#### Generating Js and Scss

To generate Js and Scss, run

```
npm run gulp
```