---
title: Deploy a CockroachDB Cloud Application with Google Cloud Run
summary: Learn how to use Google Cloud Run (GCR) and CockroachDB Serverless to deploy a serverless application.
toc: true
twitter: false
referral_id: docs_gcr_django
docs_area: get_started
---

This tutorial shows you how to use Google Cloud Run to deploy a containerized Django application that communicates with a {{ site.data.products.serverless }} cluster.

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.
1. Create a [Google Cloud](https://cloud.google.com/) account.
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk).
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Step 2. Set up your cluster connection

{% include cockroachcloud/quickstart/set-up-your-cluster-connection.md %}

## Step 3. Create a database

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Start the [built-in SQL shell](cockroach-sql.html) using the connection string you got from the {{ site.data.products.db }} Console earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/defaultdb?sslmode=verify-full&sslrootcert=<certs_dir>/cc-ca.crt'
    ~~~

    In the connection string copied from the {{ site.data.products.db }} Console, your username, password and cluster name are pre-populated. Replace the `<certs_dir>` placeholder with the path to the `certs` directory that you created earlier.

2. In the SQL shell, create the `bank` database that your application will use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

3. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Get the application code

1. Clone the code's GitHub repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone https://github.com/cockroachlabs/example-app-python-django/
    ~~~

1. Create a new folder named `certs` at the top level of the `example-app-python-django` project, and then copy the root certificate that you downloaded for your cluster to the new folder.

    The project directory structure should look like this:

    ~~~
    ├── Dockerfile
    ├── README.md
    ├── certs
    │   └── root.crt
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

1. Set the `DATABASE_URL` environment variable to the connection string provided in the **Connection info** window of the {{ site.data.products.db }} Console, but with the root certificate located in the local `certs` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://$USER:$PASSWORD@random-cluster-name-4300.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=root.crt"
    ~~~

    This Django app uses the `dj_database_url` module to configure the database connection from a connection URL. The module uses the value assigned to the `DATABASE_URL` environment variable for the connection.

    {{site.data.alerts.callout_info}}
    In the Cloud Run deployment, we use the Google Cloud Secret Manager to define the `DATABASE_URL` environment variable for the deployment.
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

1. Enter **Ctrl+C** to stop the application.

## Step 6. Configure GCP

1. In the terminal, authenticate the `gcloud` command-line tool with your Google Cloud account:

    {{site.data.alerts.callout_info}}
    `gcloud` is included with the [Google Cloud SDK](https://cloud.google.com/sdk) installation.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud auth login
    ~~~

    Follow the prompts to authenticate.

1. Create a Google Cloud project for the application deployment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud projects create <gcp_project_id>
    ~~~

    {{site.data.alerts.callout_info}}
    You can specify a location for the project within your Google Cloud resources with the `--organization` or `--folder` flags.
    {{site.data.alerts.end}}

1. Configure the CLI to use your Google Cloud account and the new project ID by default:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud init
    ~~~

1. Set the `PROJECT_ID` environment variable:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export PROJECT_ID=<gcp_project_id>
    ~~~

    For the rest of the tutorial, we use `PROJECT_ID` to refer to the project ID.

## Step 7. Containerize the application and push it to the registry

1. Build the Docker image locally:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker build -t gcr.io/$PROJECT_ID/crdb-sample:v1 .
    ~~~

    If there are no errors, the container built successfully.

1. Authenticate Docker with GCP's Container Registry:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud auth configure-docker
    ~~~

1. Enable the Container Registry API for the project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud services enable containerregistry.googleapis.com
    ~~~

1. Push the Docker image to the project's registry.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker push gcr.io/$PROJECT_ID/crdb-sample:v1
    ~~~

## Step 8. Create a secret for the database connection URI

1. Create a service account to manage the secrets for your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud iam service-accounts create cockroach-labs
    ~~~

1. Enable the Secret Manager API for the project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud services enable secretmanager.googleapis.com
    ~~~

1. Create a secret for the connection string stored locally in the `DATABASE_URL` environment variable, and bind the new service account to the secret.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo $DATABASE_URL | gcloud secrets create cockroach-connection-uri --data-file=- --replication-policy=automatic
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud secrets add-iam-policy-binding cockroach-connection-uri \
        --member=serviceAccount:cockroach-labs@${PROJECT_ID}.iam.gserviceaccount.com \
        --role=roles/secretmanager.secretAccessor
    ~~~

## Step 9. Deploy the application on Cloud Run

1. Enable the Cloud Run API for the project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud services enable run.googleapis.com
    ~~~

1. Create a [Cloud Run](https://console.cloud.google.com/run/) service for the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud alpha run deploy crl-app --region us-central1 --allow-unauthenticated \
     --service-account=cockroach-labs@${PROJECT_ID}.iam.gserviceaccount.com \
       --set-secrets="DATABASE_URL=cockroach-connection-uri:latest" \
       --image=gcr.io/${PROJECT_ID}/crdb-sample:v1
    ~~~

    Note the following:
      - The `--region` flag specifies the region of the CockroachDB node targeted in the connection string.
      - The `--service-account` flag specifies the `cockroach-labs` service account that you created earlier for the app deployment.
      - The `--set-secrets` flag sets the `DATABASE_URL` environment variable to the `cockroach-connection-uri` secret that you created earlier.
      - The `--image` flag specifies the container image URL for the `crdb-sample` image that you pushed to the container registry.

    If prompted, select `Cloud Run (fully managed)`.

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
- [Deploy a Global, Serverless Application](movr-flask-deployment.html)

{% include {{page.version.version}}/app/see-also-links.md %}
