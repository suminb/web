import json
import os
from urllib.parse import quote_plus

import requests

POSTAL_ADDRESS_COLUMN = 1
LATITUDE_COLUMN = 2
LONGITUDE_COLUMN = 3
CATEGORY_COLUMN = 5


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
