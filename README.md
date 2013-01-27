Introduction
-------------

This is a resume web site for Sumin Byeon.

Prerequisites
--------------

* Flask >= 0.9
* Jinja2 >= 2.6
* PyMongo >= 2.4.1

Database
---------

We are outsourcing the database to [MongoLab](https://mongolab.com) where 250 MB of free tier is available. Considering the number of record we are going to have, this is probably a lot more than enough.

The database servers are hosted on Amazon EC2 (in us-east-1 region).

To connect using the shell:

    mongo ds049237.mongolab.com:49237/resume -u <dbuser> -p <dbpassword>

To connect using a driver via the standard URI:

    mongodb://<dbuser>:<dbpassword>@ds049237.mongolab.com:49237/resume

To import data:

    ./importdb.sh

Note: `projects.json` contains all records. One document (record) per line.