## Step 1. Choose your deployment environment

Choose whether you want to orchestrate CockroachDB with Kubernetes using the hosted Google Kubernetes Engine (GKE) service or manually on Google Compute Engine (GCE) or AWS. The instructions below will change slightly depending on your choice.

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="gke-hosted">Hosted GKE</button>
  <button class="filter-button" data-scope="gce-manual">Manual GCE</button>
  <button class="filter-button" data-scope="aws-manual">Manual AWS</button>
</div>

## Step 2. Start Kubernetes

<section class="filter-content" markdown="1" data-scope="gke-hosted">

1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    {{site.data.alerts.callout_success}}The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the CockroachDB Admin UI using the steps in this guide.{{site.data.alerts.end}}

2. From your local workstation, start the Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb
    ~~~

    ~~~
    Creating cluster cockroachdb...done.
    ~~~

    This creates GKE instances and joins them into a single Kubernetes cluster named `cockroachdb`.

    The process can take a few minutes, so do not move on to the next step until you see a `Creating cluster cockroachdb...done` message and details about your cluster.

{% if page.secure == true %}

3. Get the email address associated with your Google Cloud account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud info | grep Account
    ~~~

    ~~~
    Account: [your.google.cloud.email@example.org]
    ~~~

4. [Create the RBAC roles](https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control#prerequisites_for_using_role-based_access_control) CockroachDB needs for running on GKE, using the address from the previous step:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org>
    ~~~

    ~~~
    clusterrolebinding "cluster-admin-binding" created
    ~~~


{% endif %}

</section>

<section class="filter-content" markdown="1" data-scope="gce-manual">

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the [Running Kubernetes on Google Compute Engine](https://v1-18.docs.kubernetes.io/docs/setup/production-environment/turnkey/gce/) documentation.

The process includes:

- Creating a Google Cloud Platform account, installing `gcloud`, and other prerequisites.
- Downloading and installing the latest Kubernetes release.
- Creating GCE instances and joining them into a single Kubernetes cluster.
- Installing `kubectl`, the command-line tool used to manage Kubernetes from your workstation.

</section>

<section class="filter-content" markdown="1" data-scope="aws-manual">

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the [Running Kubernetes on AWS EC2](https://v1-18.docs.kubernetes.io/docs/setup/production-environment/turnkey/aws/) documentation.

</section>
