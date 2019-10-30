import json
import sys

import click
import gspread
from flask_frozen import Freezer
from logbook import Logger, StreamHandler
from oauth2client.service_account import ServiceAccountCredentials

from web import create_app
from web.utils import (
    CATEGORY_COLUMN,
    POSTAL_ADDRESS_COLUMN,
    geocoding,
    is_valid_coordinate,
    update_geocoordinate,
)

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
@click.argument("gspread_key")
def import_gspread(gspread_key):
    scope = ["https://spreadsheets.google.com/feeds"]

    log.info("Authentication in progress...")
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        "sumin-labs-hrd.json", scope
    )
    gc = gspread.authorize(credentials)

    sheet = gc.open_by_key(gspread_key)
    worksheet = sheet.sheet1

    log.info("Getting all values from the sheet...")
    values = worksheet.get_all_values()

    geojson = {
        "type": "FeatureCollection",
        "features": [],
    }

    for row_index, row in enumerate(values[1:], start=1):
        postal_address = row[POSTAL_ADDRESS_COLUMN]
        trip_category = row[CATEGORY_COLUMN]
        try:
            coordinate = [float(x) for x in row[2:4]]
        except ValueError:
            log.info("Geocoding {0}...", postal_address)
            coordinate = geocoding(postal_address)
            log.info("Updating the spreadsheet with {0}...", coordinate)
            update_geocoordinate(worksheet, row_index, coordinate)
        else:
            log.info("Fetched geocoding: {0} -> {1}", postal_address, coordinate)

        if not is_valid_coordinate(coordinate):
            log.warn("{0} is not a valid coordinate", coordinate)
            continue

        feature = {
            "type": "Feature",
            "properties": {"category": trip_category,},
            "geometry": {
                "type": "Point",
                "coordinates": [coordinate[1], coordinate[0]],
            },
        }
        geojson["features"].append(feature)

    print(json.dumps(geojson))


if __name__ == "__main__":
    cli()
