---
title: CREATE VIRTUAL CLUSTER
summary: The CREATE VIRTUAL CLUSTER statement creates a new target virtual cluster for physical replication.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Physical cluster replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

The `CREATE VIRTUAL CLUSTER` statement creates a new virtual cluster. It is supported only starting a [**physical cluster replication (PCR)** job]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

{% include {{ page.version.version }}/physical-replication/phys-rep-sql-pages.md %}

## Required privileges

`CREATE VIRTUAL CLUSTER` requires one of the following privileges:

- The `admin` role.
- The `MANAGEVIRTUALCLUSTER` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) allows the user to run all the related `VIRTUAL CLUSTER` SQL statements for PCR.

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM MANAGEVIRTUALCLUSTER TO user;
~~~

## Synopsis

<div>
{% include {{ page.version.version }}/physical-replication/create-virtual-cluster-diagram.html %}
</div>

## Parameters

Parameter | Description
----------+------------
`virtual_cluster_name` | The name for the new virtual cluster.
`LIKE virtual_cluster_spec` | Creates a virtual cluster with the same [capabilities](#capabilities) and settings as another virtual cluster.
`primary_virtual_cluster` | The name of the primary's virtual cluster to replicate.
`primary_connection_string` | The PostgreSQL connection string to the primary cluster. Refer to [Connection string](#connection-string) for more detail.
`replication_options_list`| Options to modify the PCR streams. Refer to [Options](#options).

## Options

Option | Description
-------+-------------
<span class="version-tag">New in v24.3:</span> `READ VIRTUAL CLUSTER` | Create a [read-only virtual cluster]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#start-up-sequence-with-read-on-standby) on the standby cluster, which allows reads of the standby's replicating virtual cluster. For an example, refer to [Start a PCR stream with read from standby](#start-a-pcr-stream-with-read-from-standby).
`RETENTION` | Configure a [retention window]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#failover-and-promotion-process) that will control how far in the past you can [fail over]({% link {{ page.version.version }}/failover-replication.md %}) to.<br><br>{% include {{ page.version.version }}/physical-replication/retention.md %}

## Connection string

When you [initiate a PCR stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication) from the standby cluster, it is necessary to pass a connection string to the system virtual cluster on the primary cluster:

{% include_cached copy-clipboard.html %}
~~~
'postgresql://{replication user}:{password}@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full&sslrootcert=certs/{primary cert}.crt'
~~~

To form a connection string similar to the example, include the following values and query parameters. Replace values in `{...}` with the appropriate values for your configuration:

Value | Description
----------------+------------
`{replication user}` | The user on the primary cluster that has the `REPLICATION` system privilege. Refer to the [Create a replication user and password]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#create-a-replication-user-and-password) for more detail.
`{password}` | The replication user's password.
`{node ID or hostname}` | The node IP address or hostname of any node from the primary cluster.
`options=ccluster=system` | The parameter to connect to the system virtual cluster on the primary cluster.
`sslmode=verify-full` | The `verify-full` secure connection type.
`sslrootcert={primary cert}` | The path to the primary cluster's CA certificate on the standby cluster.

## Capabilities

{{site.data.alerts.callout_info}}
Cockroach Labs does not recommend changing the default capabilities of created virtual clusters.
{{site.data.alerts.end}}

_Capabilities_ control what a virtual cluster can do. When you start a PCR stream, you can specify a virtual cluster with `LIKE` to ensure other virtual clusters on the standby cluster will work in the same way. `LIKE` will refer to a virtual cluster on the CockroachDB cluster you're running the statement from.

## Examples

### Start a PCR stream

To start a PCR stream to the standby of the primary's virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}';
~~~

This will create a `main` virtual cluster in the standby cluster. The standby's system virtual cluster will connect to the primary cluster to initiate the PCR job. For details on the PCR stream, refer to the [Responses]({% link {{ page.version.version }}/show-virtual-cluster.md %}#responses) for `SHOW VIRTUAL CLUSTER`.

### Specify a retention window for a PCR stream

When you initiate a PCR stream, you can specify a retention window to protect data from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection). The retention window controls how far in the past you can [fail over]({% link {{ page.version.version }}/failover-replication.md %}) to:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}' WITH RETENTION '36h';
~~~

This will initiate a PCR stream from the primary cluster into the standby cluster's new `main` virtual cluster. The `RETENTION` option allows you to specify a timestamp in the past for failover to the standby cluster. After failover, the standby `main` virtual cluster will be transactionally consistent to any timestamp within that retention window.

{% include {{ page.version.version }}/physical-replication/retention.md %}

### Start a PCR stream with read from standby

{% include_cached new-in.html version="v24.3" %} Use the `READ VIRTUAL CLUSTER` option to set up a PCR stream that also creates a read-only virtual cluster on the standby cluster. You can create a PCR job as per the [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) guide and then add the option to the `CREATE VIRTUAL CLUSTER` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}' WITH READ VIRTUAL CLUSTER;
~~~

View the newly created virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

You'll find: 

- The `main` virtual cluster, which is accepting writes from the primary cluster. 
- The `main-readonly` virtual cluster, which is a read-only version of the `main` virtual cluster.

~~~
  id |     name      | data_state  | service_mode
-----+---------------+-------------+---------------
   1 | system        | ready       | shared
   3 | main          | replicating | none
   4 | main-readonly | ready       | shared
(3 rows)
~~~

To read table data from the standby cluster, connect to the `readonly` virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=main-readonly&sslmode=verify-full"` --certs-dir=certs
~~~

{{site.data.alerts.callout_info}}
You can only read data on the created `readonly` virtual cluster, other operations like `SHOW VIRTUAL CLUSTERS` must be run from the `system` virtual cluster. To connect to the `readonly` virtual cluster, refer to the [Connection Reference]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connection-reference).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/physical-replication/failover-read-virtual-cluster.md %} Use [`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %}) to remove the `readonly` virtual cluster.

For details on adding a read-only virtual cluster after a failback, refer to the [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) page.

## See also

- [`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %})
- [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})
