---
title: Deploy a Containerized Application with Google Cloud Run
summary: Learn how to use Google Cloud Run and CockroachCloud to deploy a serverless application.
toc: true
twitter: false
---

This tutorial shows you how to use Google Cloud Run to deploy a containerized Django application that communicates with a CockroachCloud Free Tier cluster.

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [CockroachCloud](https://cockroachlabs.cloud/signup) account
1. Create a [Google Cloud Platform](https://cloud.google.com/) account
1. Install the [Google Cloud Platform SDK](https://cloud.google.com/sdk)
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Step 1. Create a free CockroachCloud cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Step 2. Set up your cluster connection

{% include cockroachcloud/quickstart/set-up-your-cluster-connection.md %}

## Step 3. Create a database

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Start the [built-in SQL shell](cockroach-sql.html) using the connection string you got from the CockroachCloud Console earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<cluster_name>.defaultdb?sslmode=verify-full&sslrootcert=<certs_dir>/cc-ca.crt'
    ~~~

    In the connection string copied from the CockroachCloud Console, your username, password and cluster name are pre-populated. Replace the `<certs_dir>` placeholder with the path to the `certs` directory that you created earlier.

1. In the SQL shell, create the `bank` database that your application will use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

1. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Get the application code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-python-django/
~~~

The project directory structure should look like this:

~~~
├── Dockerfile
├── README.md
├── cockroach_example
│   ├── cockroach_example
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── migrations
│   │   │   ├── 0001_initial.py
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── wsgi.py
│   └── manage.py
└── requirements.txt
~~~

## Step 5. Initialize the database and test the app locally

1. At the top level of the app's project directory, create and then activate a virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ virtualenv env
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ source env/bin/activate
    ~~~

1. Install the required modules to the virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install -r requirements.txt
    ~~~

1. Set the `DATABASE_URL` environment variable to the connection string provided in the **Connection info** window of the CockroachCloud Console:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL='<connection_string>'
    ~~~

    This Django app uses the `dj_database_url` module to configure the database connection from a connection URL. The module uses the value assigned to the `DATABASE_URL` environment variable for the connection.

    {{site.data.alerts.callout_info}}
    In the Cloud Run deployment, we use GCP services to define the `DATABASE_URL` environment variable for the Docker container, and to mount the certificate to a directory in the container.
    {{site.data.alerts.end}}

1. Execute the initial database schema migration:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 cockroach_example/manage.py migrate
    ~~~

    This migration initializes the `bank` database with the tables defined in `models.py`, in addition to some other tables for the admin functionality included with Django's starter application.

1. Run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 cockroach_example/manage.py runserver 0.0.0.0:8000
    ~~~

    The output should look like this:

    ~~~
    ...
    Starting development server at http://0.0.0.0:8000/
    Quit the server with CONTROL-C.
    ~~~

    To perform simple reads and writes to the database, you can send HTTP requests to the application at http://0.0.0.0:8000/.

1. In a new terminal, use `curl` to send a POST request to the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl --header "Content-Type: application/json" \
    --request POST \
    --data '{"name":"Carl"}' http://0.0.0.0:8000/customer/
    ~~~

    This request inserts a new row into the `cockroach_example_customers` table.

1. Send a GET request to read from the `cockroach_example_customers` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl http://0.0.0.0:8000/customer/
    ~~~

    ~~~
    [{"id": "bb7d6c4d-efb3-45f8-b790-9911aae7d8b2", "name": "Carl"}]
    ~~~

    You can also query the table directly in the [SQL shell](cockroach-sql.html) to see the changes:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.cockroach_example_customers;
    ~~~

    ~~~
                       id                  | name
    ---------------------------------------+-------
      bb7d6c4d-efb3-45f8-b790-9911aae7d8b2 | Carl
    (1 row)
    ~~~

## Step 6. Configure GCP

1. From the [GCP console](https://console.cloud.google.com/), create a Google Cloud project for the application.

1. In the [API Library](https://console.cloud.google.com/apis/library), enable the following APIs for your project:
    - Container Registry API
    - Cloud Run Admin API
    - Secret Manager API

1. In a local terminal, configure the `gcloud` command-line tool to use the new project:

    {{site.data.alerts.callout_info}}
    `gcloud` is included with the [Google Cloud SDK](https://cloud.google.com/sdk) installation.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud init
    ~~~

    Follow the prompts to authenticate your GCP account, and then enter your GCP project ID.

## Step 7. Create a secret for the CockroachCloud root certificate

To authenticate with CockroachCloud, your application must have access to the root certificate that you downloaded from the CockroachCloud console. You can store the certificate as a secret with the GCP Secret Manager service.

From the [Secret Manager](https://console.cloud.google.com/security/secret-manager), create a secret for the CockroachCloud cluster's root certificate.

## Step 8. Containerize the application and push it to the registry

1. Build the Docker image locally:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker build -t gcr.io/<gcp_project_id>/crdb-sample:v1 .
    ~~~

    If there are no errors, the container built successfully.

1. Authenticate Docker with GCP's Container Registry:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud auth configure-docker
    ~~~

1. Push the Docker image to the project's registry.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker push gcr.io/<gcp_project_id>/crdb-sample:v1
    ~~~

## Step 9. Deploy the application on Cloud Run

1. Create a [Cloud Run](https://console.cloud.google.com/run/) service for the application, in the region closest to you.

1. Select the container image URL for the image that you just pushed to the container registry.

1. Under **Advanced settings**->**Variables & Secrets**, do the following:
    - Mount the secret that you created for the CockroachCloud certificate on the `certs` volume, with a full path ending in the name of the cert (e.g., `certs/root.crt`).

        {{site.data.alerts.callout_info}}
        You might need to grant your GCP service account permissions to access the secret.
        {{site.data.alerts.end}}
    - Set an environment variable named `DATABASE_URL` to the connection string for a gateway node on the CockroachCloud cluster, with the root certificate located in the mounted `certs` volume (e.g., `'postgresql://user:password@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=certs/root.crt&options=--cluster%3Dable-cattle-1220'`).

After the revision is deployed, you should be able to send requests to the application from a browser, or using a REST client (e.g., `curl`). For example:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl https://<GCR_HOST>/customer/
~~~

~~~
[{"id": "bb7d6c4d-efb3-45f8-b790-9911aae7d8b2", "name": "Carl"}]
~~~

{{site.data.alerts.callout_danger}}
By default, the sample application allows all hosts/domain names to serve the application.

After testing, we recommend that you update the [`ALLOWED_HOSTS` property in `settings.py`](https://docs.djangoproject.com/en/3.2/ref/settings/#allowed-hosts) to allow only a local testing URL and the Cloud Run service URL to serve the application.
{{site.data.alerts.end}}

## See also

- [Build a Simple Django App with CockroachDB](build-a-python-app-with-cockroachdb-django.html)

{% include {{page.version.version}}/app/see-also-links.md %}
