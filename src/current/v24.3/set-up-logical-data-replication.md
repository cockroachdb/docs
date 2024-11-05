---
title: Set Up Logical Data Replication
summary: Follow a tutorial to set up logical data replication between two clusters.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

In this tutorial, you will set up **logical data replication (LDR)** streaming data from a source table to a destination table between two CockroachDB clusters. Both clusters are active and can serve traffic. You can apply the outlined steps to create _unidirectional_ LDR from a source table to a destination table (cluster A to cluster B) in one LDR job. Optionally, you can also create _bidirectional_ LDR from cluster B's table to cluster A's table by starting a second LDR job. In a bidirectional setup, each cluster operates as both a source and a destination in separate LDR jobs. 

{% comment  %}Will link to LDR overview when published for descriptions of use case topology here{% endcomment %}

<image src="{{ 'images/v24.3/bidirectional-stream.svg' | relative_url }}" alt="Diagram showing bidirectional LDR from cluster A to B and back again from cluster B to A." style="width:70%" />

## Tutorial overview

If you're setting up bidirectional LDR, both clusters will act as a source and a destination in the respective LDR jobs. The high-level steps are:

1. Prepare the tables on each cluster with the prerequisites for starting LDR.
1. Set up an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) on cluster B to hold the connection URI for cluster A.
1. Start LDR from cluster B with your required modes.
1. (Optional) Run Steps 2 and 3 again with cluster B as the source and A as the destination, which starts LDR streaming from cluster B to A.
1. Check the status of the LDR job in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}).

## Before you begin

You'll need:

- Two separate v24.3 CockroachDB clusters with connectivity between every node in both clusters. The SQL advertise address should be the cluster node advertise address so that the LDR job can plan node-to-node connections between clusters for maximum performance.
    - To set up each cluster, you can follow [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}).
    - The [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) tutorial creates a self-signed certificate for each {{ site.data.products.core }} cluster. To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}).
    - Both clusters can be empty.
    - One cluster can be empty and the other can have an existing table/dataset.

    {{site.data.alerts.callout_info}}
    If you need to run LDR through a load balancer, use the load balancer IP address as the SQL advertise address on each cluster. It is important to note that using a load balancer with LDR can impair performance.
    {{site.data.alerts.end}}

