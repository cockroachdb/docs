---
title: Set Up Logical Data Replication
summary: Follow a tutorial to set up logical data replication between two clusters.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

In this tutorial, you will set up [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) streaming data from a source table to a destination table between two CockroachDB clusters. Both clusters are active and can serve traffic. You can apply the outlined steps to set up one of the following:

- _Unidirectional_ LDR from a source table to a destination table (cluster A to cluster B) in one LDR job.
- _Bidirectional_ LDR for the same table from cluster A to cluster B and from cluster B to cluster A. In a bidirectional setup, each cluster operates as both a source and a destination in separate LDR jobs.

{% include_cached new-in.html version="v25.1" %} Create the new table on the destination cluster automatically and conduct a fast, offline initial scan with the [`CREATE LOGICALLY REPLICATED`]({% link {{ page.version.version }}/create-logically-replicated.md %}) syntax. `CREATE LOGICALLY REPLICATED` accepts `unidirectional` or `bidirectional on` as an option in order to create one of the setups automatically. [Step 3](#step-3-start-ldr) outlines when to use the `CREATE LOGICALLY REPLICATED` or the `CREATE LOGICAL REPLICATION STREAM` syntax to start LDR.

In the following diagram, **LDR stream 1** creates a unidirectional LDR setup, introducing **LDR stream 2** extends the setup to bidirectional.

<image src="/docs/images/{{ page.version.version }}/bidirectional-stream.svg" alt="Diagram showing bidirectional LDR from cluster A to B and back again from cluster B to A." style="width:70%" />

For more details on use cases, refer to the [Logical Data Replication Overview]({% link {{ page.version.version }}/logical-data-replication-overview.md %}).

## Tutorial overview

If you're setting up bidirectional LDR, both clusters will act as a source and a destination in the respective LDR jobs. The high-level steps for setting up bidirectional or unidirectional LDR:

1. Prepare the clusters with the required settings, users, and privileges according to the LDR setup.
1. Set up [external connection(s)]({% link {{ page.version.version }}/create-external-connection.md %}) on the destination to hold the connection URI for the source.
1. Start LDR from the destination cluster with your required syntax and options.
1. Check the status of the LDR job in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}).

## Before you begin

You'll need:

