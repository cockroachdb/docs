---
title: Set Up Physical Cluster Replication
summary: Follow a tutorial to set up physical cluster replication between a primary and standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
Physical cluster replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

In this tutorial, you will set up [**physical cluster replication (PCR)**]({{ page.version.version }}/physical-cluster-replication-overview.md) between a primary cluster and standby cluster. The primary cluster is _active_, serving application traffic. The standby cluster is _passive_, accepting updates from the primary cluster. The replication stream will send changes from the primary to the standby.

The unit of replication is a [virtual cluster]({{ page.version.version }}/cluster-virtualization-overview.md), which is part of the underlying infrastructure in the primary and standby clusters.

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

- Two separate CockroachDB clusters (primary and standby) with a minimum of three nodes each, and each using the same CockroachDB {{page.version.version}} version.
    - To set up each cluster, you can follow [Deploy CockroachDB on Premises]({{ page.version.version }}/deploy-cockroachdb-on-premises.md). When you initialize the cluster with the [`cockroach init`]({{ page.version.version }}/cockroach-init.md) command, you **must** pass the `--virtualized` or `--virtualized-empty` flag. Refer to the cluster creation steps for the [primary cluster](#initialize-the-primary-cluster) and for the [standby cluster](#initialize-the-standby-cluster) for details.
    - The [Deploy CockroachDB on Premises]({{ page.version.version }}/deploy-cockroachdb-on-premises.md) tutorial creates a self-signed certificate for each {{ site.data.products.core }} cluster. To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({{ page.version.version }}/create-security-certificates-openssl.md).
- All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Manage the cluster certificates](#step-3-manage-the-cluster-certificates).
- An [{{ site.data.products.enterprise }} license]({{ page.version.version }}/licensing-faqs.md#types-of-licenses) on the primary **and** standby clusters. You must use the system virtual cluster on the primary and standby clusters to enable your {{ site.data.products.enterprise }} license.
- The primary and standby clusters **must have the same [region topology]({{ page.version.version }}/topology-patterns.md)**. For example, replicating a multi-region primary cluster to a single-region standby cluster is not supported. Mismatching regions between a multi-region primary and standby cluster is also not supported.

{{site.data.alerts.callout_info}}
To set up PCR from an existing CockroachDB cluster, which will serve as the primary cluster, refer to [Set up PCR from an existing cluster](#set-up-pcr-from-an-existing-cluster).
{{site.data.alerts.end}}

## Step 1. Create the primary cluster

### Initialize the primary cluster

To enable PCR, it is necessary to initialize the CockroachDB cluster with the appropriate flag to create the appropriate virtual clusters on the primary and standby cluster.

When initializing the [primary cluster](#initialize-the-primary-cluster), you pass the `--virtualized` flag to create a [_virtualized cluster_]({{ page.version.version }}/cluster-virtualization-overview.md) with a `system` virtual cluster and a `main` virtual cluster.  When initializing the [standby cluster](#initialize-the-standby-cluster), you pass the `--virtualized-empty` flag to create a virtualized standby cluster that contains a `system` virtual cluster.

For example, the `cockroach init` command to initialize the primary cluster (according to the [prerequisite deployment guide]({{ page.version.version }}/deploy-cockroachdb-on-premises.md#step-3-start-nodes)):

~~~ shell
cockroach init --certs-dir=certs --host={address of any node on --join list} --virtualized
~~~

Ensure that you follow the [prerequisite deployment guide]({{ page.version.version }}/deploy-cockroachdb-on-premises.md#step-4-initialize-the-cluster) to initialize your cluster before continuing to set up PCR.

### Connect to the primary cluster system virtual cluster

Connect to your primary cluster's system virtual cluster using [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md).

1. To connect to the system virtual cluster, pass the `options=-ccluster=system` parameter in the URL:

    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    The prompt will include `system` when you are connected to the system virtual cluster.

    {{site.data.alerts.callout_info}}
    You should only connect to the system virtual cluster for cluster administration. To work with databases, tables, or workloads, connect to a virtual cluster.
    {{site.data.alerts.end}}

1. Add your cluster organization and [{{ site.data.products.enterprise }} license]({{ page.version.version }}/licensing-faqs.md#types-of-licenses) to the cluster:

    ~~~ sql
    SET CLUSTER SETTING cluster.organization = 'your organization';
    ~~~
    ~~~ sql
    SET CLUSTER SETTING enterprise.license = 'your enterprise license';
    ~~~

1. Set the `kv.rangefeed.enabled` cluster setting to `true`. The replication job connects to a long-lived request, a _rangefeed_, which pushes changes as they happen:

    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Confirm the status of your virtual cluster: {% comment %}Link to SQL ref page here{% endcomment %}

    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The output will include the `system` virtual cluster and the `main` virtual cluster:

    ~~~
      id |  name  | data_state | service_mode
    -----+--------+------------+---------------
       1 | system | ready      | shared
       3 | main   | ready      | shared
    (2 rows)
    ~~~

    Because this is the primary cluster rather than the standby cluster, the `data_state` of all rows is `ready`, rather than `replicating` or another [status]({{ page.version.version }}/physical-cluster-replication-monitoring.md).

### Create a replication user and password

The standby cluster connects to the primary cluster's system virtual cluster using an identity with the `REPLICATION` privilege. Connect to the primary cluster's system virtual cluster and create a user with a password:

1. From the primary's system virtual cluster SQL shell, create a user and password:

    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

1. Grant the [`REPLICATION` system privilege]({{ page.version.version }}/security-reference/authorization.md#supported-privileges) to your user:

    ~~~ sql
    GRANT SYSTEM REPLICATION TO {your username};
    ~~~

    If you need to change the password later, refer to [`ALTER USER`]({{ page.version.version }}/alter-user.md).

### Connect to the primary virtual cluster (optional)

1. If you would like to run a sample workload on the primary's virtual cluster, open a new terminal window and use [`cockroach workload`]({{ page.version.version }}/cockroach-workload.md) to run the workload.

    For example, to initiate the [`movr`]({{ page.version.version }}/movr.md) workload:

    ~~~ shell
    cockroach workload init movr "postgresql://root@{node_advertise_address}:{node_advertise_port}?options=-ccluster=main&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

    Replace `{node_advertise_address}` and `{node_advertise_port}` with a node's [`--advertise-addr`]({{ page.version.version }}/cockroach-start.md#flags-advert-addr) IP address or hostname and port.

    - `options=-ccluster=main`
    - `sslmode=verify-full`
    - `sslrootcert={path}/certs/ca.crt`: the path to the CA certificate.
    - `sslcert={path}/certs/client.root.crt`: the path to the client certificate.
    - `sslkey={path}/certs/client.root.key`: the path to the client private key.

    For additional detail on the standard CockroachDB connection parameters, refer to [Client Connection Parameters]({{ page.version.version }}/connection-parameters.md#connect-using-a-url).

1. Run the `movr` workload for a set duration using the same connection string:

    ~~~ shell
    cockroach workload run movr --duration=5m "postgresql://root@{node_advertise_address}:{node_advertise_port}?options=-ccluster=main&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

1. To connect to the primary cluster's virtual cluster, use the `options=-ccluster={virtual_cluster_name}` parameter:

    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{node IP or hostname}:26257?options=-ccluster=main&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

    The prompt will include `main` when you are connected to the virtual cluster.

1. Create a user for your primary cluster's `main` virtual cluster:

    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

1. You can connect to the [DB Console]({{ page.version.version }}/ui-overview.md) with this user to observe activity on the primary cluster. Open a web browser at `https://{node IP or hostname}:8080/` and enter your credentials.

## Step 2. Create the standby cluster

### Initialize the standby cluster

Similarly to the primary cluster, you must initialize the standby cluster with the `--virtualized-empty` flag. This creates a _virtualized cluster_ with a system virtual cluster.

For example, the `cockroach init` command to initialize the standby cluster (according to the [prerequisite deployment guide]({{ page.version.version }}/deploy-cockroachdb-on-premises.md#step-3-start-nodes)):

~~~ shell
cockroach init --certs-dir=certs --host={address of any node on --join list} --virtualized-empty
~~~

Ensure that you follow the [prerequisite deployment guide]({{ page.version.version }}/deploy-cockroachdb-on-premises.md#step-4-initialize-the-cluster) to initialize your cluster before continuing to set up PCR.

### Connect to the standby cluster system virtual cluster

Connect to your standby cluster's system virtual cluster using [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md).

1. To connect to the system virtual cluster, pass the `options=-ccluster=system` parameter in the URL:

    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. Add your cluster organization and [{{ site.data.products.enterprise }} license]({{ page.version.version }}/licensing-faqs.md#types-of-licenses) to the cluster:

    ~~~ sql
    SET CLUSTER SETTING cluster.organization = 'your organization';
    ~~~
    ~~~ sql
    SET CLUSTER SETTING enterprise.license = 'your enterprise license';
    ~~~

1. Set the `kv.rangefeed.enabled` cluster setting to `true`. The replication job connects to a long-lived request, a _rangefeed_, which pushes changes as they happen:

    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Confirm the status of your virtual cluster:

    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The output will show the `system` virtual cluster, but no `main` virtual cluster:

    ~~~
    id |   name   | data_state | service_mode
    ---+----------+------------+---------------
    1  | system   | ready      | shared
    (1 rows)
    ~~~

### Create a user for the standby cluster

If you would like to access the [DB Console]({{ page.version.version }}/ui-overview.md) to observe your replication, you will need to create a user:

1. Create a user:

    ~~~ sql
    CREATE USER {your username} WITH LOGIN PASSWORD {'your password'};
    ~~~

1. To observe the replication activity, your user will need [`admin`]({{ page.version.version }}/security-reference/authorization.md#admin-role) privileges:

    ~~~ sql
    GRANT admin TO {your username};
    ~~~

    Open the DB Console in your web browser: `https://{node IP or hostname}:8080/`, where you will be prompted for these credentials. Refer to [Physical Cluster Replication Monitoring]({{ page.version.version }}/physical-cluster-replication-monitoring.md) for more detail on tracking relevant metrics for your replication stream.

## Step 3. Manage the cluster certificates

{{site.data.alerts.callout_danger}}
It is important to carefully manage the exchange of CA certificates between clusters if you have generated self-signed certificates with `cockroach cert` as part of the [prerequisite deployment tutorial]({{ page.version.version }}/deploy-cockroachdb-on-premises.md).

To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({{ page.version.version }}/create-security-certificates-openssl.md).
{{site.data.alerts.end}}

At this point, the primary and standby clusters are both running. The next step allows the standby cluster to connect to the primary cluster and begin ingesting its data. Depending on how you manage certificates, you must ensure that all nodes on the primary and the standby cluster have access to the certificate of the other cluster.

You can use the `cockroach encode-uri` command to generate a connection string containing a cluster's certificate for any [PCR statements]({{ page.version.version }}/physical-cluster-replication-overview.md#manage-replication-in-the-sql-shell) that require a connection string.

For example, in this tutorial you will need a connection string for the primary cluster when you start the replication stream from the standby.

To generate a connection string, pass the replication user, IP and port, along with the directory to the certificate for the primary cluster:

~~~ shell
cockroach encode-uri {replication user}:{password}@{node IP or hostname}:26257 --ca-cert certs/ca.crt --inline
~~~

The connection string output contains the primary cluster's certificate:

~~~
postgresql://{replication user}:{password}@{node IP or hostname}:26257/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A
~~~

Copy the output ready for [Step 4](#step-4-start-replication), which requires the connection string to the primary cluster.

## Step 4. Start replication

The system virtual cluster in the standby cluster initiates and controls the replication stream by pulling from the primary cluster. In this section, you will connect to the primary from the standby to initiate the replication stream.

1. From the **standby** cluster, use your connection string to the primary:

    If you generated the connection string using [`cockroach encode-uri`](#step-3-manage-the-cluster-certificates):

    ~~~ sql
    CREATE VIRTUAL CLUSTER main
    FROM REPLICATION OF main
    ON 'postgresql://{replication user}:{password}@{node IP or hostname}:{26257}/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A';
    ~~~

    Otherwise, pass the connection string that contains:
    - The replication user and password that you [created for the primary cluster](#create-a-replication-user-and-password).
    - The node IP address or hostname of one node from the primary cluster.
    - The path to the primary node's certificate on the standby cluster.

    ~~~ sql
    CREATE VIRTUAL CLUSTER main
    FROM REPLICATION OF main
    ON 'postgresql://{replication user}:{password}@{node IP or hostname}:{26257}?options=-ccluster=system&sslmode=verify-full&sslrootcert=certs/{primary cert}.crt';
    ~~~

    Once the standby cluster has made a connection to the primary cluster, the standby will pull the topology of the primary cluster and will distribute the replication work across all nodes in the primary and standby.

    {{site.data.alerts.callout_success}}
    You can also start a PCR stream that includes a read-only standby virtual cluster that allows you to read data on the standby cluster. For more details, refer to the [`CREATE VIRTUAL CLUSTER`]({{ page.version.version }}/create-virtual-cluster.md#start-a-pcr-stream-with-read-from-standby) page.
    {{site.data.alerts.end}}

1. To view all virtual clusters on the standby, run:

    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The standby cluster will show the `main` virtual cluster is in a `replicating` state.

    ~~~
      id |  name  | data_state  | service_mode
    -----+--------+-------------+---------------
       1 | system | ready       | shared
       3 | main   | replicating | none
    (2 rows)
    ~~~

    The standby cluster's virtual cluster is offline while the replication stream is running. To bring it online, you must explicitly [start its service after failover]({{ page.version.version }}/failover-replication.md#step-2-complete-the-failover).

1. To manage the replication stream, you can [pause and resume]({{ page.version.version }}/alter-virtual-cluster.md) the replication stream as well as [show]({{ page.version.version }}/show-virtual-cluster.md) the current details for the job:

    ~~~ sql
    ALTER VIRTUAL CLUSTER main PAUSE REPLICATION;
    ~~~

    ~~~ sql
    ALTER VIRTUAL CLUSTER main RESUME REPLICATION;
    ~~~

    ~~~ sql
    SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
    ~~~

    ~~~
    id | name | source_tenant_name |              source_cluster_uri                        |         retained_time         |    replicated_time     | replication_lag | failover_time |   status
    ---+------+--------------------+--------------------------------------------------------+-------------------------------+------------------------+-----------------+--------------+--------------
    3  | main | main               | postgresql://user@{node IP or hostname}:{26257}?redacted | 2024-04-17 20:14:31.952783+00 | 2024-04-17 20:18:50+00 | 00:00:08.738176 |         NULL | replicating
    (1 row)
    ~~~

    With the replication stream running, you can monitor the job via the DB Console, SQL shell, or Prometheus. You can also verify data is correct on the standby cluster at a specific point in time. For more detail, refer to [Physical Cluster Replication Monitoring]({{ page.version.version }}/physical-cluster-replication-monitoring.md).

## Set up PCR from an existing cluster

You can replicate data from an existing CockroachDB cluster that does not have [cluster virtualization]({{ page.version.version }}/cluster-virtualization-overview.md) enabled to a standby cluster with cluster virtualization enabled. In the [PCR setup]({{ page.version.version }}/physical-cluster-replication-technical-overview.md), the existing cluster is the primary cluster, which serves application traffic.

Before you begin, you will need:

- An existing primary cluster that is running {{page.version.version}}. If you need to upgrade your existing cluster, refer to [Upgrade to CockroachDB v24.2]({{ page.version.version }}/upgrade-cockroach-version.md).
- A v24.2 standby cluster. To set up the cluster, you can follow [Deploy CockroachDB on Premises]({{ page.version.version }}/deploy-cockroachdb-on-premises.md). When you initialize the cluster with the [`cockroach init`]({{ page.version.version }}/cockroach-init.md) command, you **must** pass the `--virtualized-empty` flag. For details, refer to the cluster creation steps for the [standby cluster](#initialize-the-standby-cluster).
- Review the remaining [prerequisites](#before-you-begin) at the start of this page, which also apply to running PCR from an existing cluster.

### Example

1. To configure the standby cluster ready for PCR, follow the steps outlined in [Connect to the standby cluster system virtual cluster](#connect-to-the-standby-cluster-system-virtual-cluster) that include enabling the necessary cluster settings.

1. Create a user on **both** clusters and grant the `SYSTEM REPLICATION` privilege to the created user on each cluster:

    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

    ~~~ sql
    GRANT SYSTEM REPLICATION TO {your username};
    ~~~

1. View the virtual clusters on **both** clusters:

    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    You will find that both clusters only have the `system` virtual cluster:

    ~~~
      id |  name  | data_state | service_mode
    -----+--------+------------+---------------
    1    | system | ready      | shared
    (1 row)
    ~~~

1. To create the replication job, you will need a connection string for the **primary cluster** containing its CA certificate. For steps to generate a connection string with `cockroach encode-uri`, refer to [Step 3. Manage the cluster certificates](#step-3-manage-the-cluster-certificates).

1. If you would like to run a test workload on your existing **primary cluster**, you can use [`cockroach workload`]({{ page.version.version }}/cockroach-workload.md) like the following:

    ~~~ shell
    cockroach workload init movr 'postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=main&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key'
    ~~~

1. To start the replication, you will need to replicate `system` from the existing primary cluster in order to create a new virtual cluster on the standby cluster (`main` in this example).

    On the **standby cluster**, run:

    ~~~ sql
    CREATE VIRTUAL CLUSTER main FROM REPLICATION OF system ON 'postgresql://{replication user}:{password}@{node IP or hostname}:26257/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A';
    ~~~

    This statement includes:
    - `main`: The name of the virtual cluster to create on the standby cluster.
    - `system`: The system virtual cluster on the existing primary cluster.
    - The connection string for the existing primary cluster.

1. View the virtual clusters on the **standby cluster**:

    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The output shows the newly created `main` virtual cluster and that the replication job is [`initializing`]({{ page.version.version }}/show-virtual-cluster.md#data-state):

    ~~~
      id |  name  |        data_state        | service_mode
    -----+--------+--------------------------+---------------
    1    | system | ready                    | shared
    3    | main   | initializing replication | none
    (2 rows)
    ~~~

At this point, your replication stream will be running.

To _fail over_ to the standby cluster, follow the instructions on the [Fail Over from a Primary Cluster to a Standby Cluster]({{ page.version.version }}/failover-replication.md) page.

For details on how to _fail back_ after replicating a non-virtualized cluster, refer to [Fail back after PCR from an existing cluster]({{ page.version.version }}/failover-replication.md#fail-back-after-pcr-from-an-existing-cluster).

## Connection reference

This table outlines the connection strings you will need for this setup tutorial.

For additional detail on the standard CockroachDB connection parameters, refer to [Client Connection Parameters]({{ page.version.version }}/connection-parameters.md#connect-using-a-url).

{{site.data.alerts.callout_success}}
You can use an [external connection]({{ page.version.version }}/create-external-connection.md) to define a name for connections using the `postgresql://` scheme.
{{site.data.alerts.end}}

The table uses `main` as an example name for the virtual cluster that contains user table data in the primary and standby clusters.

Cluster | Virtual Cluster | Usage | URL and Parameters
--------+-----------------+-------+-------------------
Primary | System | Set up a replication user and view running virtual clusters. Connect with [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md). | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=system&sslmode=verify-full"`<br><br><ul><li>`options=-ccluster=system`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.
Standby | System | Manage the replication stream. Connect with [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md). | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=system&sslmode=verify-full"`<br><br><ul><li>`options=-ccluster=system`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.
Standby/Primary | System | Connect to the other cluster. | `"postgresql://{replication user}:{password}@{node IP or hostname}:{26257}/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A"`<br><br>Generate the connection string with [`cockroach encode-uri`](#step-3-manage-the-cluster-certificates). Use the generated connection string in:<br><br><ul><li>`CREATE VIRTUAL CLUSTER` statements to [start the replication stream](#step-4-start-replication).</li><li>`ALTER VIRTUAL CLUSTER` statements to [fail back to the primary cluster]({{ page.version.version }}/failover-replication.md#fail-back-to-the-primary-cluster).</li></ul>
Standby | Read only | Run read queries on the standby's replicating virtual cluster | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=main-readonly&sslmode=verify-full"`<br><br><ul><li>`options=-ccluster=main-readonly`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.

## What's next

- [Physical Cluster Replication Monitoring]({{ page.version.version }}/physical-cluster-replication-monitoring.md)
- [Fail Over from a Primary Cluster to a Standby Cluster]({{ page.version.version }}/failover-replication.md)
- [`CREATE VIRTUAL CLUSTER`]({{ page.version.version }}/create-virtual-cluster.md)
- [`ALTER VIRTUAL CLUSTER`]({{ page.version.version }}/alter-virtual-cluster.md)
- [`DROP VIRTUAL CLUSTER`]({{ page.version.version }}/drop-virtual-cluster.md)
- [`SHOW VIRTUAL CLUSTER`]({{ page.version.version }}/show-virtual-cluster.md)