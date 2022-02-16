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

1. Download the ccloud binary.
<section class="filter-content" markdown="1" data-scope="mac">
1. Extract the ccloud binary and add it to your `PATH`.
</section>
<section class="filter-content" markdown="1" data-scope="linux">
1. Extract the ccloud binary and add it to your `PATH`.
</section>
<section class="filter-content" markdown="1" data-scope="windows">
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

## Create a new Serverless cluster using ccloud

The `ccloud cluster create` command creates new CockroachDB clusters in your organization. You can create {{ site.data.products.serverless }} or {{ site.data.products.dedicated }} clusters.

1. Create a free {{ site.data.products.serverless }} cluster using the `ccloud cluster create` command.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create serverless dim-dog us-west2
    ~~~

    This command creates the cluster in the default cloud infrastructure provider (GCP) and the default region for that provider. It will generate a cluster name.

    {% include_cached copy-clipboard.html %}
    ~~~
    Creating cluster Success! Created cluster
    name: dim-dog
    ~~~

    The cloud infrastructure provider and spend limit can be set as command options. The following command is equivalent to the previous command that uses the default values.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster create serverless dim-dog us-west2 --cloud GCP --spend-limit 0
    ~~~

{{site.data.alerts.callout_info}}
If you set a maximum spend limit greater than $0 on a {{ site.data.products.serverless }} cluster, or create a {{ site.data.products.dedicated }} cluster, you must [add a credit card](billing-management.html) to your organization.
{{site.data.alerts.end}}

## Get information about your cluster using ccloud cluster info

The `ccloud cluster info` command displays detailed information about your cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster info dim-dog
~~~

{% include_cached copy-clipboard.html %}
~~~
TODO: Sample output
~~~
