---
title: Manage Logical Data Replication
summary: Manage the tables that are part of the logical data replication stream.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Once you have **logical data replication (LDR)** running, you will need to track and manage certain parts of the job:

- [Conflict resolution](#conflict-resolution): As changes to a table replicate from the source to the destination cluster, there can be conflicts during some operations that the job will handle with conflict resolution. When an LDR stream is started, the LDR job creates a [_dead letter queue (DLQ)_](#dead-letter-queue-dlq) table with each replicating table. The LDR job will send any unresolved conflicts to the DLQ, which you should monitor as the LDR stream continues to replicate changes between the source and destination clusters. 
- [Schema changes](#schema-changes): The tables that are part of the LDR job may require schema changes, which need to be coordinated. There are some schema changes that are supported while LDR is active.
- [Jobs](#jobs-and-ldr): Other CockroachDB jobs can operate on clusters running LDR [jobs]({% link {{ page.version.version }}/show-jobs.md %}). You may want to consider where you start and how you manage [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}), [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}), [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}), and so on when you're running LDR.

## Conflict resolution

Conflicts in an LDR stream are detected when there is either:

- An `UPDATE` operation replicated to the destination cluster.
- A cross-cluster write occurs, which means both clusters are writing to the same key. For example, if the LDR stream attempts to apply a row to the destination cluster where the existing row on the destination was not written by the LDR stream.

LDR uses _last write wins (LWW)_ conflict resolution based on the [MVCC timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) of the replicating write. The LDR will resolve conflicts by inserting the row with the latest MVCC timestamp. When a conflict cannot apply, due to violating a foreign key constraint or schema constraint, it will be retried for up to a minute and then put in the [DLQ](#dead-letter-queue-dlq) if it could not be resolved. 

### Dead letter queue (DLQ)

When the LDR job starts, it will create a DLQ table with each replicating table so that unresolved conflicts can be tracked. The DLQ will contain the writes that the LDR job cannot apply after the retry period. For example, [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) dependendies that are not met when there are foreign key constraints in the schema.

To manage the DLQ, you can evaluate entries in the `incoming_row` column and apply the row manually to another table with SQL statements.

As an example, for an LDR stream created on the `movr.public.promo_codes` table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~
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

When you start LDR on a table, the job will lock the schema, which will prevent any accidental schema changes that would cause issues for the LDR stream. There are some [supported schema changes](#supported-schema-changes) that you can perform on a table that is part of an LDR stream, otherwise it is necessary to stop LDR in order to [coordinate the schema change](#coordinate-schema-changes).

### Supported schema changes

There are some supported schema changes that are part of an allow list, which you can perform during LDR:

Allowlist schema change | Exceptions
-------------------+-----------
`CREATE INDEX` | <ul><li>Hash-sharded indexes</li><li>Indexes with a computed column</li><li>Partial indexes</li><ul>
`DROP INDEX` | N/A
Zone configuration changes | N/A
`ALTER TABLE ... SET/RESET {TTL storage parameters}` | `ttl_expire_after`

The LDR job will **not** replicate the allowlist schema changes to the destination table. Therefore, you must perform the schema change carefully on both the source and destination cluster.

### Coordinate schema changes

To perform any other schema change on the table, you'll need to drop the LDR job, perform the schema change on the table, and then start a new LDR job. You can use the `cursor` option when you create a new LDR job in order to start from a specific point in time and stream any changes after the given timestamp.

1. Drop the LDR job using [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CANCEL JOB {ldr_job_id};
    ~~~

1. Once the job has `canceled`, perform the required schema change on both the source and destination tables.

1. Start a new LDR job from the destination table. To start the LDR job from a specific point in time, you can use the `cursor` option to emit changes after the given timestamp:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name} WITH cursor='{timestamp}';
    ~~~

    If you use the `cursor` option, the LDR job will **not** perform an initial scan, it will stream any changes after the given timestamp. The LDR job will encounter an error if you specify a timestamp with `cursor` that before the configured garbage collection window for that table. {% comment %}to add links to the SQL ref page for create logical rep stream, once published {% endcomment %}

## Schema validation

Before you start an LDR stream, you must ensure that all column names, types, and constraints on the destination table match with the source table's columns.

You cannot use LDR on a table with a schema that contains the following:

- Columns with [user-defined types]({% link {{ page.version.version }}/create-type.md %})
- [Column families]({% link {{ page.version.version }}/column-families.md %})
- [Partial indexes]({% link {{ page.version.version }}/partial-indexes.md %})
- Indexes with a [computed column]({% link {{ page.version.version }}/computed-columns.md %})
- Composite types in the [primary key]({% link {{ page.version.version }}/primary-key.md %})
- [Unique indexes]({% link {{ page.version.version }}/unique.md %})

## Jobs and LDR

You can run any other CockroachDB [job]({% link {{ page.version.version }}/show-jobs.md %}) on any cluster that is involved in an LDR job. Both source and destination clusters in LDR are active, which means they can both serve production reads and writes as well as run [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}), [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}), and so on. 

{{site.data.alerts.callout_success}}
In a hot-cold setup with a unidirectional LDR stream flowing from the hot cluster to the cold, you may want to run jobs like changefeeds from the cold cluster to isolate these jobs from the hot cluster receiving application traffic. {% comment %} add link to ldr overview page that will describe this workload isolation topology {% endcomment %}
{{site.data.alerts.end}}

### Changefeeds

[Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) will emit [messages]({% link {{ page.version.version }}/changefeed-messages.md %}) for the writes that occur to the watched table. If the watched table is also the destination of an LDR stream, the changefeed will additionally emit messages for the writes from the LDR stream. For example:

1. You create a changefeed watching the `test_table` on cluster A.
1. You start LDR from cluster A `test_table` replicating to cluster B's `test_table`. There are writes to `test_table` happening on both clusters. At this point, the changefeed is only emitting messages for cluster A (the source of the LDR stream).
1. You start another LDR stream from cluster B to cluster A to create a bidirectional stream. This second LDR stream sends writes occurring on cluster B `test_table` into cluster A `test_table`. The changefeed on cluster A will now start emitting messages for both the writes occuring from application traffic in cluster A and also the writes incoming from the LDR stream running from cluster B to cluster A.

### TTL

If you're running [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) jobs, you may not want to include these deletes in the LDR stream. You can ignore row-level TTL deletes in LDR with the [`ttl_disable_changefeed_replication` storage parameter]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters) set on the table in the source cluster. If you would like to ignore TTL deletes in the LDR stream, you can use the `discard = ttl-deletes` option in the [`CREATE LOGICAL REPLICATION STREAM` statement]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#step-3-start-the-ldr-stream).

{% comment  %} Add link to the example for this on the create logical replication stream page once published. {% endcomment %}

## See also

- [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %})

{% comment  %}Add more links as pages publish{% endcomment %}
