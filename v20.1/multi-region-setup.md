---
title: Set Up a Virtual Environment for Developing Multi-Region Applications
summary: This page walks you through setting up a demo multi-region CockroachDB cluster, and a virtual development environment.
toc: true
---

This page walks you through setting up a virtual environment for developing and debugging an example multi-region application. It is the third section of the [Develop and Deploy a Multi-Region Web Application](multi-region-overview.html) tutorial. In this section, you will set up a demo CockroachDB cluster, initialize the database, and set up a virtual development environment.

## Before you begin

1. Complete the previous section of the tutorial, [Create a Multi-Region Database Schema](multi-region-database.html).

1. Make sure that you have the following installed on your local machine:

    - [CockroachDB](install-cockroachdb-mac.html)
    - [Python 3](https://www.python.org/downloads/)
    - [Pipenv](https://pipenv.readthedocs.io/en/latest/)

1. Clone the [movr-flask](https://github.com/cockroachlabs/movr-flask) repo. We'll reference the source code in this repo throughout the tutorial.

## Set up a demo multi-region CockroachDB cluster

For debugging and development purposes, you can use the [`cockroach demo`](cockroach-demo.html) command. This command starts up an insecure, nine-node demo cluster.

1. To set up the demo multi-region cluster, run `cockroach demo`, with the `--nodes` and `--demo-locality` flags. The localities specified below assume GCP region names.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --nodes=9 \
    --demo-locality=region=gcp-us-east1:region=gcp-us-east1:region=gcp-us-east1:\
    region=gcp-us-west1:region=gcp-us-west1:region=gcp-us-west1:\
    region=gcp-europe-west1:region=gcp-europe-west1:region=gcp-europe-west1
    ~~~

    ~~~
    root@127.0.0.1:62268/movr>
    ~~~

    {{site.data.alerts.callout_info}}
    Your port number will likely be different than the one shown here.
    {{site.data.alerts.end}}

    Keep this terminal window open. Closing it will shut down the demo cluster.

1. Copy the connection string at the prompt (e.g., `root@127.0.0.1:62268/movr`).

1. Open another terminal window. In the new window, run the following command to load `dbinit.sql` to the demo database. This file contains the `movr` database definition, and SQL instructions to geo-partition the database.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --url='postgresql://root@127.0.0.1:62268/movr' < dbinit.sql
    ~~~


1. In the demo cluster terminal, verify that the database schema loaded properly:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES;
    ~~~
    ~~~
      table_name
    +------------+
      rides
      users
      vehicles
    (3 rows)
    ~~~

{{site.data.alerts.callout_info}}
In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. For instructions on deploying a multi-region CockroachDB cluster for this application, using [CockroachCloud](https://www.cockroachlabs.com/product/cockroachcloud/), see [Deploy a Multi-Region Web Application](multi-region-deployment.html).
{{site.data.alerts.end}}


## Set up a virtual development environment

For debugging, use [`pipenv`](https://docs.pipenv.org/en/latest/install/#installing-pipenv), a tool that manages dependencies with `pip` and creates virtual environments with `virtualenv`.

1. Run the following command to initialize the project's virtual environment:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pipenv --three
    ~~~

    `pipenv` creates a `Pipfile` in the current directory. Open this `Pipfile`, and confirm its contents match the following:


    ~~~ toml
    [[source]]
    name = "pypi"
    url = "https://pypi.org/simple"
    verify_ssl = true

    [dev-packages]

    [packages]
    sqlalchemy-cockroachdb = "*"
    psycopg2-binary = "*"
    SQLAlchemy = "*"
    SQLAlchemy-Utils = "*"
    Flask = "*"
    Flask-SQLAlchemy = "*"
    Flask-WTF = "*"
    Flask-Bootstrap = "*"
    Flask-Login = "*"
    WTForms = "*"
    gunicorn = "*"
    geopy = "*"

    [requires]
    python_version = "3.7"
    ~~~

1. Run the following command to install the packages listed in the `Pipfile`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pipenv install
    ~~~

1. To connect to a SQL database (like CockroachDB) from a client, you need a [SQL connection string](connection-parameters.html). Rather than hard-coding the connection string into the source code, the application reads it from an environment variable. Pipenv automatically sets any variables defined in a `.env` file as environment variables in a Pipenv virtual environment.

    Open `.env` and edit the `DB_URI` environment variable so that it matches the connection string for the demo cluster that you started earlier (you may need to change the `<port>`). Note that SQLAlchemy requires the connection string protocol to be specific to the CockroachDB dialect, as shown below:

    ~~~
    DB_URI = 'cockroachdb://root@127.0.0.1:62268/movr'
    ~~~

    `.env` also specifies a few other variables, like API keys and secret keys, that are used by the application. For debugging purposes, you should leave these variables as they are.

1. Activate the virtual environment:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pipenv shell
    ~~~

    From this shell, you can run any Python 3 application with the required dependencies that you listed in the `Pipfile`, and the environment variables that you listed in the `.env` file. You can exit the shell subprocess at any time with a simple `exit` command.

1. To test out the application, you can run the server file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python server.py
    ~~~

1. Navigate to the URL provided to test out the application. By default, this should be http://127.0.0.1:5000/.

{{site.data.alerts.callout_info}}
In production, you want to [containerize](https://www.docker.com/resources/what-container) your application and deploy it with a deployment orchestration tool, like [Kubernetes](https://kubernetes.io/). For instructions on deploying this application in multiple regions, see [Deploy a Multi-Region Web Application](multi-region-deployment.html).
{{site.data.alerts.end}}

## Next steps

Now that you've set up a development environment, you can start [developing and debugging the application](multi-region-application.html).

## See also

- [movr-flask on GitHub](https://github.com/cockroachlabs/movr-flask)
- [`cockroach demo`](cockroach-demo.html)
- [Pipenv](https://pipenv.readthedocs.io/en/latest/)