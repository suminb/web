#!/bin/bash

# Couldn't figure out how to mix an interactive mode and the standard input for the mongoimport command
python formatdb.py > projects.tmp
mongoimport -h ds049237.mongolab.com:49237 -d resume -c projects -u sumin-resume -p --file projects.tmp
rm projects.tmp
