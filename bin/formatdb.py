#!/usr/bin/env python

# One document per line

import json

with open('../projects.json') as f:
	data = json.loads(f.read())

	for row in data:
		print json.dumps(row)
