---
title: Set Up Physical Cluster Replication
summary: Follow a tutorial to set up physical replication between a primary and standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Physical cluster replication is supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} In this tutorial, you will set up [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) between a primary cluster and standby cluster. The primary cluster is _active_, serving application traffic. The standby cluster is _passive_, accepting updates from the primary cluster. The replication stream will send changes from the primary to the standby.

The unit of replication is a [virtual cluster]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}), which is part of the underlying infrastructure in the primary and standby clusters.

In this tutorial, you will connect to:

- The _system virtual cluster_ for administration tasks in both clusters, and starting the replication stream from the standby cluster.
- The application _virtual cluster_ on the primary cluster to work with databases, tables, workloads, and so on.

## Overview

The high-level steps in this tutorial are:

1. Create and start the primary cluster.
1. Configure and create a user on the primary cluster.
1. Create and start the standby cluster.
1. Configure and create a user on the standby cluster.
1. Securely copy certificates.
1. Start the replication stream from the standby cluster.

## Before you begin

- Two separate CockroachDB clusters (primary and standby) with a minimum of three nodes each, and each using the same CockroachDB {{page.version.version}} version. The standby cluster should be the same version or one version ahead of the primary cluster. The primary and standby clusters must be configured with similar hardware profiles, number of nodes, and overall size. Significant discrepancies in the cluster configurations may result in degraded performance.
    - To set up each cluster, you can follow [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}). When you start each node in your cluster with the `cockroach start` command, you **must** pass the `--config-profile` flag with a `replication` value. Refer to cluster creation steps for the [primary cluster](#start-the-primary-cluster) and for the [standby cluster](#start-the-standby-cluster) for details.
    - The [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) tutorial creates a self-signed certificate for each {{ site.data.products.core }} cluster. To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}).
- All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Copy certificates](#step-3-copy-certificates).
- The primary and standby clusters **must have the same [region topology]({% link {{ page.version.version }}/topology-patterns.md %})**. For example, replicating a multi-region primary cluster to a single-region standby cluster is not supported. Mismatching regions between a multi-region primary and standby cluster is also not supported.

## Step 1. Create the primary cluster

### Start the primary cluster

To enable PCR, it is necessary to start each node with the appropriate _configuration profile_ set with the `--config-profile` flag. A configuration profile applies a custom configuration to the server at initialization time. When using PCR, the `replication-source` and `replication-target` configuration profiles are used to create a virtualized cluster with a system virtual cluster and an application virtual cluster.

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

Ensure that you follow the [prerequisite deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-4-initialize-the-cluster) to initialize your cluster before continuing to set up PCR.

### Connect to the primary cluster system virtual cluster

Connect to your primary cluster's system virtual cluster using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}).

1. To connect to the system virtual cluster, pass the `options=-ccluster=system` parameter in the URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    The prompt will include `system` when you are connected to the system virtual cluster.

    {{site.data.alerts.callout_info}}
    You should only connect to the system virtual cluster for cluster administration. To work with databases, tables, or workloads, connect to the application virtual cluster.
    {{site.data.alerts.end}}

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

    Because this is the primary cluster rather than the standby cluster, `data_state` of all rows is `ready`, rather than `replicating` or another status.{% comment %}link to SQL reference or monitoring page here{% endcomment %}

### Create a replication user and password

The standby cluster connects to the primary cluster's system virtual cluster using an identity with the `REPLICATION` privilege. Connect to the primary cluster's system virtual cluster and create a user with a password:

1. From the primary's system virtual cluster SQL shell, create a user and password:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

1. Grant the [`REPLICATION` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) to your user: {% comment %}Link to detail on replication system privilege{% endcomment %}

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT SYSTEM REPLICATION TO {your username};
    ~~~

    If you need to change the password later, refer to [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}).

### Connect to the primary virtual cluster (optional)

