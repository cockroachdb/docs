---
title: Get Started with the ccloud CLI
summary: Use the ccloud CLI to create, manage, and connect to CockroachDB Cloud clusters
toc: true
docs_area: manage
---

The `ccloud` tool is a command-line interface (CLI) tool that allows you to create, manage, and connect to CockroachDB Cloud clusters. If you are new to CockroachDB Cloud, [install `ccloud`](#install-ccloud) and use the [`ccloud quickstart` command](#use-ccloud-quickstart) to interactively log in and create a new CockroachDB {{ site.data.products.serverless }} cluster.

## Install `ccloud`

{% include cockroachcloud/ccloud/install-ccloud.md %}

## Use `ccloud quickstart`

The easiest way of getting started with CockroachDB Cloud is to use `ccloud quickstart`. The `ccloud quickstart` command guides you through logging in to CockroachDB Cloud, creating a new CockroachDB {{ site.data.products.serverless }} cluster, and connecting to the new cluster. Run `ccloud quickstart` and follow the instructions:

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

If you are a member of more than one CockroachDB Cloud organization, use the `--org` flag to set the organization name when authenticating.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --org {organization-label}
~~~

The organization label is found on the **Settings** page of the CockroachDB Cloud Console.

If your organization has a custom URL, use the `--vanity-name` flag to log in:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --vanity-name {custom-organization-name}
~~~

Replace `{custom-organization-name}` with the portion of the custom sign-in URL that follows `/login/`. Do not pass the full custom sign-in URL.

### Log in to CockroachDB Cloud on a headless server

If you are using `ccloud` on a headless machine, use the `--no-redirect` flag to log in. This allows you to log in to CockroachDB Cloud on a different machine, retrieve an authorization code, and enter the code on the headless machine so `ccloud` can complete authentication.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --no-redirect
~~~

## Create a new cluster using `ccloud cluster create`

There are two ways to create clusters using `ccloud`: `ccloud quickstart create` and `ccloud cluster create`.

The `ccloud quickstart create` command interactively guides you through creating and connecting to a new CockroachDB {{ site.data.products.serverless }} cluster.

The `ccloud cluster create` command creates a new CockroachDB {{ site.data.products.serverless }} or CockroachDB {{ site.data.products.advanced }} CockroachDB cluster in your organization.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless">CockroachDB {{ site.data.products.serverless }}<strong></strong></button>
    <button class="filter-button page-level" data-scope="dedicated"><strong>CockroachDB {{ site.data.products.advanced }}</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

Use the `ccloud cluster create` command to create a new CockroachDB {{ site.data.products.serverless }} cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create
~~~

This command creates a CockroachDB {{ site.data.products.serverless }} cluster in the default cloud infrastructure provider (GCP) and the closest region for that provider. It will generate a cluster name.

~~~
∙∙∙ Creating cluster...
Success! Created cluster
  name: blue-dog
  id: ec5e50eb-67dd-4d25-93b0-91ee7ece778d
~~~

The `id` in the output is the cluster ID. You use the `name` in other `ccloud` commands to identify the cluster on which the `ccloud` command operates.

You can set the cluster name, cloud infrastructure provider, region, and [resource limits]({% link {{site.current_cloud_version}}/architecture/glossary.md %}#resource-limits) as command options. The following command is equivalent to the previous command that uses the default values.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create serverless blue-dog us-central1 --cloud GCP --spend-limit 0
~~~
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

Use the `ccloud cluster create` command to create a new CockroachDB {{ site.data.products.advanced }} cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create dedicated
~~~

This command creates a 1-node CockroachDB {{ site.data.products.advanced }} cluster with 4 virtual CPUs (vCPUs) and 110 GiB of storage in the default cloud infrastructure provider (GCP) and the closest region for that provider. It will generate a cluster name. The CockroachDB version will be the latest stable version.

You can set the cluster name, cloud infrastructure provider, region, number of nodes, and storage as command options. The following command is equivalent to the previous command that uses the default values.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create dedicated blue-dog us-central1:1 --cloud GCP --vcpus 4 --storage-gib 110
~~~

~~~
∙∙∙ Creating cluster
Success! Created cluster
  name: blue-dog
  id: ec5e50eb-67dd-4d25-93b0-91ee7ece778d
~~~

The `id` in the output is the cluster ID. You use the `name` in other `ccloud` commands to identify the cluster on which the `ccloud` command operates.

When creating multi-region clusters, you must specify how many nodes should be in each region supported by the cloud infrastructure provider. For example, the following command creates a 12-node cluster where 8 nodes are in `us-central1` and 4 nodes are in `us-west2`. For optimum performance, it is generally recommended to configure the same number of nodes in each region.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster create dedicated blue-dog us-central1:8 us-west2:4 --cloud GCP --vcpus 4 --storage-gib 110
~~~
</section>



<section class="filter-content" markdown="1" data-scope="dedicated">

## Create and manage IP allowlists using `ccloud cluster networking allowlist`

Use the `ccloud cluster networking allowlist create` command to create an [IP allowlist]({% link cockroachcloud/network-authorization.md %}#ip-allowlisting), which allows incoming network connections from the specified network IP range. Use the `--sql` flag to allow incoming CockroachDB SQL shell connections from the specified network. Use the `--ui` flag to allow access to the DB Console from the specified network.

The IP range must be in [Classless Inter-Domain Routing (CIDR) format](https://wikipedia.org/wiki/Classless_Inter-Domain_Routing). For more information on CIDR, see [Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

For example, to allow incoming connections from a single IP address, 1.1.1.1, to your cluster, including the CockroachDB SQL shell and DB Console, use the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist create blue-dog 1.1.1.1/32 --sql --ui
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
ccloud cluster networking allowlist list blue-dog
~~~

~~~
∙●∙ Retrieving cluster allowlist...
NETWORK         NAME  UI  SQL
1.1.1.1/32            ✔   ✔
~~~

To modify an allowlist entry, use the `ccloud cluster networking allowlist update` command. The following command adds a descriptive name to the previously created entry.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist update blue-dog 1.1.1.1/32 --name home
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
ccloud cluster networking allowlist list blue-dog
~~~

~~~
∙∙∙ Retrieving cluster allowlist...
NETWORK         NAME  UI  SQL
1.1.1.1/32      home  ✔   ✔
~~~

To delete an entry, run the `ccloud cluster networking allowlist delete` command.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking allowlist delete blue-dog 1.1.1.1/32
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
blue-dog              041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  PLAN_SERVERLESS  2022-03-20 13:47:40.529531 +0000 UTC  CLUSTER_STATE_CREATED   CLOUD_PROVIDER_GCP  v21.2.4
...
~~~
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">
~~~
∙∙∙ Retrieving clusters...
NAME      ID                                    PLAN TYPE        CREATED AT                            STATE                   CLOUD               VERSION
blue-dog   041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  PLAN_DEDICATED   2022-03-22 21:07:35.7177 +0000 UTC    CLUSTER_STATE_CREATING  CLOUD_PROVIDER_GCP  v21.2.4
...
~~~
</section>

## Get information about your cluster using `ccloud cluster info`

Use the `ccloud cluster info` command with the cluster name as the parameter to show detailed information about your cluster. Find the **Name** column in the output of `ccloud cluster list` to find the name of the cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster info blue-dog
~~~

<section class="filter-content" markdown="1" data-scope="serverless">
~~~
∙∙∙ Retrieving cluster...
Cluster info
 name: blue-dog
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
 cockroach version: {{ site.current_cloud_version }}
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
 name: ievans-blue-dog-dos
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
 cockroach version: {{ site.current_cloud_version }}
 cloud: CLOUD_PROVIDER_GCP
 plan type: PLAN_DEDICATED
 state: CLUSTER_STATE_CREATING
 hardware per node:
  4 vCPU
  7.500000 GiB RAM
  110 GiB disk
  450 IOPS
 region nodes:
  us-central1: 1
~~~
</section>

## Use a SQL client with a cluster using `ccloud cluster sql`

Use the `ccloud cluster sql` command to start a CockroachDB SQL shell connection to the specified cluster using the [cluster ID](#get-information-about-your-cluster-using-ccloud-cluster-info). If you haven't created a SQL user for the specified cluster, you will be prompted to create a new user and set the user password.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql blue-dog
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

Use the `--sso` flag to connect to your cluster using [single sign-on (SSO) authentication]({% link cockroachcloud/cloud-sso-sql.md %}), which will allow you to start a SQL shell without using a password.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --sso blue-dog
~~~

This will open a browser window on the local machine where you will log in to your organization if you are not already authenticated.

If you are running `ccloud` on a remote machine, use the `--no-redirect` flag. `ccloud` will output a URL that you must copy and paste in your local machine's browser in order to authenticate. After authentication, paste in the authorization code you received in the remote terminal to complete the login process.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --sso --no-redirect blue-dog
~~~

Using SSO login requires that a separate SSO SQL user for your account is created on the cluster you are connecting to. SSO SQL usernames are prefixed with `sso_`. The SSO SQL username you use must match the SSO SQL username generated for you.

To create a SSO SQL user:

1. Connect to the cluster using the `--sso` flag.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster sql --sso blue-dog
    ~~~

1. Log in to your organization when prompted by `ccloud`.
1. Copy the command in the error message to create the SSO SQL user with the correct username.

    You must have `admin` privileges to create the SSO SQL user.

1. Create the SSO SQL user by pasting and running the command you copied.

    For example, if the command in the error message creates a `sso_maxroach` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster user create blue-dog sso_maxroach
    ~~~

1. Re-run the SQL client command to login and connect to your cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud cluster sql blue-dog --sso
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

### Skip the IP allowlist check when connecting to your cluster

By default, the `ccloud cluster sql` command will allow connections only from IP addresses in your cluster's [allowlist]({% link cockroachcloud/network-authorization.md %}#ip-allowlisting). Use the `--skip-ip-check` flag to disable the client-side IP allowlist check:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql blue-dog --skip-ip-check
~~~

## Get the connection information for your cluster using `ccloud cluster sql`

Use the `ccloud cluster sql` command to get connection information for the specified cluster using the cluster name.

To get the [connection URL]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url), use the `--connection-url` option.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --connection-url blue-dog
~~~

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
∙∙∙ Retrieving cluster info...
postgresql://blue-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fuser%2F.postgresql%2Froot.crt
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
∙∙∙ Retrieving cluster info...
postgresql://blue-dog-5bct.gcp-us-east4.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fuser%2FLibrary%2FCockroachCloud%2Fcerts%2Fblue-dog-ca.crt
~~~

</section>

To get the individual connection parameters, use the `--connection-params` option.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster sql --connection-params blue-dog
~~~

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
Connection parameters
 Database:  defaultdb
 Host:      blue-dog-147.6wr.cockroachlabs.cloud
 Port:      26257
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
∙∙∙ Retrieving cluster info...
Connection parameters
 Database:  defaultdb
 Host:      blue-dog-5bct.gcp-us-east4.cockroachlabs.cloud
 Port:      26257
~~~

</section>

## Get a connection string using `ccloud cluster connection-string`

Use the `ccloud cluster connection-string` command to get a formatted connection string for a cluster. You can optionally specify the database and SQL user.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster connection-string blue-dog
~~~

~~~
∙∙∙ Retrieving cluster info...
Connection String:
postgresql://blue-dog-5bct.gcp-us-east4.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full

Parameters:
  Host: blue-dog-5bct.gcp-us-east4.cockroachlabs.cloud
  Port: 26257
  Database: defaultdb
~~~

To specify a database and SQL user:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster connection-string blue-dog --database myapp --sql-user maxroach
~~~

~~~
∙∙∙ Retrieving cluster info...
Connection String:
postgresql://maxroach@blue-dog-5bct.gcp-us-east4.cockroachlabs.cloud:26257/myapp?sslmode=verify-full

Parameters:
  Host: blue-dog-5bct.gcp-us-east4.cockroachlabs.cloud
  Port: 26257
  Database: myapp
~~~

## Create a SQL user using `ccloud cluster user create`

Use the `ccloud cluster user create` command to create a new SQL user by passing in the cluster name and the username. By default, newly created users are assigned to the `admin` role. An `admin` SQL user has full privileges for all databases and tables in your cluster. This user can also create additional users and grant them appropriate privileges.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster user create blue-dog maxroach
~~~

~~~
Password: ****************
∙∙∙ Creating SQL user...
~~~

## Manage databases using `ccloud cluster database`

Use the `ccloud cluster database` commands to list, create, and delete databases within a cluster.

To list all databases in a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster database list blue-dog
~~~

~~~
∙∙∙ Retrieving databases...
NAME        TABLE COUNT
defaultdb   0
myapp       12
~~~

To create a new database:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster database create blue-dog myapp
~~~

~~~
∙∙∙ Creating database...
Successfully created database 'myapp'
~~~

To delete a database:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster database delete blue-dog myapp
~~~

~~~
∙∙∙ Deleting database...
Successfully deleted database 'myapp'
~~~

## Manage backups using `ccloud cluster backup`

Use the `ccloud cluster backup` commands to list backups and manage backup configuration for a cluster.

To list backups for a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster backup list blue-dog
~~~

~~~
∙∙∙ Retrieving backups...
BACKUP ID                             AS OF TIME
a1b2c3d4-e5f6-7890-abcd-ef1234567890  2026-03-01 10:30:00Z
b2c3d4e5-f6a7-8901-bcde-f12345678901  2026-02-28 10:30:00Z
~~~

To get the current backup configuration:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster backup config get blue-dog
~~~

~~~
∙∙∙ Retrieving backup configuration...
Cluster: blue-dog
Backups Enabled: Yes
Frequency: Every 60 minutes
Retention: 30 days
~~~

To update the backup configuration:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster backup config update blue-dog --enabled true --frequency 120 --retention 60
~~~

~~~
∙∙∙ Updating backup configuration...
Success! Updated backup configuration
Cluster: blue-dog
Backups Enabled: Yes
Frequency: Every 120 minutes
Retention: 60 days
~~~

## Restore from a backup using `ccloud cluster restore`

Use the `ccloud cluster restore` commands to list and create restore operations from backups.

To list restores for a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster restore list blue-dog
~~~

~~~
∙∙∙ Retrieving restores...
ID                                    BACKUP ID                             TYPE     STATUS     COMPLETION %  CREATED AT
c3d4e5f6-a7b8-9012-cdef-123456789012  a1b2c3d4-e5f6-7890-abcd-ef1234567890  CLUSTER  SUCCESS    100%          2026-03-01 12:00:00Z
~~~

To restore from a specific backup to a destination cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster restore create blue-dog --backup-id a1b2c3d4-e5f6-7890-abcd-ef1234567890
~~~

~~~
∙∙∙ Creating restore...
Successfully initiated restore
Restore ID: d4e5f6a7-b8c9-0123-defa-234567890123
Backup ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Type: CLUSTER
Status: PENDING
~~~

If you are restoring from a different cluster, specify the source cluster ID:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster restore create blue-dog --source-cluster-id a1b2c3d4-e5f6-7890-abcd-ef1234567890
~~~

You can also specify the restore type (`CLUSTER`, `DATABASE`, or `TABLE`) using the `--type` flag:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster restore create blue-dog --backup-id a1b2c3d4-e5f6-7890-abcd-ef1234567890 --type DATABASE
~~~

## List available CockroachDB versions using `ccloud cluster versions`

Use the `ccloud cluster versions` command to list the CockroachDB major versions available for new clusters or upgrades.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster versions
~~~

~~~
∙∙∙ Retrieving versions...
VERSION  RELEASE TYPE  SUPPORT STATUS  SUPPORT END  ALLOWED UPGRADES
v25.2    REGULAR       SUPPORTED       2026-11-18
v25.1    REGULAR       SUPPORTED       2026-05-19   v25.2
v24.3    REGULAR       SUPPORTED       2025-11-18   v25.1, v25.2
~~~

<section class="filter-content" markdown="1" data-scope="dedicated">

## Manage version deferral using `ccloud cluster version-deferral`

Use the `ccloud cluster version-deferral` commands to get or set the version upgrade deferral policy for a CockroachDB {{ site.data.products.advanced }} cluster. Version deferral lets you delay automatic major version upgrades.

To get the current deferral policy:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster version-deferral get blue-dog
~~~

~~~
∙∙∙ Retrieving version deferral...
Deferral Policy: NOT_DEFERRED
~~~

To set the deferral policy:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster version-deferral set blue-dog --policy DEFERRAL_60_DAYS
~~~

~~~
∙∙∙ Setting version deferral...
Successfully set version deferral
Deferral Policy: DEFERRAL_60_DAYS
~~~

Valid deferral policies are `NOT_DEFERRED`, `DEFERRAL_30_DAYS`, `DEFERRAL_60_DAYS`, and `DEFERRAL_90_DAYS`.

## Manage blackout windows using `ccloud cluster blackout-window`

Use the `ccloud cluster blackout-window` commands to manage blackout windows for a CockroachDB {{ site.data.products.advanced }} cluster. Blackout windows prevent automatic maintenance operations during specified time periods.

To list blackout windows:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster blackout-window list blue-dog
~~~

~~~
∙∙∙ Retrieving blackout windows...
ID                                    START TIME            END TIME
e5f6a7b8-c9d0-1234-efab-345678901234  2026-04-01 00:00:00Z  2026-04-07 00:00:00Z
~~~

To create a blackout window, specify the start and end times in RFC3339 format. The start time must be at least 7 days in the future, and the end time must be within 14 days of the start time.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster blackout-window create blue-dog --start 2026-04-01T00:00:00Z --end 2026-04-07T00:00:00Z
~~~

~~~
∙∙∙ Creating blackout window...
Successfully created blackout window
ID: e5f6a7b8-c9d0-1234-efab-345678901234
Start: 2026-04-01 00:00:00Z
End: 2026-04-07 00:00:00Z
~~~

To delete a blackout window:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster blackout-window delete blue-dog e5f6a7b8-c9d0-1234-efab-345678901234
~~~

~~~
∙∙∙ Deleting blackout window...
Successfully deleted blackout window 'e5f6a7b8-c9d0-1234-efab-345678901234'
~~~

## Manage maintenance windows using `ccloud cluster maintenance`

Use the `ccloud cluster maintenance` commands to configure the preferred maintenance window for a CockroachDB {{ site.data.products.advanced }} cluster. The maintenance window determines when automatic maintenance operations are performed. The window duration must be at least 6 hours and less than 1 week.

To get the current maintenance window:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster maintenance get blue-dog
~~~

~~~
∙∙∙ Retrieving maintenance window...
Cluster: blue-dog
Window Start: Tuesday 02:00 UTC
Window Duration: 6h
~~~

To set a maintenance window using `--day` and `--hour`:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster maintenance set blue-dog --day tuesday --hour 2 --duration 6h
~~~

~~~
∙∙∙ Setting maintenance window...
Success! Set maintenance window
Cluster: blue-dog
Window Start: Tuesday 02:00 UTC
Window Duration: 6h
~~~

Alternatively, you can specify the window start time as a raw offset from Monday 00:00 UTC using `--offset`:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster maintenance set blue-dog --offset 26h --duration 6h
~~~

To delete (reset) the maintenance window:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster maintenance delete blue-dog
~~~

~~~
∙∙∙ Deleting maintenance window...
Success! Deleted maintenance window for cluster blue-dog
~~~

## Simulate cluster disruptions using `ccloud cluster disruption`

Use the `ccloud cluster disruption` commands to simulate cluster disruptions for disaster recovery testing on a CockroachDB {{ site.data.products.advanced }} cluster. Disruptions allow you to test how your applications behave when parts of your cluster become unavailable.

To get the current disruption status:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster disruption get blue-dog
~~~

~~~
∙∙∙ Retrieving disruption status...
No disruptions active
~~~

To disrupt an entire region:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster disruption set blue-dog --region us-east-1 --whole-region
~~~

~~~
∙∙∙ Setting disruption...
Successfully set disruption for region us-east-1
~~~

To disrupt specific availability zones within a region:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster disruption set blue-dog --region us-east-1 --azs us-east-1a,us-east-1b
~~~

To clear all disruptions and restore normal operation:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster disruption clear blue-dog
~~~

~~~
∙∙∙ Clearing disruptions...
Successfully cleared all disruptions
~~~

## View CMEK configuration using `ccloud cluster cmek`

Use the `ccloud cluster cmek get` command to view the Customer-Managed Encryption Keys (CMEK) configuration for a CockroachDB {{ site.data.products.advanced }} cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster cmek get blue-dog
~~~

~~~
∙∙∙ Retrieving CMEK configuration...
Cluster: blue-dog
CMEK Status: ENABLED

Region Keys:
  Region: us-east-1
    Key URI: arn:aws:kms:us-east-1:123456789:key/a1b2c3d4-e5f6-7890-abcd-ef
    Status: ENABLED
~~~

## Configure log export using `ccloud cluster log-export`

Use the `ccloud cluster log-export` commands to configure log export for a CockroachDB {{ site.data.products.advanced }} cluster. You can export logs to AWS CloudWatch, GCP Cloud Logging, or Azure Log Analytics.

To get the current log export configuration:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster log-export get blue-dog
~~~

~~~
∙∙∙ Retrieving log export configuration...
Cluster: blue-dog
Log Export Status: ENABLED
Type: AWS_CLOUDWATCH
Log Name: cockroach-logs
Auth Principal: arn:aws:iam::123456789:role/CockroachCloudLogExport
~~~

To enable log export to AWS CloudWatch:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster log-export enable blue-dog --type AWS_CLOUDWATCH --auth-principal arn:aws:iam::123456789:role/CockroachCloudLogExport --log-name cockroach-logs
~~~

~~~
∙∙∙ Enabling log export...
Success! Enabled log export
Cluster: blue-dog
Type: AWS_CLOUDWATCH
Status: ENABLING
~~~

To disable log export:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster log-export disable blue-dog
~~~

~~~
∙∙∙ Disabling log export...
Success! Disabled log export for cluster blue-dog
~~~

## Configure metric export using `ccloud cluster metric-export`

Use the `ccloud cluster metric-export` commands to configure metric export for a CockroachDB {{ site.data.products.advanced }} cluster. You can export metrics to AWS CloudWatch, Datadog, or Prometheus.

### Export metrics to AWS CloudWatch

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export cloudwatch enable blue-dog --role-arn arn:aws:iam::123456789:role/metrics-role --target-region us-east-1
~~~

~~~
∙∙∙ Enabling CloudWatch metric export...
Success! Enabled CloudWatch metric export
Cluster: blue-dog
Status: ENABLING
~~~

To get the current CloudWatch configuration:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export cloudwatch get blue-dog
~~~

To disable CloudWatch metric export:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export cloudwatch disable blue-dog
~~~

### Export metrics to Datadog

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export datadog enable blue-dog --site US5 --api-key your-datadog-api-key
~~~

~~~
∙∙∙ Enabling Datadog metric export...
Success! Enabled Datadog metric export
Cluster: blue-dog
Site: US5
Status: ENABLING
~~~

To get the current Datadog configuration:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export datadog get blue-dog
~~~

To disable Datadog metric export:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export datadog disable blue-dog
~~~

### Export metrics to Prometheus

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export prometheus enable blue-dog
~~~

~~~
∙∙∙ Enabling Prometheus metric export...
Success! Enabled Prometheus metric export
Cluster: blue-dog
Status: ENABLING
~~~

To get the Prometheus scrape endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export prometheus get blue-dog
~~~

To disable the Prometheus endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster metric-export prometheus disable blue-dog
~~~

## Manage egress rules using `ccloud cluster networking egress-rule`

Use the `ccloud cluster networking egress-rule` commands to manage egress traffic rules for a CockroachDB {{ site.data.products.advanced }} cluster. Egress rules control which external destinations your cluster can connect to.

To list egress rules:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-rule list blue-dog
~~~

~~~
∙∙∙ Retrieving egress rules...
ID                                    NAME           TYPE  DESTINATION        DESCRIPTION
f6a7b8c9-d0e1-2345-fab0-456789012345  allow-s3       FQDN  s3.amazonaws.com   Allow S3 access
a7b8c9d0-e1f2-3456-ab01-567890123456  allow-subnet   CIDR  10.0.0.0/8         Internal network
~~~

To create an egress rule:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-rule create blue-dog --name allow-s3 --type FQDN --destination s3.amazonaws.com --description "Allow S3 access"
~~~

~~~
∙∙∙ Creating egress rule...
Successfully created egress rule
ID: f6a7b8c9-d0e1-2345-fab0-456789012345
Name: allow-s3
Type: FQDN
Destination: s3.amazonaws.com
~~~

To delete an egress rule:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-rule delete blue-dog f6a7b8c9-d0e1-2345-fab0-456789012345
~~~

~~~
∙∙∙ Deleting egress rule...
Successfully deleted egress rule 'f6a7b8c9-d0e1-2345-fab0-456789012345'
~~~

## Manage egress private endpoints using `ccloud cluster networking egress-private-endpoint`

Use the `ccloud cluster networking egress-private-endpoint` commands to manage egress private endpoint connections from a CockroachDB {{ site.data.products.advanced }} cluster. Egress private endpoints allow your cluster to connect to external services using private network connectivity.

To list egress private endpoints:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-private-endpoint list blue-dog
~~~

~~~
∙∙∙ Retrieving egress private endpoints...
ID                                    REGION       STATE      TARGET SERVICE
b8c9d0e1-f2a3-4567-b012-678901234567  us-east-1    AVAILABLE  com.amazonaws.vpce.us-east-1.vpce-svc-012345abcdef
~~~

To get details of an egress private endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-private-endpoint get blue-dog b8c9d0e1-f2a3-4567-b012-678901234567
~~~

~~~
∙∙∙ Retrieving egress private endpoint...
ID: b8c9d0e1-f2a3-4567-b012-678901234567
Region: us-east-1
State: AVAILABLE
Target Service Type: PRIVATE_SERVICE
Target Service Identifier: com.amazonaws.vpce.us-east-1.vpce-svc-012345abcdef
Endpoint Address: 10.0.1.5
Endpoint Connection ID: vpce-0abc123def456789
Domain Names: example.com
~~~

To create an egress private endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-private-endpoint create blue-dog --region us-east-1 --target-service-identifier com.amazonaws.vpce.us-east-1.vpce-svc-012345abcdef --target-service-type PRIVATE_SERVICE
~~~

~~~
∙∙∙ Creating egress private endpoint...
Successfully created egress private endpoint
ID: b8c9d0e1-f2a3-4567-b012-678901234567
Region: us-east-1
State: PENDING
~~~

Valid target service types are `PRIVATE_SERVICE`, `MSK_SASL_SCRAM`, `MSK_SASL_IAM`, and `MSK_TLS`.

To delete an egress private endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking egress-private-endpoint delete blue-dog b8c9d0e1-f2a3-4567-b012-678901234567
~~~

~~~
∙∙∙ Deleting egress private endpoint...
Successfully deleted egress private endpoint 'b8c9d0e1-f2a3-4567-b012-678901234567'
~~~

## Manage client CA certificates using `ccloud cluster networking client-ca-cert`

Use the `ccloud cluster networking client-ca-cert` commands to manage client CA certificates for a CockroachDB {{ site.data.products.advanced }} cluster. Client CA certificates allow clients to authenticate using TLS certificates signed by your own certificate authority.

To get the current client CA certificate:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking client-ca-cert get blue-dog
~~~

~~~
∙∙∙ Retrieving client CA certificate...
Status: IS_SET
Certificate:
-----BEGIN CERTIFICATE-----
MIIBxTCCAWugAwIBAgIRAJ...
-----END CERTIFICATE-----
~~~

To set a client CA certificate from a PEM-encoded file:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking client-ca-cert set blue-dog --cert-file /path/to/ca.crt
~~~

~~~
∙∙∙ Setting client CA certificate...
Successfully set client CA certificate
Status: IS_SET
~~~

To update the client CA certificate:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking client-ca-cert update blue-dog --cert-file /path/to/new-ca.crt
~~~

~~~
∙∙∙ Updating client CA certificate...
Successfully updated client CA certificate
Status: IS_SET
~~~

To delete the client CA certificate:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking client-ca-cert delete blue-dog
~~~

~~~
∙∙∙ Deleting client CA certificate...
Successfully deleted client CA certificate
~~~

## Manage private endpoints using `ccloud cluster networking private-endpoint`

Use the `ccloud cluster networking private-endpoint` commands to manage private endpoint connectivity for a CockroachDB {{ site.data.products.advanced }} cluster. Private endpoints provide private connectivity using AWS PrivateLink, GCP Private Service Connect, or Azure Private Link.

### Manage private endpoint services

To list available private endpoint services for a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint service list blue-dog
~~~

~~~
∙∙∙ Retrieving private endpoint services...
REGION       SERVICE ID                                                     CLOUD  STATUS      AVAILABILITY ZONES
us-east-1    com.amazonaws.vpce.us-east-1.vpce-svc-0123456789abcdef         AWS    AVAILABLE   us-east-1a,us-east-1b,us-east-1c
~~~

To create private endpoint services for all regions in a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint service create blue-dog
~~~

~~~
∙∙∙ Creating private endpoint services...
Success! Created private endpoint services:

REGION       SERVICE ID                                                     CLOUD  STATUS
us-east-1    com.amazonaws.vpce.us-east-1.vpce-svc-0123456789abcdef         AWS    CREATING
~~~

### Manage private endpoint connections

To list connections:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint connection list blue-dog
~~~

~~~
∙∙∙ Retrieving private endpoint connections...
ENDPOINT ID                  SERVICE ID                                                     REGION       CLOUD  STATUS
vpce-0123456789abcdef0       com.amazonaws.vpce.us-east-1.vpce-svc-0123456789abcdef         us-east-1    AWS    AVAILABLE
~~~

To add a connection using your cloud provider's private endpoint identifier:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint connection add blue-dog vpce-0123456789abcdef0
~~~

~~~
∙∙∙ Adding private endpoint connection...
Success! Added private endpoint connection
 Endpoint ID: vpce-0123456789abcdef0
 Service ID: com.amazonaws.vpce.us-east-1.vpce-svc-0123456789abcdef
 Status: PENDING
~~~

To remove a connection:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint connection remove blue-dog vpce-0123456789abcdef0
~~~

~~~
∙∙∙ Removing private endpoint connection...
Success! Removed private endpoint connection vpce-0123456789abcdef0
~~~

### Manage trusted owners

Trusted owners control which cloud provider accounts are allowed to establish private endpoint connections to your cluster.

To list trusted owners:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint trusted-owner list blue-dog
~~~

~~~
∙∙∙ Retrieving trusted owners...
ID                                    EXTERNAL OWNER ID  TYPE
a1b2c3d4-e5f6-7890-abcd-ef1234567890  123456789012       AWS_ACCOUNT_ID
~~~

To add a trusted owner:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint trusted-owner add blue-dog 123456789012 --type AWS_ACCOUNT_ID
~~~

~~~
∙∙∙ Adding trusted owner...
Success! Added trusted owner
 ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 External Owner ID: 123456789012
 Type: AWS_ACCOUNT_ID
~~~

To remove a trusted owner:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster networking private-endpoint trusted-owner remove blue-dog a1b2c3d4-e5f6-7890-abcd-ef1234567890
~~~

~~~
∙∙∙ Removing trusted owner...
Success! Removed trusted owner a1b2c3d4-e5f6-7890-abcd-ef1234567890
~~~

</section>

## Delete a cluster using `ccloud cluster delete`

Use the `ccloud cluster delete` command to delete the specified cluster using the cluster name.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud cluster delete blue-dog
~~~

~~~
∙∙∙ Deleting cluster...
Success! Deleted cluster
 id: 041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d
~~~

{{site.data.alerts.callout_info}}
If the cluster state is `CLUSTER_STATE_CREATING` you cannot delete the cluster. You must wait until the cluster has been provisioned and started, with a status of `CLUSTER_STATE_CREATED`, before you can delete the cluster. CockroachDB {{ site.data.products.serverless }} clusters are created in less than a minute. CockroachDB {{ site.data.products.advanced }} clusters can take an hour or more to provision and start.
{{site.data.alerts.end}}

## View organization information using `ccloud organization get`

Use the `ccloud organization get` command (or its alias `ccloud org get`) to view information about your CockroachDB Cloud organization.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud organization get
~~~

~~~
∙∙∙ Retrieving organization...
ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Name: my-organization
Label: my-org
Created At: 2024-01-15 10:30:00Z
~~~

## View audit logs using `ccloud audit list`

Use the `ccloud audit list` command to view audit log entries for your organization. Audit logs record actions taken on your CockroachDB Cloud resources, including who performed the action, when, and what was changed.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud audit list
~~~

~~~
∙∙∙ Retrieving audit logs...
TIME                  ACTION                CLUSTER     USER
2026-03-01 12:00:00Z  CLUSTER_CREATED       blue-dog    user@example.com
2026-03-01 11:30:00Z  SQL_USER_CREATED      blue-dog    user@example.com
2026-03-01 10:00:00Z  ALLOWLIST_CREATED     blue-dog    user@example.com
~~~

Use the `--limit` flag to control the number of entries returned, and `--starting-from` to filter by start time:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud audit list --limit 10 --starting-from 2026-03-01T00:00:00Z
~~~

## Manage billing using `ccloud billing`

Use the `ccloud billing invoice` commands to view invoices and billing information for your organization.

To list invoices:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud billing invoice list
~~~

~~~
∙∙∙ Retrieving invoices...
INVOICE ID                            PERIOD START          PERIOD END            STATUS     TOTAL
d0e1f2a3-b4c5-6789-0123-456789abcdef  2026-02-01 00:00:00Z  2026-02-28 23:59:59Z  FINALIZED  1,234.56 USD
e1f2a3b4-c5d6-7890-1234-567890abcdef  2026-01-01 00:00:00Z  2026-01-31 23:59:59Z  FINALIZED  1,100.00 USD
~~~

To get details of a specific invoice:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud billing invoice get d0e1f2a3-b4c5-6789-0123-456789abcdef
~~~

## Manage folders using `ccloud folder`

Use the `ccloud folder` commands to manage folders for organizing clusters within your organization.

To list folders:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder list
~~~

~~~
∙∙∙ Retrieving folders...
ID                                    NAME          PARENT PATH  TYPE
f2a3b4c5-d6e7-8901-2345-678901abcdef  Production                 FOLDER
a3b4c5d6-e7f8-9012-3456-789012abcdef  Staging       /Production  FOLDER
~~~

To get details of a specific folder:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder get f2a3b4c5-d6e7-8901-2345-678901abcdef
~~~

To create a folder:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder create Production
~~~

~~~
∙∙∙ Creating folder...
Success! Created folder
 ID: f2a3b4c5-d6e7-8901-2345-678901abcdef
 Name: Production
~~~

To create a subfolder, use the `--parent-id` flag:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder create Staging --parent-id f2a3b4c5-d6e7-8901-2345-678901abcdef
~~~

To update a folder name:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder update f2a3b4c5-d6e7-8901-2345-678901abcdef --name "Prod Environment"
~~~

~~~
∙∙∙ Updating folder...
Success! Updated folder
 ID: f2a3b4c5-d6e7-8901-2345-678901abcdef
 Name: Prod Environment
~~~

To delete a folder:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder delete f2a3b4c5-d6e7-8901-2345-678901abcdef
~~~

~~~
∙∙∙ Deleting folder...
Success! Deleted folder f2a3b4c5-d6e7-8901-2345-678901abcdef
~~~

To list the contents of a folder:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud folder contents f2a3b4c5-d6e7-8901-2345-678901abcdef
~~~

~~~
∙∙∙ Retrieving folder contents...
ID                                    NAME        TYPE     PARENT PATH
041d4c6b-69b9-4121-9c5a-8dd6ffd6b73d  my-cluster  CLUSTER  /Production
a3b4c5d6-e7f8-9012-3456-789012abcdef  Staging     FOLDER   /Production
~~~

## Manage service accounts using `ccloud service-account`

Use the `ccloud service-account` commands to manage service accounts for programmatic access to CockroachDB Cloud.

To list service accounts:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account list
~~~

~~~
∙∙∙ Retrieving service accounts...
ID                                    NAME          DESCRIPTION        CREATED AT
b4c5d6e7-f8a9-0123-4567-890123abcdef  ci-pipeline   CI/CD automation   2026-01-15 10:30:00Z
~~~

To get details of a specific service account:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account get b4c5d6e7-f8a9-0123-4567-890123abcdef
~~~

To create a service account:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account create ci-pipeline --description "CI/CD automation"
~~~

~~~
∙∙∙ Creating service account...
Success! Created service account
 ID: b4c5d6e7-f8a9-0123-4567-890123abcdef
 Name: ci-pipeline
~~~

To delete a service account:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account delete b4c5d6e7-f8a9-0123-4567-890123abcdef
~~~

~~~
∙∙∙ Deleting service account...
Success! Deleted service account b4c5d6e7-f8a9-0123-4567-890123abcdef
~~~

### Manage API keys for service accounts

Use the `ccloud service-account api-key` commands to manage API keys for a service account.

To list API keys:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account api-key list --service-account-id b4c5d6e7-f8a9-0123-4567-890123abcdef
~~~

~~~
∙∙∙ Retrieving API keys...
ID                                    NAME          SERVICE ACCOUNT ID                    CREATED AT
c5d6e7f8-a9b0-1234-5678-901234abcdef  deploy-key    b4c5d6e7-f8a9-0123-4567-890123abcdef  2026-01-15 10:30:00Z
~~~

To create an API key:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account api-key create b4c5d6e7-f8a9-0123-4567-890123abcdef deploy-key
~~~

~~~
∙∙∙ Creating API key...
Success! Created API key
 ID: c5d6e7f8-a9b0-1234-5678-901234abcdef
 Name: deploy-key
 Secret: CCDB1_ABCDEFghijklmnopqrstuvwxyz0123456789...

IMPORTANT: Save this secret now. It will not be shown again.
~~~

To delete an API key:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud service-account api-key delete c5d6e7f8-a9b0-1234-5678-901234abcdef
~~~

~~~
∙∙∙ Deleting API key...
Success! Deleted API key c5d6e7f8-a9b0-1234-5678-901234abcdef
~~~

## Manage JWT issuers using `ccloud jwt-issuer`

Use the `ccloud jwt-issuer` commands to manage JWT/OIDC identity providers for cluster authentication. JWT issuers allow your clusters to authenticate users via external identity providers.

To list JWT issuers:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud jwt-issuer list
~~~

~~~
∙∙∙ Retrieving JWT issuers...
ID                                    ISSUER URL                              AUDIENCE
d6e7f8a9-b0c1-2345-6789-012345abcdef  https://accounts.google.com             my-app
e7f8a9b0-c1d2-3456-7890-123456abcdef  https://login.microsoftonline.com/...   my-app-azure
~~~

To get details of a JWT issuer:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud jwt-issuer get d6e7f8a9-b0c1-2345-6789-012345abcdef
~~~

To create a JWT issuer:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud jwt-issuer create --issuer-url https://accounts.google.com --audience my-app --claim email
~~~

~~~
∙∙∙ Creating JWT issuer...
Successfully created JWT issuer
ID: d6e7f8a9-b0c1-2345-6789-012345abcdef
Issuer URL: https://accounts.google.com
Audience: my-app
~~~

To update a JWT issuer:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud jwt-issuer update d6e7f8a9-b0c1-2345-6789-012345abcdef --audience my-app-v2
~~~

~~~
∙∙∙ Updating JWT issuer...
Successfully updated JWT issuer
ID: d6e7f8a9-b0c1-2345-6789-012345abcdef
Issuer URL: https://accounts.google.com
Audience: my-app-v2
~~~

To delete a JWT issuer:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud jwt-issuer delete d6e7f8a9-b0c1-2345-6789-012345abcdef
~~~

~~~
∙∙∙ Deleting JWT issuer...
Successfully deleted JWT issuer 'd6e7f8a9-b0c1-2345-6789-012345abcdef'
~~~

## Manage physical cluster replication using `ccloud replication`

Use the `ccloud replication` commands to manage [physical cluster replication (PCR)]({% link {{site.current_cloud_version}}/physical-cluster-replication-overview.md %}) between CockroachDB Cloud clusters.

To list replication streams for a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud replication list prod-east
~~~

~~~
∙∙∙ Retrieving replication streams...
ID                                    PRIMARY CLUSTER                       STANDBY CLUSTER                       STATUS
f8a9b0c1-d2e3-4567-8901-234567abcdef  a1b2c3d4-e5f6-7890-abcd-ef1234567890  b2c3d4e5-f6a7-8901-bcde-f12345678901  REPLICATING
~~~

To get details of a replication stream:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud replication get f8a9b0c1-d2e3-4567-8901-234567abcdef
~~~

~~~
∙∙∙ Retrieving replication stream...
ID: f8a9b0c1-d2e3-4567-8901-234567abcdef
Primary Cluster: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Standby Cluster: b2c3d4e5-f6a7-8901-bcde-f12345678901
Status: REPLICATING
Created At: 2026-02-15 10:30:00Z
Replicated Time: 2026-03-04 12:00:00Z
Replication Lag: 5 seconds
~~~

To create a replication stream:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud replication create --primary-cluster prod-east --standby-cluster dr-west
~~~

~~~
∙∙∙ Creating replication stream...
Successfully created replication stream
ID: f8a9b0c1-d2e3-4567-8901-234567abcdef
Primary Cluster: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Standby Cluster: b2c3d4e5-f6a7-8901-bcde-f12345678901
Status: STARTING
~~~

To initiate a failover to the standby cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud replication update f8a9b0c1-d2e3-4567-8901-234567abcdef --status FAILING_OVER
~~~

~~~
∙∙∙ Updating replication stream...
Successfully updated replication stream
ID: f8a9b0c1-d2e3-4567-8901-234567abcdef
Status: FAILING_OVER
~~~

To schedule a failover for a specific time:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud replication update f8a9b0c1-d2e3-4567-8901-234567abcdef --status FAILING_OVER --failover-at 2026-03-05T00:00:00Z
~~~

To cancel a replication stream:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud replication update f8a9b0c1-d2e3-4567-8901-234567abcdef --status CANCELED
~~~

## Turn off telemetry events for `ccloud`

Cockroach Labs collects anonymized telemetry events to improve the usability of `ccloud`. Use the `ccloud settings set` command and disable sending telemetry events to Cockroach Labs.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud settings set --disable-telemetry=true
~~~

## Limitations

- {% include cockroachcloud/limitations/limitation-ccloud-folders.md %}
