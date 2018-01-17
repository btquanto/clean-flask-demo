if [ -f config/gunicorn_config.py ]
then
    exec gunicorn --config config/gunicorn_config.py application:app
fi;