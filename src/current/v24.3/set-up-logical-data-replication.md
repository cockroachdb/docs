---
title: Set Up Logical Data Replication
summary: Follow a tutorial to set up logical data replication between two clusters.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

In this tutorial, you will set up **logical data replication (LDR)** streaming data from a source table to a destination table between two CockroachDB clusters. Both clusters are active and can serve traffic. You can apply the outlined steps to create _unidirectional_ LDR from a source table to a destination table (cluster A to cluster B) in one LDR job. Optionally, you can also create _bidirectional_ LDR from cluster B's table to cluster A's table by starting a second LDR job. In a bidirectional setup, each cluster operates as both a source and a destination in separate LDR jobs. 

{% comment  %}Will link to LDR overview when published for descriptions of use case topology here{% endcomment %}

<image src="{{ 'images/v24.3/bidirectional-stream.svg' | relative_url }}" alt="Diagram showing bidirectional LDR from cluster A to B and back again from cluster B to A." style="width:70%" />

## Tutorial overview

If you're setting up bidirectional LDR, both clusters will act as a source and a destination in the respective LDR jobs. The high-level steps are:

1. Prepare the tables on each cluster with the prerequisites for starting LDR.
1. Set up an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) on cluster B (which will be the destination cluster initially) to hold the connection URI for cluster A.
1. Start LDR from cluster B with your required modes.
1. (Optional) Run Steps 1 to 3 again with cluster B as the source and A as the destination, which starts LDR streaming from cluster B to A.
1. Check the status of the LDR job in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}). {% comment  %}to add link to the monitoring page once published{% endcomment %}

## Before you begin

You'll need:

- Two separate {{ page.version.version }} CockroachDB {{ site.data.products.core }} clusters with connectivity between every node in both clusters. That is, all nodes in cluster A must be able to contact each node in cluster B and vice versa. The SQL advertised address should be the cluster node advertise address so that the LDR job can plan node-to-node connections between clusters for maximum performance.
    - To set up each cluster, you can follow [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}).
    - The [Deploy CockroachDB on Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}) tutorial creates a self-signed certificate for each {{ site.data.products.core }} cluster. To create certificates signed by an external certificate authority, refer to [Create Security Certificates using OpenSSL]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}).
    - All nodes in each cluster will need access to the Certificate Authority for the other cluster. Refer to [Step 2. Connect from the destination to the source](#step-2-connect-from-the-destination-to-the-source).
- LDR replicates at the table level, which means clusters can contain other tables that are not part of the LDR job. If both clusters are empty, create the tables that you need to replicate with **identical** schema definitions (excluding indexes) on both clusters. If one cluster already has an existing table that you'll replicate, ensure the other cluster's table definition matches. For more details on the supported schemas, refer to [Schema Validation](#schema-validation).

{% comment  %}To add later, after further dev work{{site.data.alerts.callout_info}}
If you need to run LDR through a load balancer, use the load balancer IP address as the SQL advertise address on each cluster. It is important to note that using a load balancer with LDR can impair performance.
{{site.data.alerts.end}}{% endcomment %}

To create bidirectional LDR, you can complete the [optional step](#step-4-optional-set-up-bidirectional-ldr) to start the second LDR job that sends writes from the table on cluster B to the table on cluster A.

### Schema validation

Before you start LDR, you must ensure that all column names, types, constraints, and unique indexes on the destination table match with the source table.

You cannot use LDR on a table with a schema that contains the following:

- [Column families]({% link {{ page.version.version }}/column-families.md %})
- [Partial indexes]({% link {{ page.version.version }}/partial-indexes.md %}) and [hash-sharded indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %})
- Indexes with a [virtual computed column]({% link {{ page.version.version }}/computed-columns.md %})
- Composite types in the [primary key]({% link {{ page.version.version }}/primary-key.md %})

For more details, refer to the LDR [Known limitations]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#known-limitations).

When you run LDR in `immediate` mode, you cannot replicate a table with [foreign key constraints]({% link {{ page.version.version }}/foreign-key.md %}). In `validated` mode, foreign key constraints **must** match. All constraints are enforced at the time of SQL/application write.

## Step 1. Prepare the cluster

1. Enter the SQL shell for **both** clusters in separate terminal windows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{node IP or hostname}:26257?sslmode=verify-full" --certs-dir=certs
    ~~~

1. Enable the `kv.rangefeed.enabled` cluster setting on the **source** cluster:

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

- `immediate` (default): Attempts to replicate the changed row directly into the destination table, without re-running constraint validations. It does not support writing into tables with [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints.
- `validated`: Attempts to apply the write in a similar way to a user-run query, which would re-run all constraint validations relevant to the destination table(s). If the change violates foreign key dependencies, unique constraints, or other constraints, the row will be put in the [dead letter queue (DLQ)]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#dead-letter-queue-dlq) instead.

{{site.data.alerts.callout_info}}
If you would like to ignore TTL deletes in LDR, you can use the `discard = ttl-deletes` option in the `CREATE LOGICAL REPLICATION STREAM` statement. {% comment  %} Add link to the example for this on the create logical replication stream page + TTL once published. {% endcomment %}
{{site.data.alerts.end}}

1. From the **destination** cluster, start LDR. Use the fully qualified table name for the source and destination tables:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.source_table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.destination_table_name};
    ~~~

    You can change the default `mode` using the `WITH mode = validated` syntax.

    If you would like to add multiple tables to the LDR job, ensure that the table name in the source table list and destination table list are in the same order:

        {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLES ({database.public.source_table_name_1},{database.public.source_table_name_2},...)  ON 'external://{source_external_connection}' INTO TABLES ({database.public.destination_table_name_1},{database.public.destination_table_name_2},...);
    ~~~

    {{site.data.alerts.callout_info}}
    {% include {{ page.version.version }}/ldr/multiple-tables.md %}
    {{site.data.alerts.end}}

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

At this point, you've set up one LDR job from cluster A as the source to cluster B as the destination. To set up LDR streaming in the opposite direction, complete [Step 1](#step-1-prepare-the-cluster), [Step 2](#step-2-connect-from-the-destination-to-the-source), and [Step 3](#step-3-start-ldr) again. Cluster B will now be the source, and cluster A will be the destination.

## Step 5. Monitor the LDR jobs

In this step, you'll access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and monitor the status and metrics for the created LDR jobs. Depending on which cluster you would like to view, follow the instructions for either the source or destination.

{{site.data.alerts.callout_success}}
You can use the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), the SQL shell, [Metrics Export]({% link {{ page.version.version }}/datadog.md %}#enable-metrics-collection) with Prometheus and Datadog, and [labels with some LDR metrics]({% link {{ page.version.version }}/child-metrics.md %}) to monitor the job.
{{site.data.alerts.end}}

1. Access the DB Console at `http://{node IP or hostname}:8080` and enter your user's credentials.
1. On the source cluster, navigate to the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) to view a list of all jobs. Use the job **Type** dropdown and select **Replication Producer**. This will display the history retention job. This will run while the LDR job is active to protect changes to the table from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) until they have been replicated to the destination cluster.
1. On the destination cluster, use the job **Type** dropdown and select **Logical Replication Ingestion**. This page will display the logical replication stream job. There will be a progress bar in the **Status** column when LDR is replicating a table with existing data. This progress bar shows the status of the initial scan, which backfills the destination table with the existing data.
1. On the destination cluster, click on **Metrics** in the left-hand navigation menu. Use the **Dashboard** dropdown to select **Logical Data Replication**. This page shows graphs for monitoring LDR. 

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
1. Both modes
{% endcomment %}