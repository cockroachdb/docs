---
title: Set up a Virtual Environment for Developing Global Applications
summary: This page guides you through setting up a demo multi-region CockroachDB cluster, and a virtual development environment.
toc: true
redirect_from: multi-region-setup.html
docs_area: develop
---

This page guides you through setting up a virtual environment for developing and debugging a global application. It is the third section of the [Develop and Deploy a Global Application](movr-flask-overview.html) tutorial. In this section, you will set up a demo CockroachDB cluster, initialize the database, and set up a virtual development environment.

## Before you begin

1. Complete the previous section of the tutorial, [Create a Multi-Region Database Schema](movr-flask-database.html).

1. Make sure that you have the following installed on your local machine:
      - [CockroachDB](install-cockroachdb-mac.html)
      - [Python 3](https://www.python.org/downloads/)
      - [Pipenv](https://pipenv.readthedocs.io/en/latest/)

1. Clone the [`movr-flask`](https://github.com/cockroachlabs/movr-flask) repository. We'll reference the source code in this repository throughout the tutorial.

## Set up a demo multi-region CockroachDB cluster

For debugging and development purposes, you can use the [`cockroach demo`](cockroach-demo.html) command. This command starts up a secure, nine-node demo cluster.

1. To set up the demo multi-region cluster, run `cockroach demo`, with the `--nodes` and `--demo-locality` flags. The localities specified below assume GCP region names.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --nodes=9 \
    --demo-locality=region=gcp-us-east1:region=gcp-us-east1:region=gcp-us-east1:\
    region=gcp-us-west1:region=gcp-us-west1:region=gcp-us-west1:\
    region=gcp-europe-west1:region=gcp-europe-west1:region=gcp-europe-west1 \
    --empty
    ~~~

    Keep this terminal window open. Closing it will shut down the demo cluster.

1. Open another terminal window. In the new window, run the following command to load `dbinit.sql` to the demo database. This file contains the `movr` database schema that we covered in [Create a Multi-Region Database Schema](movr-flask-database.html).

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url='postgres://demo:<demo_password>@127.0.0.1:26257?sslmode=require' -f dbinit.sql
    ~~~


1. In the demo cluster terminal, verify that the database schema loaded properly:

    {% include_cached copy-clipboard.html %}
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
In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. For instructions on deploying a multi-region CockroachDB cluster for this application, using {{ site.data.products.dedicated }}, see [Deploy a Global, Serverless Application](movr-flask-deployment.html).
{{site.data.alerts.end}}


## Set up a virtual development environment

For debugging, use [`pipenv`](https://docs.pipenv.org/), a tool that manages dependencies with `pip` and creates virtual environments with `virtualenv`.

1. Run the following command to initialize the project's virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pipenv --three
    ~~~

    `pipenv` creates a `Pipfile` in the current directory, with the requirements needed for the app.

1. Run the following command to install the packages listed in the `Pipfile`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pipenv install
    ~~~

1. Activate the virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pipenv shell
    ~~~

    From this shell, you can run any Python 3 application with the required dependencies that you listed in the `Pipfile`, and the environment variables that you listed in the `.env` file. You can exit the shell subprocess at any time with a simple `exit` command.

1. To test out the application, you can run the server file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python server.py
    ~~~

1. Navigate to the URL provided to test out the application. By default, this should be http://127.0.0.1:5000/.

{{site.data.alerts.callout_info}}
In production, you want to [containerize](https://www.docker.com/resources/what-container) your application and deploy it with a deployment orchestration tool, like [Kubernetes](https://kubernetes.io/), or with a serverless deployment service, like [Google Cloud Run](https://cloud.google.com/run). We cover deploying the application with Google Cloud Run in [Deploy a Global Application](movr-flask-deployment.html).
{{site.data.alerts.end}}

## Next steps

Now that you've set up a development environment, you can start [developing and debugging the application](movr-flask-application.html).

## See also

- [`movr-flask` on GitHub](https://github.com/cockroachlabs/movr-flask)
- [`cockroach demo`](cockroach-demo.html)
- [Pipenv](https://pipenv.readthedocs.io/en/latest/)
