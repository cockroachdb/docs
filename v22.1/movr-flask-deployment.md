---
title: Deploy a Global, Serverless Application
summary: This page includes instructions for deploying a multi-region web application using CockroachDB Cloud and Google Cloud services.
toc: true
redirect_from: multi-region-deployment.html
docs_area:
---

This page guides you through deploying an application and database in multiple regions. It is the fifth and final section of the [Develop and Deploy a Global Application](movr-flask-overview.html) tutorial.

<!-- {% include {{ page.version.version }}/misc/movr-live-demo.md %} -->

## Before you begin

Before you begin this section, complete the previous section of the tutorial, [Develop a Multi-Region Web Application](movr-flask-application.html). After you finish developing and debugging your multi-region application in a local development environment, you are ready to deploy the application and database in multiple regions.

In addition to the requirements listed in [Setting Up a Virtual Environment for Developing Multi-Region Applications](movr-flask-setup.html), make sure that you have the following:

- [A Google Cloud account](https://cloud.google.com/)
- [The Google Cloud SDK installed on your local machine](https://cloud.google.com/sdk/install)
- [Docker installed on your local machine](https://docs.docker.com/v17.12/docker-for-mac/install/)

## Multi-region database deployment

In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. To deploy CockroachDB in multiple regions, we recommend using [{{ site.data.products.dedicated }}](../cockroachcloud/quickstart.html).

{{site.data.alerts.callout_info}}
You can also deploy CockroachDB manually. For instructions, see the [Manual Deployment](manual-deployment.html) page of the Cockroach Labs documentation site.
{{site.data.alerts.end}}

### Create a multi-region {{ site.data.products.dedicated }} cluster

1. <a href="https://cockroachlabs.cloud/signup?referralId=docs_movr_global" rel="noopener" target="_blank">Sign up for a {{ site.data.products.db }} account</a>.

1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.

1. On the **Overview** page, select **Create Cluster**.

1. On the **Create new cluster** page:
    - For **Plan**, select {{ site.data.products.db }}. You won't be charged for the first 30 days of service.
    - For **Cloud Provider**, select Google Cloud.
    - For **Regions & nodes**, add "us-east1", "us-west1", and "europe-west1", with 3 nodes in each region.
    - Leave the **Hardware** and **Cluster name** as their default values.
    - For **Additional settings**, turn on VPC peering, with the default IP range.

1. Select **Next**, and on the **Summary** page, enter your credit card details.

    {{site.data.alerts.callout_info}}
    You will not be charged until after your free trial expires in 30 days.
    {{site.data.alerts.end}}

1. Select **Create cluster**.

    Your cluster will be created in approximately 20-30 minutes. Watch [this video](https://www.youtube.com/watch?v=XJZD1rorEQE) while you wait to get a preview of how you'll connect to your cluster.

    Once your cluster is created, you will be redirected to the **Cluster Overview** page.

1. On the **Cluster Overview** page, select **SQL Users** from the side panel.

1. Select **Add user**, give the user a name and a password, and then add the user. You can use any user name except "root".

1. Select **Networking** from the side panel, and select **Add network**.

1. From the **Network** dropdown, select **Current Network** to auto-populate your local machine's IP address. To allow the network to access the cluster's DB Console and to use the CockroachDB client to access the databases, select the **DB Console to monitor the cluster** and **CockroachDB Client to access the databases** checkboxes.

    {{site.data.alerts.callout_info}}
    After setting up your application's GCP project and GCP VPC network, you will need to return to the **Networking** page to configure VPC peering.
    {{site.data.alerts.end}}

### Initialize the `movr` database

1. Open a new terminal window on your local machine, and navigate to the `movr-flask` project directory.

1. In the {{ site.data.products.db }} Console, select **Connect** at the top-right corner of the page.

1. Select the **SQL User** that you created and the **Region** closest to you, and then select **Next**.

1. From the **Connection info** page, copy the `curl` command to download the cluster's root certificate, and execute the command in your terminal window. This root certificate is the same for all regions in a cluster.

1. From the **Connection info** page, copy the `cockroach sql` command. In the terminal window, execute the command with an `-f dbinit.sql` option at the end of the command. For example:

    ~~~ shell
    $ cockroach sql --url 'postgresql://user:password@cluster.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/Library/CockroachCloud/certs/root.crt' -f dbinit.sql
    ~~~

    This command will initialize the `movr` database on your {{ site.data.products.dedicated }} cluster.

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

### Set up VPC peering

1. Open the {{ site.data.products.db }} Console for your cluster, select the **Networking**, and then select **VPC peering**.

1. Set up a new VPC peering connection, with your Google Cloud project's ID, the `default` VPC network created for your Google Cloud project, and a new VPC connection name (e.g., `movr-app-vpc`).

1. Copy the `gcloud` command provided by the console, and execute the command in a new terminal window.

    {{site.data.alerts.callout_info}}
    The connection strings used to connect to {{ site.data.products.db }} from an application in a VPC network differ slightly from connection strings to allow-listed IP addresses.
    {{site.data.alerts.end}}

1. Obtain the VPC connection string for each region:

    1. Open {{ site.data.products.db }} Console, and select **Connect** at the top right of the page.
    1. Select **VPC Peering** for **Network Security**, your SQL username for the **SQL User**, one of the cluster regions for **Region**, `movr` for the **Database**.
    1. Select **Next**. On the following page, select the **Connection string** tab, and then copy the connection string provided.

    Take note of each region's connection string. You will need to provide connection information to the Google Cloud Run service in each region.

1. Open the Google Cloud console for your project. Under the **VPC network** services, select the **Serverless VPC access** service.

1. For each Cloud Run service, create a new VPC connector:
    - For **Name**, use a name specific to the region.
    - For **Region**, use the region of the Cloud Run service.
    - For **Network**, use `default`.
    - For **Subnet**, specify a custom IP range. This range must be an unused `/28` CIDR IP range (`10.8.0.0`, `10.8.1.0`, `10.8.2.0`, etc.).

### Containerize the application

1. Create a new folder named `certs` at the top level of the `movr-flask` project, and then copy the root certificate that you downloaded for your cluster to the new folder. The `Dockerfile` for the application contains instructions to mount this folder and certificate onto the container.

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

### Deploy the application

1. Create a [Google Cloud Run](https://console.cloud.google.com/run/) service for the application, in one of the regions in which the database is deployed (e.g., `gcp-us-east1`):
    - Select the container image URL for the image that you just pushed to the container registry.
    - Under **Advanced settings**->**Variables & Secrets**, do the following:
        - Set an environment variable named `DB_URI` to the VPC connection string for a node on the {{ site.data.products.dedicated }} cluster, in the region in which this first Cloud Run service is located.    

            Verify that the `DB_URI` value:
            1. Specifies `cockroachdb` as the database protocol.
            1. Includes both the username and password.
            1. Includes the path to the container-mounted root certificate (e.g., `certs/root.crt`).

            For example: `cockroachdb://user:password@internal-cluster.gcp-us-east1.cockroachlabs.cloud:26257/movr?sslmode=verify-full&sslrootcert=certs/root.crt`
        - Set an environment variable named `REGION` to the {{ site.data.products.db }} region (e.g., `gcp-us-east1`).
        - **Optional:** Create a secret for your Google Maps API key and use it to set the environment variable `API_KEY`. You may need to enable the Secret Manager API to do this.

1. Repeat the Google Cloud Run set-up steps for all regions.

    {{site.data.alerts.callout_info}}
    Each region has the same root certificate, but different connection strings.
    {{site.data.alerts.end}}

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

This tutorial demonstrates how to develop and deploy an example multi-region application. Most of the development instructions are specific to Python, Flask, and SQLAlchemy, and most of the deployment instructions are specific to Google Cloud Platform (GCP). CockroachDB supports [many more drivers and ORM's for development](example-apps.html), and you can deploy applications using a number of cloud provider orchestration tools and networking services. We encourage you to modify the code and deployments to fit your framework and use case.

### Upgrade your deployment

Some time after you have deployed your application, you will likely need to push changes that you've made locally. When pushing changes, be aware that you defined the database separate from the application. If you change a data type, for example, in your application, you will also need to modify the database schema to be compatible with your application's requests. For information about making online changes to database schemas, see [Online Schema Changes](online-schema-changes.html).

## See also

<!-- [MovR (live demo)](https://movr.cloud)-->
- [{{ site.data.products.db }} documentation](../cockroachcloud/quickstart.html)
- [Google Cloud Platform documentation](https://cloud.google.com/docs/)
- [Docker documentation](https://docs.docker.com/)
- [Kubernetes documentation](https://kubernetes.io/docs/home/)
