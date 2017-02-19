import sys

import click
from flask_frozen import Freezer
import gspread
from logbook import Logger, StreamHandler
from oauth2client.service_account import ServiceAccountCredentials

from web import create_app


StreamHandler(sys.stdout).push_application()
log = Logger(__name__)


@click.group()
def cli():
    pass


@cli.command()
def freeze():
    app = create_app()
    with app.app_context():
        freezer = Freezer(app)
        freezer.freeze()


@cli.command()
@click.argument('gspread_key')
def import_gspread(gspread_key):
    scope = ['https://spreadsheets.google.com/feeds']

    log.info('Authentication in progress...')
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        'sumin-labs-hrd.json', scope)
    gc = gspread.authorize(credentials)

    sheet = gc.open_by_key(gspread_key)
    worksheet = sheet.sheet1

    log.info('Getting all values from the sheet...')
    values = worksheet.get_all_values()

    for row in values[1:]:
        print(row)



if __name__ == '__main__':
    cli()
