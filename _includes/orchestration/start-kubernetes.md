## Step 1. Choose your deployment environment

Choose whether you want to orchestrate CockroachDB with Kubernetes using the hosted Google Kubernetes Engine (GKE) service or manually on Google Container Engine (GCE) or AWS. The instructions below will change slightly depending on your choice.

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="gke-hosted">Hosted GKE</button>
  <button class="filter-button" data-scope="gce-manual">Manual GCE</button>
  <button class="filter-button" data-scope="aws-manual">Manual AWS</button>
</div>

## Step 2. Start Kubernetes

<div class="filter-content" markdown="1" data-scope="gke-hosted">

1. Complete the **Before You Begin** steps described in the [Google Container Engine Quickstart](https://cloud.google.com/container-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Container Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

2. From your local workstation, start the Kubernetes cluster:

    ~~~ shell
    $ gcloud container clusters create cockroachdb
    ~~~

    This creates GCE instances and joins them into a single Kubernetes cluster named `cockroachdb`.

    The process can take a few minutes, so don't move on to the next step until you see a `Creating cluster cockroachdb...done` message and details about your cluster.

</div>

<div class="filter-content" markdown="1" data-scope="gce-manual">

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the [Running Kubernetes on Google Compute Engine](http://kubernetes.io/docs/getting-started-guides/gce/) documentation.

The process includes:

- Creating a Google Cloud Platform account, installing `gcloud`, and other prerequisites.
- Downloading and installing the latest Kubernetes release.
- Creating GCE instances and joining them into a single Kubernetes cluster.
- Installing `kubectl`, the command-line tool used to manage Kubernetes from your workstation.

</div>

<div class="filter-content" markdown="1" data-scope="aws-manual">

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the [Running Kubernetes on AWS EC2](http://kubernetes.io/docs/getting-started-guides/aws/) documentation.

</div>
