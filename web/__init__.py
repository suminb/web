from flask import Flask
from jinja2 import evalcontextfilter, Markup


__version__ = '2.1.1'


#
# Custom filters for Jinja
#
@evalcontextfilter
def format_tags(eval_ctx, value, attr=''):
    f = lambda x: '<span class="tag %s"><a href="/tag/%s">%s</a></span>' \
        % (attr, x, x)

    if isinstance(value, list):
        return Markup(' '.join(map(f, value)))
    else:
        return Markup(f(value))


@evalcontextfilter
def optional_url(eval_ctx, name, url):
    if url is not None and len(url) > 0:
        return Markup('<a href="%s">%s</a>' % (url, name))
    else:
        return name


def create_app(name=__name__, config={}, static_folder='static',
               template_folder='templates'):
    app = Flask(name)

    from web.main import main_module
    from web.api import api_module
    app.register_blueprint(main_module, url_prefix='')
    app.register_blueprint(api_module, url_prefix='/api')

    app.jinja_env.filters['format_tags'] = format_tags
    app.jinja_env.filters['optional_url'] = optional_url

    return app
