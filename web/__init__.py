from flask import Flask
from jinja2 import evalcontextfilter, Markup
from markdown import markdown as markdown_
from markdown.extensions.footnotes import FootnoteExtension


__version__ = "2.4.1"


#
# Custom filters for Jinja
#
@evalcontextfilter
def format_tags(eval_ctx, value, attr=""):
    def f(x):
        return '<span class="tag %s"><a href="/tag/%s">%s</a></span>' % (attr, x, x)

    if isinstance(value, list):
        return Markup(" ".join(map(f, value)))
    else:
        return Markup(f(value))


@evalcontextfilter
def optional_url(eval_ctx, name, url):
    if url is not None and len(url) > 0:
        return Markup('<a href="%s">%s</a>' % (url, name))
    else:
        return name


@evalcontextfilter
def markdown(eval_ctx, value, attr=""):
    return markdown_(value, extensions=[FootnoteExtension()])


def create_app(
    name=__name__, config=None, static_folder="static", template_folder="templates"
):
    if config is None:
        config = {}

    app = Flask(name)
    app.config.update(config)

    if app.debug:
        app.config["TEMPLATES_AUTO_RELOAD"] = True

    from web.models import CustomJSONEncoder

    app.json_encoder = CustomJSONEncoder

    from web.main import main_module

    app.register_blueprint(main_module, url_prefix="")

    filters = ["format_tags", "optional_url", "markdown"]
    for filter_ in filters:
        app.jinja_env.filters[filter_] = globals()[filter_]

    return app