- Two separate {{ page.version.version }} CockroachDB {{ site.data.products.core }} clusters with connectivity between every node in both clusters. That is, all nodes in cluster A must be able to contact each node in cluster B and vice versa. The SQL advertised address should be the cluster node advertise address so that the LDR job can plan node-to-node connections between clusters for maximum performance. The source and destination clusters must be configured with similar hardware profiles, number of nodes, and overall size. Significant discrepancies in the cluster configurations may result in degraded performance.
    - To set up each cluster, you can follow [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}).
    - The [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) tutorial creates a self-signed certificate for each {{ site.data.products.core }} cluster. To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}).
    - All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Step 2. Connect from the destination to the source](#step-2-connect-from-the-destination-to-the-source).
- LDR replicates at the table level, which means clusters can contain other tables that are not part of the LDR job. (For [`CREATE LOGICAL REPLICATION STREAM`](#create-logical-replication-stream) only): If both clusters are empty, create the tables that you need to replicate with **identical** schema definitions (excluding indexes) on both clusters. If one cluster already has an existing table that you'll replicate, ensure the other cluster's table definition matches. For more details on the supported schemas, refer to [Schema Validation](#schema-validation).

### Schema validation

Before you start LDR, you must ensure that all column names, types, constraints, and unique indexes on the destination table match with the source table.

You cannot use LDR on a table with a schema that contains:

- [Column families]({% link {{ page.version.version }}/column-families.md %})
- [Partial indexes]({% link {{ page.version.version }}/partial-indexes.md %}) and [hash-sharded indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %})
- Indexes with a [virtual computed column]({% link {{ page.version.version }}/computed-columns.md %})
- Composite types in the [primary key]({% link {{ page.version.version }}/primary-key.md %})
- [Foreign key]({% link {{ page.version.version }}/foreign-key.md %}) dependencies

Additionally, for the `CREATE LOGICALLY REPLCATED` syntax, you cannot use LDR on a table with a schema that contains:

- [User-defined types]({% link {{ page.version.version }}/enum.md %}) 

For more details, refer to the LDR [Known limitations]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#known-limitations).

#### Unique secondary indexes

When the destination table includes unique [secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}), it can cause rows to enter the [_dead letter queue_ (DLQ)]({% link {{ page.version.version }}/manage-logical-data-replication.md %}). The two clusters in LDR operate independently, so writes to one cluster can conflict with writes to the other.

If the application modifies the same row in both clusters, LDR resolves the conflict using [_last write wins_ (LWW)]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#conflict-resolution) conflict resolution. [`UNIQUE` constraints]({% link {{ page.version.version }}/unique.md %}) are validated locally in each cluster, therefore if a replicated write violates a `UNIQUE` constraint on the destination cluster (possibly because a conflicting write was already applied to the row) the replicating row will be applied to the DLQ. 

For example, consider a table with a unique `name` column where the following operations occur in this order in a source and destination cluster running LDR:

On the **source cluster**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- writes to the source table
INSERT INTO city (1, nyc); -- timestamp 1
UPDATE city SET name = 'philly' WHERE id = 1; -- timestamp 2
INSERT INTO city (100, nyc); -- timestamp 3
~~~

LDR replicates the write to the **destination cluster**: 

{% include_cached copy-clipboard.html %}
~~~ sql
-- replicates to the destination table
INSERT INTO city (100, nyc); -- timestamp 4
~~~

_Timestamp 5:_ [Range]({% link {{ page.version.version }}/architecture/glossary.md %}#range) containing primary key `1` on the destination cluster is unavailable for a few minutes due to a [network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition).

_Timestamp 6:_ On the destination cluster, LDR attempts to replicate the row `(1, nyc)`, but it enters the retry queue for 1 minute due to the unavailable range. LDR adds `1, nyc` to the DLQ table after retrying and observing the `UNIQUE` constraint violation:

{% include_cached copy-clipboard.html %}
~~~ sql
-- writes to the DLQ
INSERT INTO city (1, nyc); -- timestamp 6
~~~

_Timestamp 7:_ LDR continues to replicate writes:

{% include_cached copy-clipboard.html %}
~~~ sql
-- replicates to the destination table
INSERT INTO city (1, philly); -- timestamp 7
~~~

To prevent expected DLQ entries and allow LDR to be eventually consistent, we recommend:

- For **unidirectional** LDR, validate unique index constraints on the source cluster only. 
- For **bidirectional** LDR, remove unique index constraints on both clusters.

## Step 1. Prepare the cluster

In this step you'll prepare the required settings and privileges for LDR. 

{{site.data.alerts.callout_info}}
If you are setting up bidirectional LDR, you **must** run this step on both clusters.
{{site.data.alerts.end}}

1. Enter the SQL shell for **both** clusters in separate terminal windows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{node IP or hostname}:26257?sslmode=verify-full" --certs-dir=certs
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) on the **source** cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. On the **destination**, create a user with the [`REPLICATION` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) who will start the LDR job:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT SYSTEM REPLICATION TO {your username};
    ~~~

    To change the password later, refer to [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}).

## Step 2. Connect from the destination to the source

In this step, you'll set up [external connection(s)]({% link {{ page.version.version }}/create-external-connection.md %}) to store the connection string for one or both clusters. Depending on how you manage certificates, you must ensure that all nodes between the clusters have access to the certificate of the other cluster.

You can use the `cockroach encode-uri` command to generate a connection string containing a cluster's certificate.

