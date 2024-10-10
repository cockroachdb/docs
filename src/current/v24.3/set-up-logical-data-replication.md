---
title: Set Up Logical Data Replication
summary: Follow a tutorial to set up logical data replication between two clusters.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

In this tutorial, you will set up **logical data replication (LDR)** between two CockroachDB clusters. Both clusters are active and can serve traffic. You can apply the outlined steps to create a bidirectional LDR stream, or any other suitable pattern with your deployment, which results in one cluster operating as both a source and a destination cluster in separate LDR jobs.

## Tutorial overview

If you're setting up a bidirectional LDR stream, both clusters will act as a source and a destination in the respective LDR streams. The high-level steps are:

1. Prepare the tables on each cluster with the prerequisites for starting an LDR stream.
1. Set up an external connection on cluster A to hold the connection URI for cluster B.
1. Start the replication stream from cluster B with your required modes.
1. (Optional) Run Steps 2 and 3 again to create an LDR stream flowing from cluster B to A.
1. Check the status of the LDR job in the DB Console.

<image src="{{ 'images/v24.3/bidirectional-stream.svg' | relative_url }}" alt="Diagram showing a bidirectional LDR stream from cluster A to B and back again from cluster B to A." style="width:70%" />

## Before you begin

You'll need:

- Two separate v24.3 CockroachDB clusters with connectivity between every node in both clusters. The SQL advertise address should be the cluster node advertise address so that the LDR job can plan node-to-node connections between clusters for maximum performance.
    - To set up each cluster, you can follow [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}).
    - The [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) tutorial creates a self-signed certificate for each {{ site.data.products.core }} cluster. To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}).
    - Both clusters can be empty.
    - One cluster can be empty and the other can have an existing table/dataset.

    {{site.data.alerts.callout_info}}
    If you need to run LDR streams through a load balancer, use the load balancer IP address as the SQL advertise address on each cluster. It is important to note that using a load balancer with LDR can impair performance
    {{site.data.alerts.end}}

- All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Connect from the destination to the source](#step-2-connect-from-the-destination-to-the-source).
- If both clusters are empty, create a table with identical schema definitions (excluding indexes) on both clusters. If one cluster already has an existing table, ensure the other cluster's table definition matches. For more details on the supported schemas, refer to [Schema Validation]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#schema-validation).

## Step 1. Prepare the cluster

1. Enter the SQL shell for both clusters in separate terminal windows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{node IP or hostname}:26257?sslmode=verify-full" --certs-dir=certs
    ~~~

1. On both clusters, enable the `kv.rangefeed.enabled` cluster setting:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. On cluster B, that is the destination, create a user with the [`REPLICATION` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) who will start the LDR stream:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER {your username} WITH PASSWORD '{your password}';
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT SYSTEM REPLICATION TO {your username};
    ~~~

    If you need to change the password later, refer to [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}). {% comment  %}Add link to https://www.cockroachlabs.com/docs/stable/ui-overview#db-console-security-considerations for secure clusters{% endcomment %}

1. If you would like to ignore row-level TTL deletes in the LDR stream, set the `ttl_disable_changefeed_replication` storage parameter on the table. On the source cluster, alter the table to set the table storage parameter:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE {table_name} SET (ttl_disable_changefeed_replication = 'true');
    ~~~

    {% comment  %} Add link to the example for this on the create logical replication stream page once published. {% endcomment %}

## Step 2. Connect from the destination to the source

In this step, you'll set up an external connection from the destination cluster to the source cluster. Depending on how you manage certificates, you must ensure that all nodes between the clusters have access to the certificate of the other cluster.

You can use the `cockroach encode-uri` command to generate a connection string containing a cluster's certificate.

For example, in this tutorial you will need a connection string for the source cluster when you start the replication stream from the destination cluster.

