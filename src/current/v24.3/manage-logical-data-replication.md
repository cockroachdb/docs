---
title: Manage Logical Data Replication
summary: Manage the tables that are part of the logical data replication stream.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

Once you have **logical data replication (LDR)** running, you will need to track and manage certain parts of the job:

- [Conflict resolution](#conflict-resolution): As changes to a table replicate from the source to the destination cluster, there can be conflicts during some operations that the job will handle with conflict resolution. When LDR is started, the job creates a [_dead letter queue (DLQ)_](#dead-letter-queue-dlq) table with each replicating table. LDR will send any unresolved conflicts to the DLQ, which you should monitor as LDR continues to replicate changes between the source and destination clusters. 
- [Schema changes](#schema-changes): The tables that are part of the LDR job may require schema changes, which need to be coordinated manually. There are some schema changes that are supported while LDR jobs are actively running.
- [Jobs](#jobs-and-ldr): [Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) and [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) can operate on clusters running LDR [jobs]({% link {{ page.version.version }}/show-jobs.md %}). You may want to consider where you start and how you manage [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}), [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}), [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}), and so on when you're running LDR.

## Conflict resolution

In LDR, conflicts are detected at both the [KV]({% link {{ page.version.version }}/architecture/storage-layer.md %}) and the [SQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}) level, which determines how LDR resolves the conflict.

### KV level conflicts

LDR uses _last write wins (LWW)_ conflict resolution based on the [MVCC timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) of the replicating write. LDR will resolve conflicts by inserting the row with the latest MVCC timestamp. Conflicts at the KV level are detected in both `immediate` and `validated` mode.

Conflicts at the KV level are detected when there is either:

- An `UPDATE` operation replicated to the destination cluster.
- A cross-cluster write occurs, which means both clusters are writing to the same key. For example, if the LDR stream attempts to apply a row to the destination cluster where the existing row on the destination was not written by the LDR stream.

### SQL level conflicts

In `validated` mode, when a conflict cannot apply due to violating [constraints]({% link {{ page.version.version }}/constraints.md %}), for example, a foreign key constraint or schema constraint, it will be retried for up to a minute and then put in the [DLQ](#dead-letter-queue-dlq) if it could not be resolved. 

### Dead letter queue (DLQ)

When the LDR job starts, it will create a DLQ table with each replicating table so that unresolved conflicts can be tracked. The DLQ will contain the writes that LDR cannot apply after the retry period, which could occur if:

- The destination table was dropped.
- The destination cluster is unavailable.
- Tables schemas do not match.

In `validated` mode, rows are also sent to the DLQ when:

- [Foreign key]({% link {{ page.version.version }}/foreign-key.md %}) dependencies are not met where there are foreign key constraints in the schema.
- Unique indexes and other constraints are not met.

{{site.data.alerts.callout_info}}
LDR will not pause when the writes are sent to the DLQ, you must manage the DLQ manually.
{{site.data.alerts.end}}

To manage the DLQ, you can evaluate entries in the `incoming_row` column and apply the row manually to another table with SQL statements.

As an example, for an LDR stream created on the `movr.public.promo_codes` table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~

The table will have a random number within its name to ensure it is unique.

~~~
    schema_name    |         table_name         | type  | owner | estimated_row_count | locality
-------------------+----------------------------+-------+-------+---------------------+-----------
  crdb_replication | dlq_113_public_promo_codes | table | node  |                 186 | NULL
  public           | promo_codes                | table | root  |                1047 | NULL
  public           | rides                      | table | root  |                 976 | NULL
  public           | user_promo_codes           | table | root  |                 134 | NULL
  public           | users                      | table | root  |                 424 | NULL
  public           | vehicle_location_histories | table | root  |               13012 | NULL
  public           | vehicles                   | table | root  |                 153 | NULL
(7 rows)
~~~

The schema for the `movr.crdb_replication.dlq_113_public_promo_codes` DLQ:

~~~sql
CREATE TABLE crdb_replication.dlq_113_public_promo_codes (
    id INT8 NOT NULL DEFAULT unique_rowid(),
    ingestion_job_id INT8 NOT NULL,
    table_id INT8 NOT NULL,
    dlq_timestamp TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    dlq_reason STRING NOT NULL,
    mutation_type crdb_replication.mutation_type NULL,
    key_value_bytes BYTES NOT VISIBLE NOT NULL,
    incoming_row JSONB NULL,
    crdb_internal_dlq_timestamp_id_ingestion_job_id_shard_16 INT8 NOT VISIBLE NOT NULL AS (mod(fnv32(md5(crdb_internal.datums_to_bytes(dlq_timestamp, id, ingestion_job_id))), 16:::INT8)) VIRTUAL,
CONSTRAINT dlq_113_public_promo_codes_pkey PRIMARY KEY (ingestion_job_id ASC, dlq_timestamp ASC, id ASC) USING HASH WITH (bucket_count=16)
)
~~~

## Schema changes

When you start LDR on a table, the job will lock the schema, which will prevent any accidental [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) that would cause issues for LDR. There are some [supported schema changes](#supported-schema-changes) that you can perform on a replicating table, otherwise it is necessary to stop LDR in order to [coordinate the schema change](#coordinate-other-schema-changes).

### Supported schema changes

There are some supported schema changes, which you can perform during LDR **without** restarting the job:

Allowlist schema change | Exceptions
-------------------+-----------
[`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %}) | <ul><li>[Hash-sharded indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %})</li><li>Indexes with a [computed column]({% link {{ page.version.version }}/computed-columns.md %})</li><li>[Partial indexes]({% link {{ page.version.version }}/partial-indexes.md %})</li><li>[Unique indexes]({% link {{ page.version.version }}/unique.md %})</li></ul>
[`DROP INDEX`]({% link {{ page.version.version }}/drop-index.md %}) | N/A
[Zone configuration]({% link {{ page.version.version }}/show-zone-configurations.md %}) changes | N/A
[`ALTER TABLE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone) | N/A
[`ALTER TABLE ... SET/RESET {TTL storage parameters}`]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters) | <ul><li>`ALTER TABLE SET (ttl_expire_after = "")`</li><li>`ALTER TABLE RESET (ttl_expire_after = "")`</li><li>`ALTER TABLE RESET (ttl)`</li></ul>

{{site.data.alerts.callout_danger}}
LDR will **not** replicate the allowlist schema changes to the destination table. Therefore, you must perform the schema change carefully on both the source and destination cluster.
{{site.data.alerts.end}}

### Coordinate other schema changes

To perform any other schema change on the table, use the following approach to redirect application traffic to one cluster. You'll need to drop the existing LDR jobs, perform the schema change, and start new LDR jobs, which will require a full initial scan.

If you are running LDR in a unidirectional setup, follow [Coordinate schema changes for unidirectional LDR](#coordinate-schema-changes-for-unidirectional-ldr).

#### Redirect application traffic to one cluster

You have a bidirectional LDR setup with a stream between cluster A to cluster B, and a stream between cluster B to cluster A.

1. Redirect your application traffic to one cluster, for example, cluster A. 
1. Wait for all traffic from cluster B to replicate to cluster A. Check this is complete with:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW LOGICAL REPLICATION JOBS WITH DETAILS;
    ~~~

    This is complete when `replicated_time` on cluster B surpasses the time at which you redirected application traffic, which indicates that all traffic from cluster B has been replicated to cluster A.

    ~~~
            job_id        |  status  |            targets             |        replicated_time        |    replication_start_time     | conflict_resolution_type |                                      description
    ----------------------+----------+--------------------------------+-------------------------------+-------------------------------+--------------------------+-----------------------------------------------------------------------------------------
    1010959260799270913 | running  | {movr.public.promo_codes}      | 2024-10-24 17:50:05+00        | 2024-10-10 20:04:42.196982+00 | LWW                      | LOGICAL REPLICATION STREAM into movr.public.promo_codes from external://cluster_a
    1014047902397333505 | canceled | {defaultdb.public.office_dogs} | 2024-10-24 17:30:25+00        | 2024-10-21 17:54:20.797643+00 | LWW                      | LOGICAL REPLICATION STREAM into defaultdb.public.office_dogs from external://cluster_a
    ~~~

1. Drop the LDR job on both clusters. Canceling the LDR streams will remove the history retention job, which will cause the data to be garbage collected according to the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) setting. Use [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CANCEL JOB {ldr_job_id};
    ~~~

1. Perform the schema change on cluster A. 
1. Drop the existing table from cluster B. 
1. Recreate the table and its new schema on cluster B. 
1. Create new LDR streams for the table on both clusters A and B. Run `CREATE LOGICAL REPLICATION STREAM` from the **destination** cluster for each stream:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name};
    ~~~

#### Coordinate schema changes for unidirectional LDR 

If you have a unidirectional LDR setup, you should cancel the running LDR stream and redirect all application traffic to the source cluster.

1. Drop the LDR job on the **destination** cluster. Canceling the LDR job will remove the history retention job, which will cause the data to be garbage collected according to the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) setting. Use [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CANCEL JOB {ldr_job_id};
    ~~~

1. Once the job has `canceled`, perform the required schema change on both the source and destination tables.
1. Start a new LDR job from the **destination** cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name};
    ~~~

## Jobs and LDR

You can run changefeed and backup [jobs]({% link {{ page.version.version }}/show-jobs.md %}) on any cluster that is involved in an LDR job. Both source and destination clusters in LDR are active, which means they can both serve production reads and writes as well as run [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) and [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}).

{{site.data.alerts.callout_success}}
You may want to run jobs like [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) from one cluster to isolate these jobs from the cluster receiving the principal application traffic. {% comment %} add link to ldr overview page that will describe this workload isolation topology {% endcomment %}
{{site.data.alerts.end}}

### Changefeeds

[Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) will emit [messages]({% link {{ page.version.version }}/changefeed-messages.md %}) for the writes that occur to the watched table. If the watched table is also the destination to which LDR is streaming, the changefeed will additionally emit messages for the writes from the LDR job. For example:

1. You create a changefeed watching the `test_table` on cluster A.
1. You start LDR from cluster A `test_table` replicating to cluster B's `test_table`. There are writes to `test_table` happening on both clusters. At this point, the changefeed is only emitting messages for cluster A (the source of the LDR job).
1. You start another LDR job from cluster B to cluster A to create bidirectional LDR. This second LDR job sends writes occurring on cluster B `test_table` into cluster A `test_table`. The changefeed on cluster A will now start emitting messages for both the writes occuring from application traffic in cluster A and also the writes incoming from LDR running from cluster B to cluster A.

### Backups

[Backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) can run on either cluster in an LDR stream. If you're backing up a table that is the destination table to which an LDR job is streaming, the backup will include writes that occur to the table from the LDR job. {% comment  %}To add: In a unidirectional setup, you may want to isolate your application workload from backup jobs (link to overview example).{% endcomment %} 

### TTL

If you're running [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) jobs, you may not want to include these deletes in LDR. You can ignore row-level TTL deletes in LDR with the [`ttl_disable_changefeed_replication` storage parameter]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters) set on the table in the source cluster. If you would like to ignore TTL deletes in LDR, you can use the `discard = ttl-deletes` option in the [`CREATE LOGICAL REPLICATION STREAM` statement]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#step-3-start-ldr).

{% comment  %} Add link to the example for this on the create logical replication stream page once published. {% endcomment %}

## See also

- [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %})

{% comment  %}Add more links as pages publish{% endcomment %}
