---
title: Deploy a Global, Serverless Application
summary: This page includes instructions for deploying a multi-region web application using CockroachCloud and Google Cloud services.
toc: true
redirect_from: multi-region-deployment.html
---

This page walks you through deploying an application and database in multiple regions. It is the fifth and final section of the [Develop and Deploy a Global Application](movr-flask-overview.html) tutorial.

{% include {{ page.version.version }}/misc/movr-live-demo.md %}

## Before you begin

Before you begin this section, complete the previous section of the tutorial, [Develop a Multi-Region Web Application](movr-flask-application.html). After you finish developing and debugging your multi-region application in a local development environment, you are ready to deploy the application and database in multiple regions.

In addition to the requirements listed in [Setting Up a Virtual Environment for Developing Multi-Region Applications](movr-flask-setup.html), make sure that you have the following:

- [A Google Cloud account](https://cloud.google.com/)
- [The Google Cloud SDK installed on your local machine](https://cloud.google.com/sdk/install)
- [Docker installed on your local machine](https://docs.docker.com/v17.12/docker-for-mac/install/)

## Multi-region database deployment

In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. To deploy CockroachDB in multiple regions, using [CockroachCloud](../cockroachcloud/quickstart.html):

1. Create a CockroachCloud account at [https://cockroachlabs.cloud](https://cockroachlabs.cloud).

1. Request a multi-region CockroachCloud cluster on GCP, in regions "us-west1", "us-east1", and "europe-west1".

1. After the cluster is created, open the console, and select the cluster.

1. Select **SQL Users** from the side panel, select **Add user**, give the user a name and a password, and then add the user. You can use any user name except "root".

1. Select **Networking** from the side panel, and then select **Add network**. Give the network any name you'd like, select either a **New network** or a **Public network**, check both **UI** and **SQL**, and then add the network. In this example, we use a public network.

1. Select **Connect** at the top-right corner of the cluster console.

1. Select the **User** that you created, and then **Continue**.

1. Copy the connection string, with the user and password specified.

1. **Go back**, and retrieve the connection strings for the other two regions.

1. Download the cluster cert to your local machine (it's the same for all regions).

1. Open a new terminal, and run the `dbinit.sql` file on the running cluster to initialize the database. You can connect to the database from any node on the cluster for this step.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url any-connection-string < dbinit.sql
    ~~~

    {{site.data.alerts.callout_info}}
    You need to specify the password in the connection string!
    {{site.data.alerts.end}}

    e.g.,

    ~~~ shell
    $ cockroach sql --url \ 'postgresql://user:password@region.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=certs-dir/movr-app-ca.crt' -f dbinit.sql
    ~~~

{{site.data.alerts.callout_info}}
You can also deploy CockroachDB manually. For instructions, see the [Manual Deployment](manual-deployment.html) page of the Cockroach Labs documentation site.
{{site.data.alerts.end}}

## Global application deployment

To optimize the latency of requests from the application to the database, you need to deploy the application in multiple regions.

{{site.data.alerts.callout_danger}}
This example deploys a secure web application. To take HTTPS requests, the web application must be accessible using a public domain name. SSL certificates are not assigned to IP addresses.

We do not recommend deploying insecure web applications on public networks.
{{site.data.alerts.end}}

1. From the [GCP console](https://console.cloud.google.com/), create a Google Cloud project for the application.

1. **Optional:** Enable the [Google Maps Embed API](https://console.cloud.google.com/apis/library), create an API key, restrict the API key to all URLS on your domain name (e.g., `https://site.com/*`), and retrieve the API key.

    {{site.data.alerts.callout_info}}
    The example HTML templates include maps. Not providing an API key to the application will prevent the maps from loading, but will not break the rest of the application.
    {{site.data.alerts.end}}

1. Configure/authorize the `gcloud` command-line tool to use your project and region.

    {{site.data.alerts.callout_info}}
    `gcloud` is included with the [Google Cloud SDK](https://cloud.google.com/sdk) installation.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud init
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud auth login
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud auth application-default login
    ~~~

1. Build and run the Docker image locally.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker build -t gcr.io/<gcp_project>/movr-app:v1 .
    ~~~

    If there are no errors, the container built successfully.

1. Push the Docker image to the Google Cloud project's container registry.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker push gcr.io/<gcp_project>/movr-app:v1
    ~~~

1. Create a [Google Cloud Run](https://console.cloud.google.com/run/) service for the application, in one of the regions in which the database is deployed (e.g., `gcp-us-east1`).

1. Deploy a revision of your application to Google Cloud Run:
    - Select the container image URL for the image that you just pushed to the container registry.
    - Under **Advanced settings**->**Variables & Secrets**, do the following:
        - Set an environment variable named `DB_URI` to the connection string for a gateway node on the CockroachCloud cluster, in the region in which this first Cloud Run service is located (e.g., `cockroachdb://user:password@movr-db.gcp-us-east1.cockroachlabs.cloud:26257/movr?sslmode=verify-full&sslrootcert=certs/movr-db-ca.crt`).
        - Set an environment variable named `REGION` to the CockroachCloud region (e.g., `gcp-us-east1`).
        - Create a secret for the CockroachCloud certificate, and mount it on the `certs` volume, with a full path ending in the name of the cert (e.g., `certs/movr-db-ca.crt`). This is the cert downloaded from the {{ site.data.products.db }} Console, and referenced in the `DB_URI` connection string.
        - **Optional:** Create a secret for your Google Maps API key and use it to set the environment variable `API_KEY`.

1. Repeat the Google Cloud Run set-up steps for all regions.

1. Create an [external HTTPS load balancer](https://console.cloud.google.com/net-services/loadbalancing) to route requests to the right service:
    - For the backend configuration, create separate network endpoint groups (NEGs) for the Google Cloud Run services in each region.
    - For the frontend configuration, make sure that you use the HTTPS protocol. You can create a [managed IP address](https://console.cloud.google.com/networking/addresses) and a [managed SSL cert](https://console.cloud.google.com/net-services/loadbalancing/advanced/sslCertificates) for the load balancer directly from the load balancer console. For the SSL cert, you will need to specify a domain name.

    For detailed instructions on setting up a load balancer for a multi-region Google Cloud Run backend, see the [GCP Load Balancer docs](https://cloud.google.com/load-balancing/docs/https/setting-up-https-serverless#ip-address).

1. In the **Cloud DNS** console (found under **Network Services**), create a new zone. You can name the zone whatever you want. Enter the same domain name for which you created a certificate earlier.

1. Select your zone, and copy the nameserver addresses (under "**Data**") for the recordset labeled "**NS**".

1. Outside of the GCP console, through your domain name provider, add the nameserver addresses to the authoritative nameserver list for your domain name.

    {{site.data.alerts.callout_info}}
    It can take up to 48 hours for changes to the authoritative nameserver list to take effect.
    {{site.data.alerts.end}}

1. Navigate to the domain name and test out your application.

## Next steps

### Develop your own application

This tutorial demonstrates how to develop and deploy an example multi-region application. Most of the development instructions are specific to Python, Flask, and SQLAlchemy, and most of the deployment instructions are specific to Google Cloud Platform (GCP). CockroachDB supports [many more drivers and ORM's for development](hello-world-example-apps.html), and you can deploy applications using a number of cloud provider orchestration tools and networking services. We encourage you to modify the code and deployments to fit your framework and use case.

### Upgrade your deployment

Some time after you have deployed your application, you will likely need to push changes that you've made locally. When pushing changes, be aware that you defined the database separate from the application. If you change a data type, for example, in your application, you will also need to modify the database schema to be compatible with your application's requests. For information about making online changes to database schemas, see [Online Schema Changes](online-schema-changes.html).

## See also

- [MovR (live demo)](https://movr.cloud)
- [CockroachCloud documentation](../cockroachcloud/quickstart.html)
- [Google Cloud Platform documentation](https://cloud.google.com/docs/)
- [Docker documentation](https://docs.docker.com/)
- [Kubernetes documentation](https://kubernetes.io/docs/home/)