1. On the source cluster in a new terminal window, generate a connection string, by passing the replication user, node IP, and port, along with the directory to the source cluster's CA certificate:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach encode-uri {replication user}:{password}@{node IP}:26257 --ca-cert {path to CA certificate} --inline
    ~~~

    The connection string output contains the source cluster's certificate:

    ~~~
    {replication user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A
    ~~~

1. In the SQL shell on the destination cluster, create an external connection using the source cluster's connection string. Prefix the `postgresql://` scheme to the connection string and replace `{source}` with your external connection name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION {source} AS 'postgresql://{replication user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A`;
    ~~~

## Step 3. Start the replication stream

In this step, you'll start the LDR stream. You can replicate one or multiple tables in a single LDR stream. You cannot replicate system tables in LDR streams, which means that you must manually apply configurations and cluster settings, such as row-level TTL and user permissions on the destination cluster.

_Modes_ determine how the LDR job replicates the data to the destination cluster. There are two modes:

- `immediate` (default): Inserts data at the KV layer, which means that the stream does not encounter issues with updates and deletes. For example, an update to the same key from cluster A will not apply on cluster B if that key was deleted on cluster B before the cluster A update was replicated. It is important to consider that `immediate` mode does not insert at the SQL level, so the replication will not follow SQL constraints, so you can only use `immediate` mode if you do not have [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints on the replicating table. `immediate` mode provides faster replication compared to `validated` mode.  
- `validated`: Inserts data at the SQL layer. All SQL constraints are adhered to; if a row is unable to apply due to a SQL constraint, it will be put in the dead letter queue (DLQ) for manual resolution. SQL does not recognize deletion records used by MVCC, as a result an update to the same key from cluster A will successfully apply on cluster B even if that key was deleted on cluster B before the cluster A update was replicated.

If you would like to ignore TTL deletes in the LDR replication stream, you can use the `DISCARD = ttl-deletes` option in the `CREATE LOGICAL REPLICATION STREAM` statement. Before you begin the LDR job, you must first set the table storage parameter [`ttl_disable_changefeed_replication = 'true'`]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters) on the replicating table. {% comment  %}link to the example on create logical replication stream sql ref page when pub'd{% endcomment %}

1. From the destination cluster, start the LDR stream. Use the fully qualified table name and ensure the source and destination table names are identical:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name};
    ~~~

    You can change the default `mode` using the `WITH mode = validated` syntax.

    Once the LDR stream has started, on the destination cluster, an LDR job will start. You can pause, resume, or drop the LDR job with the job ID. Use `SHOW LOGICAL REPLICATION JOBS` to display the LDR job IDs:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW LOGICAL REPLICATION JOBS;
    ~~~
    ~~~
            job_id        | status  |          targets          | replicated_time
    ----------------------+---------+---------------------------+------------------
    1012877040439033857   | running | {database.public.table}   | NULL
    (1 row)
    ~~~

    If you're setting up bidirectional LDR streams, both clusters will have a history retention job and an LDR job running.

1. Move on to [Step 4](#step-4-optional-set-up-bidirectional-ldr-streams) to set up a second LDR stream. Or, once you have set up your required LDR streams, refer to [Step 5](#step-5-monitor-the-ldr-jobs) to monitor the jobs in the DB Console.

## Step 4. (Optional) Set up bidirectional LDR streams

At this point, you've set up one LDR stream from cluster A as the source to cluster B as the destination. 

1. To set up a stream flowing in the opposite direction, complete [Step 2](#step-2-connect-from-the-destination-to-the-source) and [Step 3](#step-3-start-the-replication-stream) again. Cluster B will now be the source, and cluster A will be the destination.
1. After the two streams are running, you can check the number of rows on each cluster with:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT COUNT(*) from {table_name};
    ~~~

    {% comment  %} TODO: Add output here when example included.
    To verify that data at a certain point in time is correct on the destination cluster, refer to [Data verification](). {% endcomment %}

## Step 5. Monitor the LDR jobs

In this step, you'll access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and monitor the status and metrics for the created LDR jobs. Depending on which cluster you would like to view, follow the instructions for either the source or destination.

1. Access the DB Console at `http://{node IP or hostname}:8080` and enter your user's credentials.
1. Navigate to the **Jobs** page to view a list of all jobs. Use the job **Type** dropdown and select **Replication Producer**. On the source cluster for an LDR stream, this will display the history retention job. This will run while the LDR stream is active to protect changes to the table from garbage colleciton until they have been replicated to the destination cluster.
1. Use the job **Type** dropdown and select **Logical Replication Ingestion**. On the destination cluster for an LDR stream, this page will display the logical replication stream job. There will be a progress bar in the **Status** column when the LDR stream is replicating a table that already had data. This progress bar shows the status of the initial scan of the table, which then backfills the destination table with the existing data.
1. Click on **Metrics** in the left-hand navigation menu. Use the **Dashboard** dropdown to select **Logical Data Replication**. This page shows graphs for monitoring the LDR stream. 

## What's next

- [Manage Logical Data Replication]({% link {{ page.version.version }}/manage-logical-data-replication.md %}): Manage the DLQ and schema changes for the replicating tables.
{% comment  %}Pages to include here: Monitoring LDR, `CREATE LOGICAL REPLICATION STREAM`, LDR overview, Resilience overview page{% endcomment %}



{% comment  %}
Short-form examples that will be included on the CREATE LOGICAL REPLICATION STREAM SQL ref page
1. Ignore ttl deletes with the workflow for TTL changefeed storage parameter
1. Start a LDR stream where one left off (cursor)
1. Both modes
{% endcomment %}