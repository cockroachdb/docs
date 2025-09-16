---
title: CREATE VIRTUAL CLUSTER
summary: The CREATE VIRTUAL CLUSTER statement creates a new target virtual cluster for physical replication.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
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
`primary_virtual_cluster` | The name of the primary's virtual cluster to replicate.
`primary_connection_string` | The PostgreSQL connection string to the primary cluster. Refer to [Connection string](#connection-string) for more detail.

## Connection string

When you [initiate a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication) from the standby cluster, it is necessary to pass a connection string to the system virtual cluster on the primary cluster:

{% include_cached copy-clipboard.html %}
~~~
'postgresql://{replication user}:{password}@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full&sslrootcert=certs/{primary cert}.crt'
~~~

To form a connection string similar to the example, include the following values and query parameters. Replace values in `{...}` with the appropriate values for your configuration:

Value | Description
----------------+------------
`{replication user}` | The user on the primary cluster that has the `REPLICATION` system privilege. Refer to [Create a user with replication privileges]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#create-a-user-with-replication-privileges) for more detail.
`{password}` | The replication user's password.
`{node ID or hostname}` | The node IP address or hostname of any node from the primary cluster.
`options=ccluster=system` | The parameter to connect to the system virtual cluster on the primary cluster.
`sslmode=verify-full` | The `verify-full` secure connection type.
`sslrootcert={primary cert}` | The path to the primary cluster's CA certificate on the standby cluster.

## Capabilities

{{site.data.alerts.callout_info}}
Cockroach Labs does not recommend changing the default capabilities of created virtual clusters.
{{site.data.alerts.end}}

_Capabilities_ control what a virtual cluster can do. The configuration profile included at startup creates the `template` virtual cluster with the same set of capabilities per CockroachDB version. When you start a replication stream, you can specify the `template` VC with `LIKE` to ensure other virtual clusters on the standby cluster will work in the same way. `LIKE` will refer to a virtual cluster on the CockroachDB cluster you're running the statement from.

## Example

### Start a replication stream

To start a replication stream to the standby of the primary's virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}';
~~~

This will create a `main` virtual cluster in the standby cluster. The standby's system virtual cluster will connect to the primary cluster to initiate the replication stream job. For detail on the replication stream, refer to the [Responses]({% link {{ page.version.version }}/show-virtual-cluster.md %}#responses) for `SHOW VIRTUAL CLUSTER`.

## See also

- [`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %})
- [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})
