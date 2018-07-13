bind = '0.0.0.0:8000'
worker_class = 'eventlet'
workers = 10
proc_name = 'clean-flask-demo'
loglevel = 'info'
accesslog = '/src/logs/g_access.log'
errorlog = '/src/logs/g_error.log'