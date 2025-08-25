---
title: Deploy a Global Serverless Application
summary: This page includes instructions for deploying a multi-region web application using CockroachDB Standard and Google Cloud Platform.
toc: true
docs_area:
---

This page guides you through deploying an application and database in multiple regions. It is the fifth and final section of the [Develop and Deploy a Global Application]({% link {{ page.version.version }}/movr.md %}#develop-and-deploy-a-global-application) tutorial.

## Before you begin

Before you begin this section, complete the previous sections of the tutorial, ending with [Develop a Multi-Region Web Application]({% link {{ page.version.version }}/movr-flask-application.md %}). After you finish developing and debugging your multi-region application in a local development environment, you are ready to deploy the application and database in multiple regions.

In addition to the requirements listed in [Setting Up a Virtual Environment for Developing Multi-Region Applications]({% link {{ page.version.version }}/movr-flask-setup.md %}):

- Log in to [Google Cloud](https://cloud.google.com/).
- Install the [Google Cloud SDK](https://cloud.google.com/sdk/install).
- Install a container runtime, such as [Docker Desktop](https://www.docker.com/products/docker-desktop/), and ensure that it is running in the background.

## Multi-region database deployment

In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. To deploy CockroachDB in multiple regions, we recommend using [CockroachDB {{ site.data.products.standard }}]({% link cockroachcloud/quickstart.md %}). To use CockroachDB {{ site.data.products.core }} instead, refer to [Install CockroachDB](/docs/{{ page.version.version }}/install-cockroachdb.html).

### Create a multi-region CockroachDB {{ site.data.products.standard }} cluster

1. Create a [CockroachDB {{ site.data.products.cloud }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account and log in.
1. On the **Clusters** page, click **Create cluster**.
1. On the **Select a plan** page, select **Standard**.
1. On the **Cloud & Regions** page, set **Cloud provider** to **GCP**.
1. In the **Regions** section, add `us-east1`, `us-west1`, and `europe-west1`. Keep the default of 3 nodes per region.
      Click **Next: Capacity**.
1. Keep the **Provisioned capacity** at the default value of 1000 RUs/second.
      Click **Next: Finalize**.
1. On the **Finalize** page, optionally name your cluster. If applicable, the 30-day trial code is pre-applied to your cluster.

      Click **Create cluster**.

      Your cluster will be created in a few seconds and the **Create SQL user** dialog will display.

1. Enter a username for the SQL user. Click **Generate & Save Password**. Save the username and password to a secure location such as a password manager. Click **Next**, then **Close**.

    The **Cluster Overview** page appears.

1. On the **Cluster Overview** page, select **Networking**, then select the **IP Allowlist** tab.

1. Click **Add Network**. From the **Network** dropdown, select **Current Network** to auto-populate your local machine's IP address. This allows your local machine to access the cluster's DB Console and to use the CockroachDB client to access the databases.

    {{site.data.alerts.callout_info}}
    After setting up your application's GCP project and GCP VPC network, you will need to return to the **Networking** page to configure GCP Private Service Connect for private connectivity.
    {{site.data.alerts.end}}

### Initialize the `movr` database

1. Open a new terminal window on your local machine, and navigate to the `movr-flask` project directory.

1. In your web browser, log in to the CockroachDB {{ site.data.products.cloud }} Console, then select **Connect** at the top-right corner of the page.

1. Select the **SQL User** that you created and the **Region** closest to you, and then select **Next**.

1. From the **Connection info** dialog, click **Download CA Certificate**, then follow the instructions. This is required only once per client. This root certificate is the same for all regions in a cluster.

1. Under **Select option/language**, select **CockroachDB Client**. Copy the command.
1. In a new terminal window, navigate to the `movr-flask` project directory, then paste the command you just copied. Add the ` -f dbinit.sql` option at the end of the command. For example:

    ~~~ shell
    cockroach sql \
      --url 'postgresql://user:password@cluster.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/Library/CockroachCloud/certs/root.crt' \
      -f dbinit.sql
    ~~~

    This command will initialize the `movr` database on the cluster in CockroachDB {{ site.data.products.cloud }}.

## Global application deployment

To optimize the latency of requests from the application to the database, you need to deploy the application in multiple regions.

{{site.data.alerts.callout_danger}}
This example deploys a secure web application. To take HTTPS requests, the web application must be accessible using a public domain name. SSL certificates are not assigned to IP addresses.

We do not recommend deploying insecure web applications on public networks.
{{site.data.alerts.end}}

### Set up a GCP project

1. From the [GCP console](https://console.cloud.google.com/), create a Google Cloud project for the application.

    {{site.data.alerts.callout_info}}
    Google Cloud automatically creates a `default` VPC network for each project.
    {{site.data.alerts.end}}

1. In the [API Library](https://console.cloud.google.com/apis/library), enable the following APIs for your project:
    - Container Registry API
    - Cloud Run Admin API
    - Serverless VPC Access API

1. **Optional:** Enable the [Google Maps Embed API](https://console.cloud.google.com/apis/library), create an API key, restrict the API key to all URLS on your domain name (e.g., `https://site.com/*`), and retrieve the API key.

    {{site.data.alerts.callout_info}}
    The example HTML templates include maps. Not providing an API key to the application will prevent the maps from loading, but will not prevent the rest of the application from functioning.
    {{site.data.alerts.end}}

1. Initialize and log in using the `gcloud` command-line tool.

    {{site.data.alerts.callout_info}}
    `gcloud` is included with the [Google Cloud SDK](https://cloud.google.com/sdk) installation.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud init
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud auth login
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud auth application-default login
    ~~~

### Set up GCP Private Service Connect

GCP Private Service Connect allows your cluster to connect to your Google Cloud project using private cloud infrastructure rather than the public internet. To set up PSC:

1. Once for each cluster region, follow the instructions to [Establish private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity).

1. To obtain the private connection string your application will use to connect privately to your cluster, click **Connect** at the top-right corner of the page, then:
    - Select the **SQL User** that you created.
    - For each cluster region:
        - Select the region.
        - For **Connection type**, select **Private connection**, then select the private connection you just created.
        - Under **Select option/language**, select **General connection string**. Copy the connection string.

You now have a private connection string for each of the cluster's regions. You will use these connection strings to [deploy the application](#deploy-the-application).

### Containerize the application

1. Create a new directory named `certs` at the top level of the `movr-flask` project, and then copy the root certificate that you downloaded for your cluster to the new directory. The `Dockerfile` for the application contains instructions to mount this directory onto the container so that it can read the CA certificate.

1. Build the container image locally.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker build -t gcr.io/<gcp_project>/movr-app:v1 .
    ~~~

    If there are errors, verify that your container runtime is running in the background and try again.

1. Push the container image to the Google Cloud project's container registry.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker push gcr.io/<gcp_project>/movr-app:v1
    ~~~

The image can now be pulled by container runtimes with access to your Google Cloud project.

### Deploy the application

1. Create a [Google Cloud Run](https://console.cloud.google.com/run/) service for the application, in one of the regions in which the database is deployed:
    - Select the container image that you just pushed your project's registry.
    - Under **Advanced settings**->**Variables & Secrets**:
        - Create a new environment variable named `DB_URI`. Set its value to the private connection string for this region that you copied when you [set up GCP Private Service Connect](#set-up-gcp-private-service-connect) with the following modifications:
            1. Change `postgresql://` to `cockroachdb://`.
            1. Add `&sslrootcert=certs/root.crt` directly after `sslmode=verify-full`.

            For example: `cockroachdb://user:password@internal-cluster.gcp-us-east1.cockroachlabs.cloud:26257/movr?sslmode=verify-full&sslrootcert=certs/root.crt`
        - Create a new environment variable named `REGION` to the region associated with the connection string.
        - **Optional:** Enable the Secret Manager API, then create a secret for your Google Maps API key and set the the environment variable `API_KEY` to its value.

1. Create an [external HTTPS load balancer](https://console.cloud.google.com/net-services/loadbalancing) to route requests to the service in each region:
    - For the backend configuration, create separate network endpoint groups (NEGs) for the Google Cloud Run services in each region.
    - For the frontend configuration, use the HTTPS protocol. You can create a [managed IP address](https://console.cloud.google.com/networking/addresses) and a [managed SSL cert](https://console.cloud.google.com/net-services/loadbalancing/advanced/sslCertificates) for the load balancer directly from the load balancer console. For the SSL cert, you will need to specify a domain name.

    For detailed instructions on setting up a load balancer for a multi-region Google Cloud Run backend, see the [GCP Load Balancer docs](https://cloud.google.com/load-balancing/docs/https/setting-up-https-serverless#ip-address).

1. In the **Cloud DNS** console (found under **Network Services**), create a new zone. You can name the zone whatever you want. Enter the same domain name for which you created a certificate earlier.

1. Select your zone, and copy the nameserver addresses **Data** for the recordset labeled **NS**.

1. In your domain's DNS provider, add the nameserver addresses to the authoritative nameserver list for your domain.

    {{site.data.alerts.callout_info}}
    It can take up to 48 hours for changes to the authoritative nameserver list to take effect.
    {{site.data.alerts.end}}

1. Navigate to the domain name to access and test your application.

## Next steps

### Develop your own application

This tutorial demonstrates how to develop and deploy an example multi-region application. Most of the development instructions are specific to Python, Flask, and SQLAlchemy, and most of the deployment instructions are specific to Google Cloud Platform (GCP). CockroachDB supports [many more drivers and ORMs for development]({% link {{ page.version.version }}/example-apps.md %}), and you can deploy applications using a number of cloud provider orchestration tools and networking services. We encourage you to modify the code and deployments to fit your framework and use case.

### Upgrade your deployment

When pushing changes to update your deployment, remember that you defined the database separate from the application. If you change a data type, for example, in your application, you will also need to modify the database schema to be compatible with your application's requests. For information about making online changes to database schemas, refer to [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %}).

## See also

- [CockroachDB {{ site.data.products.cloud }} quickstart]({% link cockroachcloud/quickstart.md %})
- [Google Cloud Platform documentation](https://cloud.google.com/docs/)