- All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Connect from the destination to the source](#step-2-connect-from-the-destination-to-the-source).
- If both clusters are empty, create the tables that you need to replicate with **identical** schema definitions (excluding indexes) on both clusters. If one cluster already has an existing table that you'll replicate, ensure the other cluster's table definition matches. For more details on the supported schemas, refer to [Schema Validation](#schema-validation).

To create bidirectional LDR, you can complete the [optional step](#step-4-optional-set-up-bidirectional-ldr) to start the second LDR job that sends writes from the table on cluster B to the table on cluster A.

### Schema validation

Before you start LDR, you must ensure that all column names, types, constraints, and unique indexes on the destination table match with the source table.

You cannot use LDR on a table with a schema that contains the following:

- Columns with [user-defined types]({% link {{ page.version.version }}/create-type.md %})
- [Column families]({% link {{ page.version.version }}/column-families.md %})
- [Partial indexes]({% link {{ page.version.version }}/partial-indexes.md %})
- Indexes with a [computed column]({% link {{ page.version.version }}/computed-columns.md %})
- Composite types in the [primary key]({% link {{ page.version.version }}/primary-key.md %})

For more details, refer to the LDR [Known limitations]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#known-limitations).

When you run LDR in `immediate` mode, you cannot replicate a table with [foreign key constraints]({% link {{ page.version.version }}/foreign-key.md %}). In `validated` mode, foreign key constraints **must** match. 

## Step 1. Prepare the cluster

1. Enter the SQL shell for **both** clusters in separate terminal windows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{node IP or hostname}:26257?sslmode=verify-full" --certs-dir=certs
    ~~~

1. On **both** clusters, enable the `kv.rangefeed.enabled` cluster setting:

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

    If you need to change the password later, refer to [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}). {% comment  %}Add link to https://www.cockroachlabs.com/docs/stable/ui-overview#db-console-security-considerations for secure clusters{% endcomment %}

1. (Optional) If you would like to ignore row-level TTL deletes in LDR, set the `ttl_disable_changefeed_replication` storage parameter on the table. On the **source** cluster, alter the table to set the table storage parameter:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE {table_name} SET (ttl_disable_changefeed_replication = 'true');
    ~~~

    {% comment  %} Add link to the example for this on the create logical replication stream page once published. {% endcomment %}

## Step 2. Connect from the destination to the source

In this step, you'll set up an external connection from the destination cluster to the source cluster. Depending on how you manage certificates, you must ensure that all nodes between the clusters have access to the certificate of the other cluster.

You can use the `cockroach encode-uri` command to generate a connection string containing a cluster's certificate.

1. On the **source** cluster in a new terminal window, generate a connection string, by passing the replication user, node IP, and port, along with the directory to the source cluster's CA certificate:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach encode-uri {replication user}:{password}@{node IP}:26257 --ca-cert {path to CA certificate} --inline
    ~~~

    The connection string output contains the source cluster's certificate:

    ~~~
    {replication user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A
    ~~~

1. In the SQL shell on the **destination** cluster, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) using the source cluster's connection string. Prefix the `postgresql://` scheme to the connection string and replace `{source}` with your external connection name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION {source} AS 'postgresql://{replication user}:{password}@{node IP}:26257?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded certificate}-----END+CERTIFICATE-----%0A`;
    ~~~

## Step 3. Start LDR

In this step, you'll start the LDR job from the destination cluster. You can replicate one or multiple tables in a single LDR job. You cannot replicate system tables in LDR, which means that you must manually apply configurations and cluster settings, such as [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) and user permissions on the destination cluster.

_Modes_ determine how LDR replicates the data to the destination cluster. There are two modes:

- `immediate` (default): Attempts to replicate the changed row directly into the destination table, without re-running constraint validations or triggers. It does not support writing into tables with [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints.
- `validated`: Attempts to apply the write in a similar way to a user-run query, which would re-run all constraint validations or triggers relevant to the destination table(s). It will potentially reject the change if it fails rather than writing it, which will cause the row change to enter the DLQ instead.

{{site.data.alerts.callout_info}}
If you would like to ignore TTL deletes in LDR, you can use the `discard = ttl-deletes` option in the `CREATE LOGICAL REPLICATION STREAM` statement.
{{site.data.alerts.end}}

1. From the **destination** cluster, start LDR. Use the fully qualified table name and ensure the source and destination table names are identical:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name};
    ~~~

    You can change the default `mode` using the `WITH mode = validated` syntax.

    If you would like to add multiple tables to the LDR job:

        {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLES ({database.public.table_name},{database.public.table_name},...)  ON 'external://{source_external_connection}' INTO TABLES ({database.public.table_name},{database.public.table_name},...);
    ~~~

    {% include {{ page.version.version }}/ldr/multiple-tables.md %}

    Once LDR has started, an LDR job will start on the destination cluster. You can [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), or [cancel]({% link {{ page.version.version }}/cancel-job.md %}) the LDR job with the job ID. Use `SHOW LOGICAL REPLICATION JOBS` to display the LDR job IDs:

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

    If you're setting up bidirectional LDR, both clusters will have a history retention job and an LDR job running.

1. Move on to [Step 4](#step-4-optional-set-up-bidirectional-ldr) to set up a second LDR job. Or, once you have set up your required LDR jobs, refer to [Step 5](#step-5-monitor-the-ldr-jobs) to monitor the jobs in the DB Console.

## Step 4. (Optional) Set up bidirectional LDR

At this point, you've set up one LDR job from cluster A as the source to cluster B as the destination. To set up LDR streaming in the opposite direction, complete [Step 2](#step-2-connect-from-the-destination-to-the-source) and [Step 3](#step-3-start-ldr) again. Cluster B will now be the source, and cluster A will be the destination.

    {% comment  %} TODO: Add output here when example included.
    To verify that data at a certain point in time is correct on the destination cluster, refer to [Data verification](). 1. After the two jobs are running, you can check the number of rows on each cluster with  {% endcomment %}

## Step 5. Monitor the LDR jobs

In this step, you'll access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and monitor the status and metrics for the created LDR jobs. Depending on which cluster you would like to view, follow the instructions for either the source or destination.

1. Access the DB Console at `http://{node IP or hostname}:8080` and enter your user's credentials.
1. Navigate to the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) to view a list of all jobs. Use the job **Type** dropdown and select **Replication Producer**. On the source cluster for LDR, this will display the history retention job. This will run while the LDR job is active to protect changes to the table from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) until they have been replicated to the destination cluster.
1. Use the job **Type** dropdown and select **Logical Replication Ingestion**. On the destination cluster for LDR, this page will display the logical replication stream job. There will be a progress bar in the **Status** column when LDR is replicating a table with existing data. This progress bar shows the status of the initial scan, which backfills the destination table with the existing data.
1. Click on **Metrics** in the left-hand navigation menu. Use the **Dashboard** dropdown to select **Logical Data Replication**. This page shows graphs for monitoring LDR. 

{% comment  %}Need to add the monitoring page here once published and more details on what to monitor, or links out.{% endcomment %}
## What's next

- [Manage Logical Data Replication]({% link {{ page.version.version }}/manage-logical-data-replication.md %}): Manage the DLQ and schema changes for the replicating tables.
{% comment  %}Pages to include here: Monitoring LDR, `CREATE LOGICAL REPLICATION STREAM`, LDR overview, Resilience overview page{% endcomment %}

## Known limitations

- {% include {{ page.version.version }}/known-limitations/ldr-triggers.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-udfs.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-sequences.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-indexes.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-column-families.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-composite-primary.md %}


{% comment  %}
Short-form examples that will be included on the CREATE LOGICAL REPLICATION STREAM SQL ref page
1. Ignore ttl deletes with the workflow for TTL changefeed storage parameter
1. Start a LDR stream where one left off (cursor)
1. Both modes
{% endcomment %}