1. On the **source** cluster in a new terminal window, generate a connection string, by passing the replication user, node IP, and port, along with the directory to the source cluster's CA certificate:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach encode-uri {user}:{password}@{node IP}:26257 --ca-cert {path to CA certificate} --inline
    ~~~

    The connection string output contains the source cluster's certificate:

    ~~~
    {user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A
    ~~~

1. In the SQL shell on the **destination** cluster, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) using the source cluster's connection string. Prefix the `postgresql://` scheme to the connection string and replace `{source}` with your external connection name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION {source} AS 'postgresql://{user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A';
    ~~~

### (Optional) Bidirectional: Create the connection for LDR stream 2

(Optional) For bidirectional LDR, you'll need to repeat creating the certificate output and the external connection for the opposite cluster. Both clusters will act as the source and destination. At this point, you've created an external connection for LDR stream 1, so cluster **A** (source) to **B** (destination). Now, create the same for LDR stream 2 cluster **B** (source) to cluster **A** (destination).

1. On cluster **B**, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach encode-uri {user}:{password}@{node IP}:26257 --ca-cert {path to CA certificate} --inline
    ~~~

    The connection string output contains the source cluster's certificate:

    ~~~
    {user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A
    ~~~

1. On cluster **A**, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) using cluster B's connection string (source in LDR stream 2). Prefix the `postgresql://` scheme to the connection string and replace `{source}` with your external connection name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION {source} AS 'postgresql://{user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A';
    ~~~

## Step 3. Start LDR

In this step, you'll start the LDR stream(s) from the destination cluster. You can replicate one or multiple tables in a single LDR job. You cannot replicate system tables in LDR, which means that you must manually apply configurations and cluster settings, such as [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) and user permissions on the destination cluster.

### Syntax

LDR streams can be started using one of the following SQL statements, depending on your requirements:

- {% include_cached new-in.html version="v25.1" %} [`CREATE LOGICALLY REPLICATED`]({% link {{ page.version.version }}/create-logically-replicated.md %}): Creates the new table on the destination cluster automatically, and conducts a fast, offline initial scan. `CREATE LOGICALLY REPLICATED` accepts `unidirectional` or `bidirectional on` as an option in order to create either one of the setups automatically. **The table cannot contain a [user-defined types]({% link {{ page.version.version }}/enum.md %}).** Follow [these steps](#create-logically-replicated) for setup instructions.
- [`CREATE LOGICAL REPLICATION STREAM`]({% link {{ page.version.version }}/create-logical-replication-stream.md %}): Starts the LDR stream after you've created the matching table on the destination cluster. **If the table contains user-defined types, you must use this syntax.** Allows for manual creation of unidirectional or bidirectional LDR. Follow [these steps](#create-logical-replication-stream) for setup instructions.

Also, for both SQL statements, note:

- It is necessary to use the [fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) table name for the source table and destination table in the statement.
- {% include {{ page.version.version }}/ldr/multiple-tables.md %}

#### `CREATE LOGICALLY REPLICATED`

Use `CREATE LOGICALLY REPLICATED` to create either a unidirectional or bidirectional LDR stream automatically:

- Unidirectional LDR: run the following from the **destination** cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICALLY REPLICATED TABLE {database.public.destination_table_name} FROM TABLE {database.public.source_table_name} ON 'external://source' WITH unidirectional;
    ~~~

- Bidirectional LDR: This statement will first create the LDR jobs for the first stream. You must run it from the **destination** cluster that does not contain the table. Once the offline initial scan completes, the reverse stream will be initialized so that the original destination cluster can send changes to the original source.

    Run the following from the **destination** cluster (i.e, the cluster that does not have the table currently):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICALLY REPLICATED TABLE {database.public.destination_table_name} FROM TABLE {database.public.source_table_name} ON 'external://source' WITH bidirectional ON 'external://destination';
    ~~~

You can include multiple tables in the LDR stream for unidirectional or bidirectional setups. Ensure that the table name in the source table list and destination table list are in the same order so that the tables correctly map between the source and destination for replication:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICALLY REPLICATED TABLE ({database.public.destination_table_name_1}, {database.public.destination_table_name_2}) FROM TABLE ({database.public.source_table_name_1}, {database.public.source_table_name_2}) ON 'external://source' WITH bidirectional ON 'external://destination', label=track_job;
~~~

With the LDR streams created, move to [Step 4](#step-4-manage-and-monitor-the-ldr-jobs) to manage and monitor the jobs.

#### `CREATE LOGICAL REPLICATION STREAM`

Ensure you've created the table on the destination cluster with a matching schema definition to the source cluster table. From the **destination** cluster, start LDR. Use the [fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) table name for the source and destination tables:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.source_table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.destination_table_name};
~~~

If you would like to add multiple tables to the LDR job, ensure that the table name in the source table list and destination table list are in the same order:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICAL REPLICATION STREAM FROM TABLES ({database.public.source_table_name_1},{database.public.source_table_name_2},...)  ON 'external://{source_external_connection}' INTO TABLES ({database.public.destination_table_name_1},{database.public.destination_table_name_2},...);
~~~

(**Optional**) At this point, you've set up one LDR stream from cluster A as the source to cluster B as the destination. To set up LDR streaming in the opposite direction using `CREATE LOGICAL REPLICATION STREAM`, run the statement again but cluster B will now be the source, and cluster A will be the destination.

## Step 4. Manage and monitor the LDR jobs

Once LDR has started, an LDR job will run on the destination cluster. You can [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), or [cancel]({% link {{ page.version.version }}/cancel-job.md %}) the LDR job with the job ID. Use [`SHOW LOGICAL REPLICATION JOBS`]({% link {{ page.version.version }}/show-logical-replication-jobs.md %}) to display the LDR job IDs:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS;
~~~
~~~
        job_id        | status  |          tables           | replicated_time
----------------------+---------+---------------------------+------------------
1012877040439033857   | running | {database.public.table}   | NULL
(1 row)
~~~

If you're setting up bidirectional LDR, both clusters will have a history retention job and an LDR job running.

### DB Console

You'll access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and monitor the status and metrics for the created LDR jobs. Depending on which cluster you would like to view, follow the instructions for either the source or destination.

{{site.data.alerts.callout_success}}
You can use the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), the SQL shell, [Metrics Export]({% link {{ page.version.version }}/datadog.md %}#enable-metrics-collection) with Prometheus and Datadog, and [labels with some LDR metrics]({% link {{ page.version.version }}/multi-dimensional-metrics.md %}) to monitor the job.

For a full reference on monitoring LDR, refer to [Logical Data Replication Monitoring]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}).
{{site.data.alerts.end}}

1. Access the DB Console at `http://{node IP or hostname}:8080` and enter your user's credentials.
1. On the source cluster, navigate to the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) to view a list of all jobs. Use the job **Type** dropdown and select **Replication Producer**. This will display the history retention job. This will run while the LDR job is active to protect changes to the table from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) until they have been replicated to the destination cluster.
1. On the destination cluster, use the job **Type** dropdown and select **Logical Replication Ingestion**. This page will display the logical replication stream job. There will be a progress bar in the **Status** column when LDR is replicating a table with existing data. This progress bar shows the status of the initial scan, which backfills the destination table with the existing data.
1. On the destination cluster, click on **Metrics** in the left-hand navigation menu. Use the **Dashboard** dropdown to select [**Logical Data Replication**]({% link {{ page.version.version }}/ui-logical-data-replication-dashboard.md %}). This page shows graphs for monitoring LDR.

## What's next

- [Manage Logical Data Replication]({% link {{ page.version.version }}/manage-logical-data-replication.md %}): Manage the DLQ and schema changes for the replicating tables.
- [`CREATE LOGICAL REPLICATION STREAM`]({% link {{ page.version.version }}/create-logical-replication-stream.md %})
- [Data Resilience]({% link {{ page.version.version }}/data-resilience.md %})
