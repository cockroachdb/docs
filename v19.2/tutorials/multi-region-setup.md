---
title: Setting Up a Virtual Environment for Developing Multi-Region Applications
summary: This page walks you through setting up a virtual multi-region CockroachDB cluster, and a virtual development environment.
toc: true
---

At this point, you should be familiar with the [`movr` database schema](multi-region-database.html) that we've created for our example application. Now let's set up a virtual CockroachDB cluster, initialize the database, and set up a virtual environment for development and debugging.

## Before you begin

Before you begin, make sure that you have the following installed on your local machine:

- [CockroachDB](../install-cockroachdb-mac.html)
- [Python 3](https://www.python.org/downloads/)
- [Pipenv](https://docs.pipenv.org/en/latest/install/#installing-pipenv)

There are a number of Python libraries that you also need for this tutorial, including `flask`, `sqlalchemy`, and `cockroachdb`. Rather than downloading these dependencies directly from PyPi to your machine, you should list them in dependency configuration files (e.g. a `requirements.txt` file), which we will go over later in the guide.

After you finish installing the required tools and applications, clone the [movr-flask](https://github.com/cockroachlabs/movr-flask) repo. We'll reference the source code in this repo through the guide.

## Setting up a virtual, multi-region CockroachDB cluster

In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. For debugging and development purposes, you can just use the [`cockroach demo`](../cockroach-demo.html) command. This command starts up an insecure, virtual nine-node cluster. After you are done debugging the application, you can move on to a [multi-region database deployment](multi-region-deployment.html#multi-region-database-deployment).

To set up the virtual, multi-region cluster:

1. Run `cockroach demo`, with the `--nodes` and `--demo-locality` flags. The localities specified below assume GCP region names.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --nodes=9 \
    --demo-locality=region=gcp-us-east1:region=gcp-us-east1:region=gcp-us-east1:region=gcp-us-west1:region=gcp-us-west1:region=gcp-us-west1:region=gcp-europe-west1:region=gcp-europe-west1:region=gcp-europe-west1
    ~~~

    ~~~
    root@127.0.0.1:<some_port>/movr>
    ~~~

    Keep this terminal window open. Closing it will shut down the virtual cluster.

1. Copy the connection string at the prompt (e.g., `root@127.0.0.1:<some_port>/movr`).

1. In a separate terminal window, run the following command to load `dbinit.sql` to the demo database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --url='postgresql://root@127.0.0.1:<some_port>/movr' < dbinit.sql
    ~~~

    This file contains the `movr` database definition, and SQL instructions to geo-partition the database.

1. In the open SQL shell to the virtual cluster, verify that the database schema loaded properly:

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


## Setting up a virtual development environment

In production, you want to [containerize](https://www.docker.com/resources/what-container) your application and deploy it with a deployment orchestration tool, like [Kubernetes](https://kubernetes.io/). For debugging, use [`pipenv`](https://docs.pipenv.org/en/latest/install/#installing-pipenv), a tool that manages dependencies with `pip` and creates virtual environments with `virtualenv`.

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
    cockroachdb = "*"
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

1. To connect to a SQL database (like CockroachDB) from a client, you need a [SQL connection string](https://en.wikipedia.org/wiki/Connection_string). Rather than hard-coding the connection string into the source code, the application reads it from an environment variable. Pipenv automatically sets any variables defined in a `.env` file as environment variables in a Pipenv virtual environment.

    So, open `.env`, and edit the `DB_URI` environment variable so that it matches the connection string for the demo cluster that you started earlier (you should just need to change the `<port>`). Note that SQLAlchemy requires the connection string protocol to be specific to the CockroachDB dialect.

    For example:

    ~~~
    DB_URI = 'cockroachdb://root@127.0.0.1:52382/movr'
    ~~~

    You can also specify other variables in this file that you'd rather not hard-code in the application, like API keys and secret keys used by the application. For debugging purposes, you should leave these variables as they are.


1. Activate the virtual environment:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pipenv shell
    ~~~

    The prompt should now read `~bash-3.2$`. From this shell, you can run any Python 3 application with the required dependencies that you listed in the `Pipfile`, and the environment variables that you listed in the `.env` file. You can exit the shell subprocess at any time with a simple `exit` command.

1. To test out the application, you can simply run the server file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python3 server.py
    ~~~

    You can alternatively use [gunicorn](https://gunicorn.org/) for the server.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gunicorn -b localhost:8000 server:app
    ~~~

1. Navigate to the URL provided to test out the application.


## Next steps

Now that you've set up a development environment for debugging your application, you can start [developing and debugging the application](multi-region-application.html).
