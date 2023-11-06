---
title: Set Up Physical Cluster Replication
summary: Follow a tutorial to set up physical replication between a primary and standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} In this tutorial, you will set up physical cluster replication between a primary cluster and standby cluster. The primary is _active_, serving application traffic. The standby is _passive_, accepting updates from the primary cluster. The replication stream will send changes from the primary to the standby.

The unit of replication is a _virtual cluster_, {% comment %}link to Matt's CV docs{% endcomment %} which is part of the underlying infrastructure in the primary and standby clusters.

In this tutorial, you will connect to:

- The _system interface_ for administration tasks in both clusters, and starting the replication stream from the standby cluster.
- The application _virtual cluster_ on the primary to work with databases, tables, workloads, and so on.

{% include {{ page.version.version }}/physical-replication/reference-links-replication.md %}

## Overview

The high-level steps in this tutorial are:

1. Create and start the primary cluster.
1. Configure and create a user on the primary cluster.
1. Create and start the standby cluster.
1. Configure and create a user on the standby cluster.
1. Verify certificates.
1. Start the replication stream from the standby cluster.

## Before you begin

{% include enterprise-feature.md %}

- Two separate CockroachDB clusters (primary and standby) with a minimum of three nodes each using the same CockroachDB {{page.version.version}} version.
    - To set up each cluster, you can follow the [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}). When you start each node in your cluster with the `cockroach start` command, you **must** pass the `--config-profile` flag with a `replication` value. Refer to cluster creation steps for the [primary](#start-the-primary-cluster) and for the [standby](#start-the-standby-cluster) cluster to do this.
- All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Verify certificates](#step-3-verify-certificates).
- An [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/enterprise-licensing.md %}) on the primary **and** standby clusters. You must use the system interface on the primary and standby to enable your {{ site.data.products.enterprise }} license.

## Step 1. Create the primary cluster

### Start the primary cluster

To enable physical cluster replication, it is necessary to start each node with the appropriate _configuration profile_ set with the `--config-profile` flag. A configuration profile applies a custom configuration to the server at initialization time. When using physical cluster replication, the `replication-source` and `replication-target` configuration profiles are used to create a virtualized cluster with a system interface and an application virtual cluster.

The primary cluster requires the following value:

{% include_cached copy-clipboard.html %}
~~~ shell
--config-profile replication-source
~~~

For example, a `cockroach start` command according to the [prerequisite deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-3-start-nodes):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start \
--certs-dir=certs \
--advertise-addr=<node1 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25 \
--background \
--config-profile replication-source
~~~

### Connect to the primary cluster system interface

Connect to your primary cluster's system interface using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}).

1. To connect to the system interface, pass the `options=-ccluster=system` parameter in the URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{your IP or hostname}:26257/?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    You will find that the prompt will include `system` when you have successfully connected.

    {{site.data.alerts.callout_info}}
    You should only use the system interface for administration. To work with databases, tables, or workloads, use the application virtual cluster{% comment %}({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}){% endcomment %}.
    {{site.data.alerts.end}}

1. Add your cluster organization and {{ site.data.products.enterprise }} license to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING cluster.organization = 'your organization';
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING enterprise.license = 'your enterprise license';
    ~~~

1. Confirm the status of your virtual cluster: {% comment %}Link to SQL ref page here{% endcomment %}

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The output will include the `system` interface and the `application` virtual cluster:

    ~~~
    id |    name     | data_state | service_mode
    ---+-------------+------------+---------------
    1  | system      | ready      | shared
    2  | template    | ready      | none
    3  | application | ready      | shared
    (3 rows)
    ~~~

### Create a replication user and password

The standby cluster requires a user profile on the primary cluster to connect to.

1. From the primary's system interface SQL shell, create a user and password:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER {your username} WITH LOGIN PASSWORD '{your password}';
    ~~~

1. Grant the [`REPLICATION` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) to your user: {% comment %}Link to detail on replication system privilege{% endcomment %}

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT SYSTEM REPLICATION TO {your username};
    ~~~

    If you need to change the password later, refer to [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}).

### Connect to the primary virtual cluster (optional)

