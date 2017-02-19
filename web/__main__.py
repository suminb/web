import json
import os
import sys
try:
    from urllib.parse import quote_plus
except ModuleNotFoundError:
    from urllib import quote_plus

import click
from flask_frozen import Freezer
import gspread
from logbook import Logger, StreamHandler
from oauth2client.service_account import ServiceAccountCredentials
import requests

from web import create_app


StreamHandler(sys.stderr).push_application()
log = Logger(__name__)


@click.group()
def cli():
    pass


@cli.command()
def build():
    """Builds static web pages."""
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

    buf = []

    for row in values[1:]:
        postal_address = row[1]
        try:
            coordinate = [float(x) for x in row[2:4]]
        except ValueError:
            coordinate = geocoding(postal_address)
        log.info('{} -> {}', postal_address, coordinate)

        buf.append({'lat': coordinate[0], 'lng': coordinate[1]})

    print('var locations = ' + json.dumps(buf))

def geocoding(postal_address):
    google_maps_api_key = os.environ['GOOGLE_MAPS_API_KEY']
    url = 'https://maps.googleapis.com/maps/api/geocode/json?address={}' \
          '&key={}'.format(quote_plus(postal_address), google_maps_api_key)

    resp = requests.get(url)
    results = json.loads(resp.text)

    # TODO: Refactor the following section
    if results['results']:
        location = results['results'][0]['geometry']['location']
        return location['lat'], location['lng']
    else:
        return None


if __name__ == '__main__':
    cli()
