if [ -f config/uwsgi_config.ini ]
then
    exec uwsgi --ini config/uwsgi_config.ini --logto ./logs/uwsgi.log
else
    exec uwsgi --socket 0.0.0.0:8000 --gevent 1000 --http-websockets -w application:app
fi;