1. If you would like to run a sample workload on the primary's application virtual cluster, open a new terminal window and use [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}) to run the workload.

    For example, to initiate the [`movr`]({% link {{ page.version.version }}/movr.md %}) workload:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload init movr "postgresql://root@{node_advertise_address}:{node_advertise_port}?options=-ccluster=application&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

    Replace `{node_advertise_address}` and `{node_advertise_port}` with a node's [`--advertise-addr`]({% link {{ page.version.version }}/cockroach-start.md %}#flags-advert-addr) IP address or hostname and port.

    {% include {{ page.version.version }}/connect/cockroach-workload-parameters.md %} As a result, for the example in this tutorial, you will need:
    - `options=-ccluster=application`
    - `sslmode=verify-full`
    - `sslrootcert={path}/certs/ca.crt`: the path to the CA certificate.
    - `sslcert={path}/certs/client.root.crt`: the path to the client certificate.
    - `sslkey={path}/certs/client.root.key`: the path to the client private key.

    For additional detail on the standard CockroachDB connection parameters, refer to [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url).

1. Run the `movr` workload for a set duration using the same connection string:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload run movr --duration=5m "postgresql://root@{node_advertise_address}:{node_advertise_port}?options=-ccluster=application&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

1. To connect to the primary cluster's application virtual cluster, use the `ccluster=application` parameter:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{node IP or hostname}:26257?options=-ccluster=application&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    The prompt will include `application` when you are connected to the application virtual cluster.

1. Create a user for your primary cluster's application virtual cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

1. You can connect to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) with this user to observe activity on the primary cluster. Open a web browser at `https://{node IP or hostname}:8080/` and enter your credentials.

## Step 2. Create the standby cluster

### Start the standby cluster

Similarly to the primary cluster, each node on the standby cluster must be started with the `--config-profile` flag set to `replication-target`. This creates a _virtualized cluster_ with a system virtual cluster and an application virtual cluster, and sets up all the required configuration for starting a replication stream.

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

Ensure that you follow the [prerequisite deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-4-initialize-the-cluster) to initialize your cluster before continuing to set up PCR.

### Connect to the standby cluster system virtual cluster

Connect to your standby cluster's system virtual cluster using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}).

1. To connect to the system virtual cluster, pass the `options=-ccluster=system` parameter in the URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    The prompt will include `system` when you are connected to the system virtual cluster.

1. Add your cluster organization and [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/licensing-faqs.md %}) to the cluster:

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

If you would like to access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) to observe your replication, you will need to create a user:

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

    Open the DB Console in your web browser: `https://{node IP or hostname}:8080/`, where you will be prompted for these credentials. Refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) for more detail on tracking relevant metrics for your replication stream.

## Step 3. Copy certificates

At this point, the primary and standby clusters are both running. The next step allows the standby cluster to connect to the primary cluster and begin ingesting its data. Depending on how you manage certificates, you must ensure that all nodes on the primary and the standby cluster have access to the certificate of the other cluster.

{{site.data.alerts.callout_danger}}
It is important to carefully manage the exchange of CA certificates between clusters if you have generated self-signed certificates with `cockroach cert` as part of the [prerequisite deployment tutorial]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}).

To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}).
{{site.data.alerts.end}}

For example, if you followed the [Deploy CockroachDB]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) prerequisite, you need to add the `ca.crt` from the primary cluster to the `certs` directory on all the nodes in the standby cluster.

1. Name the `ca.crt` from the primary cluster to a new name on the standby cluster. For example, `ca_primary.crt`.
1. Securely copy `ca_primary.crt` to the `certs` directory of the standby cluster nodes.

You need to add the `ca.crt` from the standby cluster to the `certs` directory on all the nodes in the primary cluster.

1. Name the `ca.crt` from the standby cluster to a new name on the primary cluster. For example, `ca_standby.crt`.
1. Securely copy `ca_standby.crt` to the `certs` directory of the primary cluster nodes.

## Step 4. Start replication

