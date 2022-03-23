---
title: Get Started with the ccloud CLI
summary: The ccloud CLI is used to create, manage, and connect to CockroachDB Cloud clusters
toc: true
docs_area: manage
---

The `ccloud` tool is a command line interface (CLI) tool that allows you to create, manage, and connect to CockroachDB Cloud clusters.

## Install ccloud

Choose your OS:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="mac"><strong>Mac</strong></button>
    <button class="filter-button page-level" data-scope="linux"><strong>Linux</strong></button>
    <button class="filter-button page-level" data-scope="windows"><strong>Windows</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">
1. Download the ccloud binary.
1. Extract the ccloud binary and add it to your `PATH`.
</section>
<section class="filter-content" markdown="1" data-scope="linux">
1. Download the ccloud binary.
1. Extract the ccloud binary and add it to your `PATH`.
</section>
<section class="filter-content" markdown="1" data-scope="windows">
1. Download the ccloud binary.
1. Extract the ccloud binary and add it to your `PATH`.
</section>

## Log in to CockroachDB Cloud using ccloud

1. Run the `ccloud auth login` command and hit **Enter** to open a browser window.:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud auth login
    ~~~

    This will take you to the CockroachDB Cloud login page.

1. Enter your username and password if you already have a CockroachDB Cloud account, then click **Continue**.

    If you do not have a CockroachDB Cloud account, click **Sign up with GitHub** or **Sign up** to register.

1. Close the browser window and return to your terminal.

## Create a new cluster using ccloud

The `ccloud cluster create` command creates new CockroachDB clusters in your organization. You can create {{ site.data.products.serverless }} or {{ site.data.products.dedicated }} clusters.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless">{{ site.data.products.serverless }}<strong></strong></button>
    <button class="filter-button page-level" data-scope="dedicated"><strong>{{ site.data.products.dedicated }}</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

1. Create a free {{ site.data.products.serverless }} cluster using the `ccloud cluster create` command.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create
    ~~~

    This command creates a {{ site.data.products.serverless }} cluster in the default cloud infrastructure provider (GCP) and the closest region for that provider. It will generate a cluster name.

    ~~~
    Creating cluster Success! Created cluster
    name: dim-dog
    ~~~

    The cluster name, cloud infrastructure provider, region, and spend limit can be set as command options. The following command is equivalent to the previous command that uses the default values.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create serverless dim-dog us-central1 --cloud GCP --spend-limit 0
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

1. Create a free {{ site.data.products.dedicated }} cluster using the `ccloud cluster create` command.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create dedicated
    ~~~

    This command creates a 1 node {{ site.data.products.dedicated }} cluster with 2 virtual CPUs (vCPUs) and 15 GiB of storage in the default cloud infrastructure provider (GCP) and the closest region for that provider. It will generate a cluster name. The CockroachDB version will be the latest stable version.

    The cluster name, cloud infrastructure provider, region, number of nodes, and storage can be set as command options. The following command is equivalent to the previous command that uses the default values.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create dedicated dim-dog us-central1:1 --cloud GCP --vcpus 2 --storage-gib 15
    ~~~

    ~~~
    ∙∙∙ Creating cluster
    Success! Created cluster
      name: dim-dog
      id: ec5e50eb-67dd-4d25-93b0-91ee7ece778d
    ~~~

    When creating multi node clusters, you must specify how many nodes should be in each region supported by the cloud infrastructure provider. For example, the following command creates a 3 node cluster where 2 nodes are in `us-central1` and 1 node is in `us-west2`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create dedicated dim-dog us-central1:2 us-west2:1 --cloud GCP --vcpus 2 --storage-gib 15
    ~~~
</section>

{{site.data.alerts.callout_info}}
If you set a maximum spend limit greater than $0 on a {{ site.data.products.serverless }} cluster, or create a {{ site.data.products.dedicated }} cluster, you must [add a credit card](billing-management.html) to your organization.
{{site.data.alerts.end}}

## Get a list of all the clusters in your organization

The `ccloud cluster list` command shows information about the clusters in your organization. It outputs columns with the cluster name, the cluster ID, the cluster plan, the creation date, the cluster's current state, the cloud provider, and the version of CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster list
~~~

<div class="filter-content" markdown="1" data-scope="serverless">

~~~
∙∙∙ Retrieving clusters...
NAME                 ID                                    PLAN TYPE        CREATED AT                            STATE                   CLOUD               VERSION
dim-dog              041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  PLAN_SERVERLESS  2022-03-20 13:47:40.529531 +0000 UTC  CLUSTER_STATE_CREATED   CLOUD_PROVIDER_GCP  v21.2.4
...
~~~
</div>&nbsp;

<div class="filter-content" markdown="1" data-scope="dedicated">
~~~
∙∙∙ Retrieving clusters...
NAME      ID                                    PLAN TYPE        CREATED AT                            STATE                   CLOUD               VERSION
dim-dog   041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  PLAN_DEDICATED   2022-03-22 21:07:35.7177 +0000 UTC    CLUSTER_STATE_CREATING  CLOUD_PROVIDER_GCP  v21.2.4
~~~
</div>

## Get information about your cluster using ccloud cluster info

The `ccloud cluster info` command displays detailed information about your cluster. Find the **ID** column in the output of `ccloud cluster list` to identify the cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster info 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

<section class="filter-content" markdown="1" data-scope="serverless">
~~~
∙∙∙ Retrieving cluster...
Cluster info
 name: dim-dog
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
 cockroach version: v21.2.4
 cloud: CLOUD_PROVIDER_GCP
 plan type: PLAN_SERVERLESS
 state: CLUSTER_STATE_CREATED
 spend limit: 0
 regions: us-central1
~~~
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">
~~~
∙∙∙ Retrieving cluster...
Cluster info
 name: ievans-dim-dog-dos
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
 cockroach version: v21.2.4
 cloud: CLOUD_PROVIDER_GCP
 plan type: PLAN_DEDICATED
 state: CLUSTER_STATE_CREATING
 hardware per node:
  2 vCPU
  7.500000 GiB RAM
  15 GiB disk
  450 IOPS
 region nodes:
  us-central1: 1
~~~
</section>

## Delete a cluster using ccloud cluster delete

The `ccloud cluster delete` command deletes the specified cluster using the cluster ID.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster delete 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

~~~
∙∙∙ Deleting cluster...
Success! Deleted cluster
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

{{site.data.alerts.callout_danger}}
If the cluster state is `CLUSTER_STATE_CREATING` you cannot delete the cluster. You must wait until the cluster has been provisioned and started, with a status of `CLUSTER_STATE_CREATED`, before you can delete the cluster. {{ site.data.products.serverless }} clusters are created in less than a minute. {{ site.data.products.dedicated }} clusters can take an hour or more to provision and start.
{{site.data.alerts.end}}

