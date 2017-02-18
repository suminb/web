import os

from web import create_app

if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8024))
    debug = bool(os.environ.get('DEBUG', 0))

    app = create_app(config={'DEBUG': debug})
    app.run(host=host, port=port)

    if app.config['DEBUG']:
        from werkzeug import SharedDataMiddleware
        import os
        app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
          '/': os.path.join(os.path.dirname(__file__), 'static')
        })