The system virtual cluster in the standby cluster initiates and controls the replication stream by pulling from the primary cluster. In this section, you will connect to the primary from the standby to initiate the replication stream.

1. From the **standby** cluster, use your connection string to the primary.

    The connection string contains:
    - The replication user and password that you [created for the primary cluster](#create-a-replication-user-and-password).
    - The node IP address or hostname of one node from the primary cluster.
    - The path to the primary node's certificate on the standby cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE VIRTUAL CLUSTER application LIKE template
    FROM REPLICATION OF application
    ON 'postgresql://{replication user}:{password}@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full&sslrootcert=certs/{primary cert}.crt';
    ~~~

    {% include {{ page.version.version }}/physical-replication/like-description.md %}

    Once the standby cluster has made a connection to the primary cluster, the standby will pull the topology of the primary cluster and will distribute the replication work across all nodes in the primary and standby.

1. To view all virtual clusters on the standby, run:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The standby cluster will show the `application` virtual cluster is in a `replicating` state.

    ~~~
    id |        name        |     data_state     | service_mode
    ---+--------------------+--------------------+---------------
     1 | system             | ready              | shared
     2 | template           | ready              | none
     3 | application        | replicating        | none
    (3 rows)
    ~~~

    The standby cluster's virtual cluster is offline while the replication stream is running. To bring it online, you must explicitly [start its service after cutover]({% link {{ page.version.version }}/cutover-replication.md %}#step-2-complete-the-cutover).

1. To manage the replication stream, you can [pause and resume]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) the replication stream as well as [show]({% link {{ page.version.version }}/show-virtual-cluster.md %}) the current details for the job:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER application PAUSE REPLICATION;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER application RESUME REPLICATION;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER application WITH REPLICATION STATUS;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~
    id |        name        |     data_state     | service_mode | source_tenant_name |                                                     source_cluster_uri                                              | replication_job_id |        replicated_time        |         retained_time         | cutover_time
    ---+--------------------+--------------------+--------------+--------------------+---------------------------------------------------------------------------------------------------------------------+--------------------+-------------------------------+-------------------------------+---------------
    3  | application        | replicating        | none         | application        | postgresql://{user}:{password}@{hostname}:26257?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 899090689449132033 | 2023-09-11 22:29:35.085548+00 | 2023-09-11 16:51:43.612846+00 |     NULL
    (1 row)s
    ~~~

    With the replication stream running, you can monitor the job via the DB Console, SQL shell, or Prometheus. You can also verify data is correct on the standby cluster at a specific point in time. For more detail, refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}).

    {{site.data.alerts.callout_info}}
    You cannot pause a PCR job for longer than 24 hours. PCR jobs paused for longer than 24 hours fail and cannot be recovered.
    {{site.data.alerts.end}}

## Connection reference

This table outlines the connection strings you will need for this setup tutorial.

For additional detail on the standard CockroachDB connection parameters, refer to [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url).

Cluster | Interface | Usage | URL and Parameters
--------+-----------+-------+------------+----
Primary | System | Set up a replication user and view running virtual clusters. Connect with [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}). | `"postgresql://root@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full"`<ul><li>`options=-ccluster=system`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.
Primary | Application | Add and run a workload with [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}). | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=application&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"`<br><br>{% include {{ page.version.version }}/connect/cockroach-workload-parameters.md %} As a result, for the example in this tutorial, you will need:<ul><li>`options=-ccluster=application`</li><li>`sslmode=verify-full`</li><li>`sslrootcert={path}/certs/ca.crt`</li><li>`sslcert={path}/certs/client.root.crt`</li><li>`sslkey={path}/certs/client.root.key`</li></ul>
Standby | System | Manage the replication stream. Connect with [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}). | `"postgresql://root@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full"`<ul><li>`options=-ccluster=system`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.

## What's next

- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %})
- [Cut Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/cutover-replication.md %})
- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})
- [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %})
- [`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})
