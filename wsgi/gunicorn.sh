if [ -f wsgi/gunicorn.py ]
then
    exec gunicorn --config wsgi/gunicorn.py application:app
else
    echo "'wsgi/gunicorn.py' not found"
fi;