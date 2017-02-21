import os
import sys

from flask import Blueprint, render_template
from logbook import Logger, StreamHandler


main_module = Blueprint('main', __name__, template_folder='templates/main')

StreamHandler(sys.stderr).push_application()
log = Logger(__name__)


@main_module.route('/')
def index():
    # FIXME: Could we automate this part somehow? (current_page)
    return render_template('index.html', **{'current_page': 'index'})


@main_module.route('/coding-expedition.html')
def coding_expedition():
    context = {
        'current_page': 'coding_expedition',
        'google_maps_api_key': os.environ['GOOGLE_MAPS_API_KEY'],
    }
    return render_template('coding_expedition.html', **context)
