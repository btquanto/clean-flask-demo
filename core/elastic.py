from elasticsearch import Elasticsearch

# Find the stack on which we want to store the database connection.
# Starting with Flask 0.9, the _app_ctx_stack is the correct one,
# before that we need to use the _request_ctx_stack.
try:
    from flask import _app_ctx_stack as stack
except ImportError:
    from flask import _request_ctx_stack as stack


class FlaskElasticsearch(object):

    def __init__(self, app=None, **kwargs):
        self.app = app
        if app is not None:
            self.init_app(app, **kwargs)
    
    def init_app(self, app, **kwargs):
        app.config.setdefault('ELASTICSEARCH_HOST', 'localhost:9200')
        app.config.setdefault('ELASTICSEARCH_HTTP_AUTH', None)
        
        self.elastic_options = kwargs

        # Use the newstyle teardown_appcontext if it's available,
        # otherwise fall back to the request context
        if hasattr(app, 'teardown_appcontext'):
            app.teardown_appcontext(self.teardown)
        else:
            app.teardown_request(self.teardown)

    @property
    def client(self):
        # Get the current elasticsearch client for the current context
        ctx = stack.top
        if not hasattr(ctx, 'elasticsearch'):
            if isinstance(ctx.app.config.get('ELASTICSEARCH_HOST'), str):
                hosts = [ctx.app.config.get('ELASTICSEARCH_HOST')]
            elif isinstance(ctx.app.config.get('ELASTICSEARCH_HOST'), list):
                hosts = ctx.app.config.get('ELASTICSEARCH_HOST')
            ctx.elasticsearch = Elasticsearch(hosts=hosts,
                                                http_auth=ctx.app.config.get('ELASTICSEARCH_HTTP_AUTH'),
                                                **self.elastic_options)
        return ctx.elasticsearch

    def teardown(self, exception):
        ctx = stack.top
        if hasattr(ctx, 'elasticsearch'):
            ctx.elasticsearch = None