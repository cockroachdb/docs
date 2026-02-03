---
title: Set up a Virtual Environment for Developing Global Applications
summary: This page guides you through setting up a demo multi-region CockroachDB cluster, and a virtual development environment.
toc: true
docs_area: develop
---

This page guides you through setting up a virtual environment for developing and debugging a global application. It is the third section of the [Develop and Deploy a Global Application]({% link "{{ page.version.version }}/movr.md" %}#develop-and-deploy-a-global-application) tutorial. In this section, you will set up a demo CockroachDB cluster, initialize the database, and set up a virtual development environment.

## Before you begin

1. Complete the previous sections of the tutorial, ending with [Create a Multi-Region Database Schema]({% link "{{ page.version.version }}/movr-flask-database.md" %}).

1. On your local machine:
      - [Install CockroachDB]({{ site.baseurl }}/{{ page.version.version }}/install-cockroachdb.html).
      - [Install Python 3](https://www.python.org/downloads/) and [Pipenv](https://pipenv.pypa.io) if necessary.
      - Clone the [`movr-flask`](https://github.com/cockroachlabs/movr-flask) repository. We'll reference the source code in this repository throughout the tutorial.

## Set up a demo multi-region CockroachDB cluster

For debugging and development purposes, you can use the [`cockroach demo`]({% link "{{ page.version.version }}/cockroach-demo.md" %}) command. This command starts up a secure, nine-node demo cluster.

1. To set up the demo multi-region cluster, run `cockroach demo`, with the `--nodes` and `--demo-locality` flags. The localities specified below assume GCP region names.

    ~~~ shell
    cockroach demo \
      --nodes=9 \
      --demo-locality=region=gcp-us-east1:region=gcp-us-east1:region=gcp-us-east1:\
      region=gcp-us-west1:region=gcp-us-west1:region=gcp-us-west1:\
      region=gcp-europe-west1:\
      region=gcp-europe-west1:region=gcp-europe-west1 \
      --empty
    ~~~

    Keep this terminal window open. Closing it will shut down the demo cluster.

1. In a new terminal, load the `dbinit.sql` script to the demo database. This file contains the `movr` database schema that we covered in [Create a Multi-Region Database Schema]({% link "{{ page.version.version }}/movr-flask-database.md" %}).

    ~~~ shell
    cockroach sql \
      --url='postgres://demo:<demo_password>@127.0.0.1:26257?sslmode=require' \
      -f dbinit.sql
    ~~~

1. Verify that the database schema loaded:

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
A production deployment should ideally have nodes on machines located in different areas of the world. You will deploy a multi-region CockroachDB cluster for this application using CockroachDB {{ site.data.products.standard }} in the final section of this tutorial series, [Deploy a Global, Serverless Application]({% link "{{ page.version.version }}/movr-flask-deployment.md" %}).
{{site.data.alerts.end}}

## Set up a virtual development environment

For debugging, use [`pipenv`](https://docs.pipenv.org/), a tool that manages dependencies with `pip` and creates virtual environments with `virtualenv`.

1. Initialize the project's virtual environment:

    ~~~ shell
    pipenv
    ~~~

    `pipenv` creates a `Pipfile` in the current directory, with the requirements needed for the app.

1. Install the packages listed in the `Pipfile`:

    ~~~ shell
    pipenv install
    ~~~

1. Activate the virtual environment:

    ~~~ shell
    pipenv shell
    ~~~

    From this shell, you can run any Python 3 application with the required dependencies that you listed in the `Pipfile`, and the environment variables that you listed in the `.env` file. You can exit the shell subprocess at any time with a simple `exit` command.

1. To test out the application, you can run the server file:

    ~~~ shell
    python server.py
    ~~~

    To run Python commands within the virtual environment, you do not need to add `3` to the end of the command. For example, running `python3 server.py` instead of the above command results in an error.

1. Navigate to the application's test URL, which defaults to [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

{{site.data.alerts.callout_info}}
In production, it is often recommended to [containerize](https://www.docker.com/resources/what-container) your application and deploy it with a deployment orchestration tool like [Kubernetes](https://kubernetes.io/) or with a serverless deployment service like [Google Cloud Run](https://cloud.google.com/run). You will learn to deploy the application with Google Cloud Run in the final section of this tutorial series,  [Deploy a Global Application]({% link "{{ page.version.version }}/movr-flask-deployment.md" %}).
{{site.data.alerts.end}}

## Next steps

Now that you've set up a development environment, you can learn about [developing and debugging the application]({% link "{{ page.version.version }}/movr-flask-application.md" %}).

## See also

- [`movr-flask` on GitHub](https://github.com/cockroachlabs/movr-flask)
- [`cockroach demo`]({% link "{{ page.version.version }}/cockroach-demo.md" %})
