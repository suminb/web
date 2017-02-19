import os
import sys


from flask import Blueprint, render_template
import gspread
from logbook import Logger, StreamHandler
from oauth2client.service_account import ServiceAccountCredentials


main_module = Blueprint('main', __name__, template_folder='templates/main')

StreamHandler(sys.stdout).push_application()
log = Logger(__name__)


@main_module.route('/')
def index():
    # FIXME: Could we automate this part somehow? (current_page)
    return render_template('index.html', **{'current_page': 'index'})


@main_module.route('/coding-expedition.html')
def coding_expedition():
    scope = ['https://spreadsheets.google.com/feeds']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('sumin-labs-hrd.json', scope)
    gc = gspread.authorize(credentials)
    sheet_key = os.environ['CODING_EXPEDITION_SHEET_KEY']
    sheet = gc.open_by_key(sheet_key)
    worksheet = sheet.sheet1
    values = worksheet.get_all_values()

    context = {
        'current_page': 'coding_expedition',
        'values': values,
    }
    return render_template('coding_expedition.html', **context)
