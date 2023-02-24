---
title: Get Started with the ccloud CLI
summary: Use the ccloud CLI to create, manage, and connect to CockroachDB Cloud clusters
toc: true
docs_area: manage
---

The `ccloud` tool is a command-line interface (CLI) tool that allows you to create, manage, and connect to CockroachDB Cloud clusters. If you are new to CockroachDB Cloud, [install `ccloud`](#install-ccloud) and use the [`ccloud quickstart` command](#use-ccloud-quickstart) to interactively log in and create a new {{ site.data.products.serverless }} cluster.

## Install `ccloud`

{% include cockroachcloud/ccloud/install-ccloud.md %}

## Use `ccloud quickstart`

The easiest way of getting started with CockroachDB Cloud is to use `ccloud quickstart`. The `ccloud quickstart` command guides you through logging in to CockroachDB Cloud, creating a new {{ site.data.products.serverless }} with a $0 resource limit, and connecting to the new cluster. Run `ccloud quickstart` and follow the instructions:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud quickstart
~~~

The `ccloud quickstart` command will open a browser window to log you in to CockroachDB Cloud. If you are new to CockroachDB Cloud, you can register using one of the single-sign-on options, or create a new account using an email address.

## Log in to CockroachDB Cloud using `ccloud auth`

In order to use the `ccloud` commands to configure and manage your clusters, you first need to log in to CockroachDB Cloud. Use the `ccloud auth login` command to open a browser window to log in to CockroachDB Cloud.

1. Run the `ccloud auth login` command and press **Enter** to open a browser window:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud auth login
    ~~~

    This will take you to the CockroachDB Cloud login page.

1. Enter your username and password if you already have a CockroachDB Cloud account, then click **Continue**.

    If you do not have a CockroachDB Cloud account, click one of the single sign-on (SSO) options or **Sign up** to register.

1. Close the browser window and return to your terminal.

If you are a member of more than one [CockroachDB Cloud organization](console-access-management.html#organization), use the `--org` flag to set the organization name when authenticating.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --org <organization label>
~~~

The organization label is found on the **Settings** page of the CockroachDB Cloud Console.

### Log in to CockroachDB Cloud on a headless server

If you are using `ccloud` on a headless machine, use the `--no-redirect` flag to log in. This allows you to log in to CockroachDB Cloud on a different machine, retrieve an authorization code, and enter the code on the headless machine so `ccloud` can complete authentication.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --no-redirect
~~~

## Create a new cluster using `ccloud cluster create`

There are two ways to create clusters using `ccloud`: `ccloud quickstart create` and `ccloud cluster create`.

The `ccloud quickstart create` command interactively guides you through creating and connecting to a new {{ site.data.products.serverless }} cluster.

The `ccloud cluster create` command creates a new {{ site.data.products.serverless }} or {{ site.data.products.dedicated }} CockroachDB cluster in your organization.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless">{{ site.data.products.serverless }}<strong></strong></button>
    <button class="filter-button page-level" data-scope="dedicated"><strong>{{ site.data.products.dedicated }}</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

Use the `ccloud cluster create` command to create a new {{ site.data.products.serverless }} cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create
~~~

This command creates a {{ site.data.products.serverless }} cluster in the default cloud infrastructure provider (GCP) and the closest region for that provider. It will generate a cluster name.

~~~
∙∙∙ Creating cluster...
Success! Created cluster
  name: dim-dog
  id: ec5e50eb-67dd-4d25-93b0-91ee7ece778d
~~~

The `id` in the output is the cluster ID. You use the `name` in other `ccloud` commands to identify the cluster on which the `ccloud` command operates.

You can set the cluster name, cloud infrastructure provider, region, and resource limit as command options. The following command is equivalent to the previous command that uses the default values.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create serverless dim-dog us-central1 --cloud GCP --spend-limit 0
~~~
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

Use the `ccloud cluster create` command to create a new {{ site.data.products.dedicated }} cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create dedicated
~~~

This command creates a 1 node {{ site.data.products.dedicated }} cluster with 2 virtual CPUs (vCPUs) and 15 GiB of storage in the default cloud infrastructure provider (GCP) and the closest region for that provider. It will generate a cluster name. The CockroachDB version will be the latest stable version.

You can set the cluster name, cloud infrastructure provider, region, number of nodes, and storage as command options. The following command is equivalent to the previous command that uses the default values.

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

The `id` in the output is the cluster ID. You use the `name` in other `ccloud` commands to identify the cluster on which the `ccloud` command operates.

When creating multi node clusters, you must specify how many nodes should be in each region supported by the cloud infrastructure provider. For example, the following command creates a 3 node cluster where 2 nodes are in `us-central1` and 1 node is in `us-west2`:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create dedicated dim-dog us-central1:2 us-west2:1 --cloud GCP --vcpus 2 --storage-gib 15
~~~
</section>

{{site.data.alerts.callout_info}}
If you set a maximum resource limit greater than $0 on a {{ site.data.products.serverless }} cluster, or create a {{ site.data.products.dedicated }} cluster, you must [add a credit card](billing-management.html) to your organization.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="dedicated">

## Create and manage IP allowlists using `ccloud cluster networking allowlist`

Use the `ccloud cluster networking allowlist create` command to create an [IP allowlist](network-authorization.html#ip-allowlisting), which allows incoming network connections from the specified network IP range. Use the `--sql` flag to allow incoming CockroachDB SQL shell connections from the specified network. Use the `--ui` flag to allow access to the DB Console from the specified network.

The IP range must be in [Classless Inter-Domain Routing (CIDR) format](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). For more information on CIDR, see [Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

For example, to allow incoming connections from a single IP address, 1.1.1.1, to your cluster, including the CockroachDB SQL shell and DB Console, use the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist create dim-dog 1.1.1.1/32 --sql --ui
~~~

~~~
∙∙∙ Creating IP allowlist entry...
Success! Created IP allowlist entry for
 network: 1.1.1.1/32
 cluster: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

Use the `ccloud cluster networking allowlist list` command to list the IP allowlists for your cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist list dim-dog
~~~

~~~
∙●∙ Retrieving cluster allowlist...
NETWORK         NAME  UI  SQL
1.1.1.1/32            ✔   ✔
~~~

To modify an allowlist entry, use the `ccloud cluster networking allowlist update` command. The following command adds a descriptive name to the previously created entry.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist update dim-dog 1.1.1.1/32 --name home
~~~

~~~
∙∙● Updating IP allowlist entry...
Success! Updated IP allowlist entry for
 network: 1.1.1.1/32
 cluster: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

Rerunning the `allowlist list` command shows the updated entry:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist list dim-dog
~~~

~~~
∙∙∙ Retrieving cluster allowlist...
NETWORK         NAME  UI  SQL
1.1.1.1/32      home  ✔   ✔
~~~

To delete an entry, run the `ccloud cluster networking allowlist delete` command.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist delete dim-dog 1.1.1.1/32
~~~

~~~
∙∙∙ Deleting IP allowlist entry...
Success! Deleted IP allowlist entry for
 network: 1.1.1.1/32
 cluster: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

</section>

## Get a list of all the clusters in your organization using `ccloud cluster list`

Use the `ccloud cluster list` command to show information about the clusters in your organization. It outputs columns with the cluster name, the cluster ID, the cluster plan, the creation date, the cluster's current state, the cloud provider, and the version of CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster list
~~~

<section class="filter-content" markdown="1" data-scope="serverless">
~~~
∙∙∙ Retrieving clusters...
NAME                 ID                                    PLAN TYPE        CREATED AT                            STATE                   CLOUD               VERSION
dim-dog              041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  PLAN_SERVERLESS  2022-03-20 13:47:40.529531 +0000 UTC  CLUSTER_STATE_CREATED   CLOUD_PROVIDER_GCP  v21.2.4
...
~~~
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">
~~~
∙∙∙ Retrieving clusters...
NAME      ID                                    PLAN TYPE        CREATED AT                            STATE                   CLOUD               VERSION
dim-dog   041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  PLAN_DEDICATED   2022-03-22 21:07:35.7177 +0000 UTC    CLUSTER_STATE_CREATING  CLOUD_PROVIDER_GCP  v21.2.4
...
~~~
</section>

## Get information about your cluster using `ccloud cluster info`

Use the `ccloud cluster info` command with the cluster name as the parameter to show detailed information about your cluster. Find the **Name** column in the output of `ccloud cluster list` to find the name of the cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster info dim-dog
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
 resource limit: 0
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

## Use a SQL client with a cluster using `ccloud cluster sql`

Use the `ccloud cluster sql` command to start a CockroachDB SQL shell connection to the specified cluster using the [cluster ID](#get-information-about-your-cluster-using-ccloud-cluster-info). If you haven't created a SQL user for the specified cluster, you will be prompted to create a new user and set the user password.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql dim-dog
~~~

~~~
∙∙∙ Retrieving cluster info...
∙∙∙ Retrieving SQL user list...
No SQL users found. Create one now: y
Create a new SQL user:
Username: user
Password: ****************
∙∙∙ Creating SQL user...
Success! Created SQL user
 name: user
 cluster: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
Starting CockroachDB SQL shell...
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
# Client version: CockroachDB CCL v21.2.5 (x86_64-apple-darwin19, built 2022/02/07 21:04:05, go1.16.6)
# Server version: CockroachDB CCL v21.2.4-1-g70835279ac (x86_64-unknown-linux-gnu, built 2022/02/03 22:31:25, go1.16.6)

warning: server version older than client! proceed with caution; some features may not be available.

# Cluster ID: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
#
# Enter \? for a brief introduction.
#
user@free-tier7.gcp-us-central1.crdb.io:26257/defaultdb>
~~~

### Connect to your cluster using SSO

Use the `--sso` flag to connect to your cluster using [single sign-on (SSO) authentication](cloud-sso-sql.html), which will allow you to start a SQL shell without using a password.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --sso dim-dog
~~~

This will open a browser window on the local machine where you will log in to your organization if you are not already authenticated.

If you are running `ccloud` on a remote machine, use the `--no-redirect` flag. `ccloud` will output a URL that you must copy and paste in your local machine's browser in order to authenticate. After authentication, paste in the authorization code you received in the remote terminal to complete the login process.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --sso --no-redirect dim-dog
~~~

Using SSO login requires that a separate SSO SQL user for your account is created on the cluster you are connecting to. SSO SQL usernames are prefixed with `sso_`. The SSO SQL username you use must match the SSO SQL username generated for you.

To create a SSO SQL user:

1. Connect to the cluster using the `--sso` flag.
   
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster --sso dim-dog
    ~~~

1. Log in to your organization when prompted by `ccloud`.
1. Copy the command in the error message to create the SSO SQL user with the correct username.
   
    You must have `admin` privileges to create the SSO SQL user.

1. Create the SSO SQL user by pasting and running the command you copied.
   
    For example, if the command in the error message creates a `sso_maxroach` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster user create dim-dog sso_maxroach
    ~~~

1. Re-run the SQL client command to login and connect to your cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster sql dim-dog --sso
    ~~~

{{site.data.alerts.callout_info}}
Use the `ccloud auth whoami` command to check that you are logged into the correct organization.

If the organization is incorrect:

1. Log out of the current organization.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud auth logout
    ~~~

1. Log in to the correct organization.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud auth login --org {organization name}
    ~~~

{{site.data.alerts.end}}

## Get the connection information for your cluster using `ccloud cluster sql`

Use the `ccloud cluster sql` command to get connection information for the specified cluster using the cluster name.

To get the [connection URL](../{{site.current_cloud_version}}/connection-parameters.html#connect-using-a-url), use the `--connection-url` option.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --connection-url dim-dog
~~~

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
∙∙∙ Retrieving cluster info...
postgresql://dim-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fuser%2F.postgresql%2Froot.crt
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
∙∙∙ Retrieving cluster info...
postgresql://dim-dog-5bct.gcp-us-east4.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fuser%2FLibrary%2FCockroachCloud%2Fcerts%2Fdim-dog-ca.crt
~~~

</section>

To get the individual connection parameters, use the `--connection-params` option.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --connection-params dim-dog
~~~

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
Connection parameters
 Database:  defaultdb
 Host:      dim-dog-147.6wr.cockroachlabs.cloud
 Port:      26257
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
∙∙∙ Retrieving cluster info...
Connection parameters
 Database:  defaultdb
 Host:      dim-dog-5bct.gcp-us-east4.cockroachlabs.cloud
 Port:      26257
~~~

</section>

## Create a SQL user using `ccloud cluster user create`

Use the `ccloud cluster user create` command to create a new SQL user by passing in the cluster name and the username. By default, newly created users are assigned to the `admin` role. An `admin` SQL user has full privileges for all databases and tables in your cluster. This user can also create additional users and grant them appropriate privileges.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster user create dim-dog maxroach
~~~

~~~
Password: ****************
∙∙∙ Creating SQL user...
~~~

## Delete a cluster using `ccloud cluster delete`

Use the `ccloud cluster delete` command to delete the specified cluster using the cluster name.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster delete dim-dog
~~~

~~~
∙∙∙ Deleting cluster...
Success! Deleted cluster
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

{{site.data.alerts.callout_info}}
If the cluster state is `CLUSTER_STATE_CREATING` you cannot delete the cluster. You must wait until the cluster has been provisioned and started, with a status of `CLUSTER_STATE_CREATED`, before you can delete the cluster. {{ site.data.products.serverless }} clusters are created in less than a minute. {{ site.data.products.dedicated }} clusters can take an hour or more to provision and start.
{{site.data.alerts.end}}

## Turn off telemetry events for `ccloud`

Cockroach Labs collects anonymized telemetry events to improve the usability of `ccloud`. Use the `ccloud settings set` command and disable sending telemetry events to Cockroach Labs.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud settings set --disable-telemetry=true
~~~

