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


POSTAL_ADDRESS_COLUMN = 1
LATITUDE_COLUMN = 2
LONGITUDE_COLUMN = 3
CATEGORY_COLUMN = 5


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

    geojson = {
        'type': 'FeatureCollection',
        'features': [],
    }

    for row_index, row in enumerate(values[1:], start=1):
        postal_address = row[POSTAL_ADDRESS_COLUMN]
        trip_category = row[CATEGORY_COLUMN]
        try:
            coordinate = [float(x) for x in row[2:4]]
        except ValueError:
            log.info('Geocoding {0}...', postal_address)
            coordinate = geocoding(postal_address)
            log.info('Updating the spreadsheet with {0}...', coordinate)
            update_geocoordinate(worksheet, row_index, coordinate)
        else:
            log.info('Fetched geocoding: {0} -> {1}',
                     postal_address, coordinate)

        if not is_valid_coordinate(coordinate):
            log.warn('{0} is not a valid coordinate', coordinate)
            continue

        feature = {
            'type': 'Feature',
            'properties': {
                'category': trip_category,
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [coordinate[1], coordinate[0]],
            }
        }
        geojson['features'].append(feature)

    print(json.dumps(geojson))


def update_geocoordinate(worksheet, row_index, coordinate):
    """Updates Google Spreadsheet so that we don't have to do geocoding again
    in the future.
    """
    if not is_valid_coordinate(coordinate):
        return

    # NOTE: Cell coordinates in gspread, unlike all other parts of our code,
    # is one-based rather than zero-based.
    worksheet.update_cell(row_index + 1, LATITUDE_COLUMN + 1, coordinate[0])
    worksheet.update_cell(row_index + 1, LONGITUDE_COLUMN + 1, coordinate[1])


def is_valid_coordinate(coordinate):
    try:
        lat, lng = coordinate
    except (TypeError, ValueError):
        return False

    return all(isinstance(coordinate[i], float) for i in range(2))


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