1. If you would like to connect to the primary's application virtual cluster, open a new terminal window, and use the `ccluster=application` parameter:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{your IP or hostname}:26257/?options=-ccluster=application&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    Your prompt will include `application` when you have successfully connected.

    {{site.data.alerts.callout_info}}
    You can connect to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) to observe activity on the primary cluster. If you did not already [create a user in the previous step](#create-a-replication-user-and-password), create one to access the DB Console. Open a web browser at `https://{your IP or hostname}:8080/` and enter your credentials.
    {{site.data.alerts.end}}

## Step 2. Create the standby cluster

### Start the standby cluster

Similarly to the primary cluster, it is necessary to start each node with the `--config-profile` flag and a `replication-target` for the standby cluster. This creates a _virtualized cluster_ with a system interface, and sets up all the required configuration for starting a replication stream.

To start the standby cluster, run:

{% include_cached copy-clipboard.html %}
~~~ shell
--config-profile replication-target
~~~

For example, a `cockroach start` command according to the [prerequisite deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-3-start-nodes):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start \
--certs-dir=certs \
--advertise-addr=<node1 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25 \
--background \
--config-profile replication-target
~~~

### Connect to the standby cluster system interface

Connect to your standby cluster's system interface using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}).

1. To connect to the system interface, pass the `options=-ccluster=system` parameter in the URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{your IP or hostname}:26257/?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    You will find that the prompt will include `system` when you have successfully connected.

1. Add your cluster organization and {{ site.data.products.enterprise }} license to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING cluster.organization = 'your organization';
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING enterprise.license = 'your enterprise license';
    ~~~

1. Confirm the status of your virtual cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The output will show the `system` interface, but no `application` virtual cluster:

    ~~~
    id |   name   | data_state | service_mode
    ---+----------+------------+---------------
    1  | system   | ready      | shared
    2  | template | ready      | none
    (2 rows)
    ~~~

    {% include {{ page.version.version }}/physical-replication/template-description.md %}

### Create a user for the standby cluster

If you would like to access the DB Console to observe your replication, you will need to create a user:

1. Create a user:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER {your username} WITH LOGIN PASSWORD {'your password'};
    ~~~

1. To observe the replication activity, your user will need [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) privileges:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT admin TO {your username};
    ~~~

    Open the DB Console in your web browser: `https://{your IP or hostname}:8080/`, where you will be prompted for these credentials. Refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) for more detail on tracking relevant metrics for your replication stream.

## Step 3. Verify certificates

At this point, you have a primary and a standby cluster running. The next step is to verify that the clusters can communicate. Depending on how you manage certificates, you must ensure that all nodes on the primary and the standby cluster have access to the certificate of the other cluster.

For example, if you followed the [Deploy CockroachDB]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) prerequisite, you need to add the `ca.crt` from the primary cluster to the `certs` directory on all the nodes in the standby cluster.

1. Name the `ca.crt` from the primary cluster to a new name on the standby cluster. For example, `ca_primary.crt`.
1. Place `ca_primary.crt` in the `certs` directory of the standby cluster nodes.

You need to add the `ca.crt` from the standby cluster to the `certs` directory on all the nodes in the primary cluster.

1. Name the `ca.crt` from the standby cluster to a new name on the primary cluster. For example, `ca_standby.crt`.
1. Place `ca_standby.crt` in the `certs` directory of the primary cluster nodes.

## Step 4. Start replication

The system interface in the standby cluster initiates and controls the replication stream by pulling from the primary cluster. In this section, you will connect to the primary from the standby to initiate the replication stream.

1. From the **standby** cluster, use your connection string to the primary.

    The connection string contains:
    - The replication user and password that you [created for the primary cluster](#create-a-replication-user-and-password).
    - The node IP address or hostname of one node from the primary cluster.
    - The path to the primary node's certificate on the standby cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE VIRTUAL CLUSTER standbyapplication LIKE template
    FROM REPLICATION OF application
    ON 'postgresql://{replication user}:{password}@{node IP or hostname}:26257/?options=-ccluster=system&sslmode=verify-full&sslrootcert=certs/{primary cert}.crt';
    ~~~

    {% include {{ page.version.version }}/physical-replication/like-description.md %}

    Once the standby cluster has made a connection to the primary cluster, the standby will pull the topology of the primary cluster and will distribute the replication work across all nodes in the primary and standby.

1. To manage the replication stream, you can pause and resume the replication stream as well as show the current details for the job:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER standbyapplication PAUSE REPLICATION;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER standbyapplication RESUME REPLICATION;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER standbyapplication WITH REPLICATION STATUS;
    ~~~

    {% comment %}update output here{% endcomment %}

    {% include_cached copy-clipboard.html %}
    ~~~
    id |        name        |     data_state     | service_mode | source_tenant_name |                                                     source_cluster_uri                                               | replication_job_id |        replicated_time        |         retained_time         | cutover_time
    ---+--------------------+--------------------+--------------+--------------------+----------------------------------------------------------------------------------------------------------------------+--------------------+-------------------------------+-------------------------------+---------------
    3  | standbyapplication | replicating        | none         | application        | postgresql://{user}:{password}@{hostname}:26257/?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 899090689449132033 | 2023-09-11 22:29:35.085548+00 | 2023-09-11 16:51:43.612846+00 |     NULL
    (1 row)
    ~~~

## What's next

- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %})
- [Cut Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/cutover-replication.md %})