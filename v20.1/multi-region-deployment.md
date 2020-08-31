---
title: Deploy a Multi-Region Web Application
summary: This page includes instructions for deploying a multi-region web application using CockroachCloud and Google Cloud services.
toc: true
---

This page walks you through deploying an application and database in multiple regions. It is the fifth and final section of the [Develop and Deploy a Multi-Region Web Application](multi-region-overview.html) tutorial.

{% include {{ page.version.version }}/misc/movr-live-demo.md %}

## Before you begin

Before you begin this section, complete the previous section of the tutorial, [Develop a Multi-Region Web Application](multi-region-application.html). After you finish developing and debugging your multi-region application in a local development environment, you are ready to deploy the application and database in multiple regions.

In addition to the requirements listed in [Setting Up a Virtual Environment for Developing Multi-Region Applications](multi-region-setup.html), make sure that you have the following installed on your local machine:

- [Google Cloud SDK](https://cloud.google.com/sdk/install)
- [Docker](https://docs.docker.com/v17.12/docker-for-mac/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

## Multi-region database deployment

In production, you want to start a secure CockroachDB cluster, with nodes on machines located in different areas of the world. To deploy CockroachDB in multiple regions, using [CockroachCloud](../cockroachcloud/quickstart.html):

1. Create a CockroachCloud account at [https://cockroachlabs.cloud](https://cockroachlabs.cloud).

1. Request a multi-region CockroachCloud cluster on GCP, in regions us-west1, us-east1, and europe-west1.

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
    $ cockroach sql --url \ 'postgresql://user:password@region.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=certs-dir/movr-app-ca.crt' < dbinit.sql
    ~~~

{{site.data.alerts.callout_info}}
You can also deploy CRDB manually. For instructions, see the [Manual Deployment](manual-deployment.html) page of the Cockroach Labs documentation site.
{{site.data.alerts.end}}

## Multi-region application deployment (GKE)

To deploy an application in multiple regions in production, we recommend that you use a [managed Kubernetes engine](https://kubernetes.io/docs/setup/#production-environment), like [Amazon EKS](https://aws.amazon.com/eks/), [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/), or [Azure Kubernetes Service](https://azure.microsoft.com/en-us/services/kubernetes-service/). To route requests to the container cluster deployed closest to clients, you should also set up a multi-cluster [ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/).

In this tutorial, we use [kubemci](https://cloud.google.com/kubernetes-engine/docs/how-to/multi-cluster-ingress) to configure a GCP HTTP Load Balancer to container clusters deployed on GKE.

{{site.data.alerts.callout_info}}
To serve a secure web application, you also need a public domain name!
{{site.data.alerts.end}}

1. If you don't have a gcloud account, create one at https://cloud.google.com/.

1. Create a gcloud project on the [GCP console](https://console.cloud.google.com/).

1. **Optional:** Enable the [Google Maps Embed API](https://console.cloud.google.com/apis/library), create an API key, restrict the API key to all subdomains of your domain name (e.g. `https://site.com/*`), and retrieve the API key.

    {{site.data.alerts.callout_info}}
    The example HTML templates include maps. Not providing an API key to the application will not break the application.
    {{site.data.alerts.end}}

1. Configure/authorize the `gcloud` CLI to use your project and region.

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

1. If you haven't already, install `kubectl`.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud components install kubectl
    ~~~

1. Build and run the Docker image locally.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker build -t gcr.io/<gcp_project>/movr-app:v1 .
    ~~~

    If there are no errors, the container built successfully.

1. Push the Docker image to the project’s gcloud container registry.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker push gcr.io/<gcp_project>/movr-app:v1
    ~~~

1. Create a K8s cluster for all three regions.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud config set compute/zone us-east1-b && \
      gcloud container clusters create movr-us-east
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud config set compute/zone us-west1-b && \
      gcloud container clusters create movr-us-west
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell  
    $ gcloud config set compute/zone europe-west1-b && \
      gcloud container clusters create movr-europe-west
    ~~~

1. Add the container credentials to `kubeconfig`.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ KUBECONFIG=~/mcikubeconfig gcloud container clusters get-credentials --zone=us-east1-b movr-us-east
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ KUBECONFIG=~/mcikubeconfig gcloud container clusters get-credentials --zone=us-west1-b movr-us-west
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ KUBECONFIG=~/mcikubeconfig gcloud container clusters get-credentials --zone=europe-west1-b movr-europe-west
    ~~~

1. For each cluster context, create a secret for the connection string, Google Maps API, and the certs, and then create the k8s deployment and service using the `movr.yaml` manifest file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl config use-context <context-name> && \
    kubectl create secret generic movr-db-cert --from-file=cert=<full-path-to-cert> && \
    kubectl create secret generic movr-db-uri --from-literal=DB_URI="connection-string" && \
    kubectl create secret generic maps-api-key --from-literal=API_KEY="APIkey" \
    kubectl create -f ~/movr-flask/movr.yaml
    ~~~

    Where:
    <ul>
      <li>`<context-name>` is the cluster context for a regional deployment. To get the contexts for all deployments, run `$ kubectl config get-contexts -o name`.</li>
      <li>`<full-path-to-cert>` is the full directory path to the certificates for [the multi-region CockroachCloud cluster](#multi-region-database-deployment). These certificates are available for download from the CockroachCloud console, and they are the same for all regions.</li>
      <li>`<connection-string>` is the full connection string to the gateway node of [a regional CockroachCloud deployment](#multi-region-database-deployment). It should look something like:<br> `postgresql://user:password@region.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=certs-dir/movr-app-ca.crt`</li>
      <li>`<APIkey>` is the API key for the [Google Maps Embed API](https://console.cloud.google.com/apis/library). This API key is *not* required to run the demo application. Not providing a Google Maps Embed API key will not break the application.</li>
    </ul>

    {{site.data.alerts.callout_info}}
    Secrets must be generated for each cluster context.
    {{site.data.alerts.end}}

1. Reserve a static IP address for the ingress.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud compute addresses create --global movr-ip
    ~~~

    To verify that you successfully created the new IP address, run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud compute addresses list
    ~~~


1. Download [`kubemci`](https://github.com/GoogleCloudPlatform/k8s-multicluster-ingress), and then make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ chmod +x ~/kubemci
    ~~~

1. Use `kubemci` to make the ingress.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ~/kubemci create movr-mci \
    --ingress=<path>/movr-flask/mcingress.yaml \
    --gcp-project=<gcp_project> \
    --kubeconfig=<path>/mcikubeconfig
    ~~~

    {{site.data.alerts.callout_info}}
    `kubemci` requires full paths.
    {{site.data.alerts.end}}

1. In GCP's **Load balancing** console (found under **Network Services**), select and edit the load balancer that you just created.

    1. Edit the backend configuration.
        - Expand the advanced configurations, and add [a custom header](https://cloud.google.com/load-balancing/docs/user-defined-request-headers): `X-City: {client_city}`. This forwards an additional header to the application telling it what city the client is in. The header name (`X-City`) is hardcoded into the example application.

    1. Edit the frontend configuration, and add a new frontend.
        - Under "**Protocol**", select HTTPS.
        - Under "**IP address**", select the static IP address that you reserved earlier (e.g., "`movr-ip`").
        - Under "**Certificate**", select "**Create a new certificate**".
        - On the "**Create a new certificate**" page, give a name to the certificate (e.g., "`movr-ssl-cert`"), check "**Create Google-managed certificate**", and then under "Domains", enter a domain name that you own and want to use for your application.
    1. Review and finalize the load balancer, and then "**Update**".

        {{site.data.alerts.callout_info}}
        It will take several minutes to provision the SSL certificate that you just created for the frontend.
        {{site.data.alerts.end}}

1. Check the status of the ingress.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ~/kubemci list --gcp-project=<gcp_project>
    ~~~

1. In the **Cloud DNS** console (found under **Network Services**), create a new zone. You can name the zone whatever you want. Enter the same domain name for which you created a certificate earlier.

1. Select your zone, and copy the nameserver addresses (under "**Data**") for the recordset labeled "**NS**".

1. Outside of the GCP console, through your domain name provider, add the nameserver addresses to the authorative nameserver list for your domain name.

    {{site.data.alerts.callout_info}}
    It can take up to 48 hours for changes to the authorative nameserver list to take effect.
    {{site.data.alerts.end}}

1. Navigate to the domain name and test out your application.

## Next steps

### Develop your own application

This tutorial demonstrates how to develop and deploy an example multi-region application. Most of the development instructions are specific to Python, Flask, and SQLAlchemy, and most of the deployment instructions are specific to Google Cloud Platform, Docker, and Kubernetes. CockroachDB supports [many more drivers and ORM's for development](build-an-app-with-cockroachdb.html). You can deploy applications using a number of cloud provider orchestration tools and networking services. We encourage you to modify the code and deployments to fit your framework and use case.

### Upgrade your deployment

Some time after you have deployed your application, you will likely need to push changes that you've made locally. When pushing changes, be aware that you defined the database separate from the application. If you change a data type, for example, in your application, you will also need to modify the database schema to be compatible with your application's requests. For information about making online changes to database schemas, see [Online Schema Changes](https://www.cockroachlabs.com/docs/stable/online-schema-changes.html).

## See also

- [MovR (live demo)](https://movr.cloud)
- [CockroachCloud documentation](../cockroachcloud/quickstart.html)
- [Google Cloud Platform documentation](https://cloud.google.com/docs/)
- [Docker documentation](https://docs.docker.com/)
- [Kubernetes documentation](https://kubernetes.io/docs/home/)
