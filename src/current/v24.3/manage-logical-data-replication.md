---
title: Manage Logical Data Replication
summary: Follow a tutorial to set up logical data replication between two clusters.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Once you have a **logical data replication (LDR)** stream running, it is necessary to monitor and manage the job. You will need to manage the following tasks:

- Conflicts: As changes to a table replicate from the source to the destination cluster, there can be [conflicts](#conflicts) during some operations. When an LDR stream is started, the LDR job creates a _dead letter queue (DLQ)_ table with each replicating table. The LDR job will send any unresolved conflicts to the DLQ, which you should monitor as the LDR stream continues to replicate changes between the source and destination clusters. 
- Schema changes: The tables that are part of the LDR job may require schema changes, which need to be coordinated.

## Conflicts

Conflicts in an LDR stream are detected when there is either:

- An `UPDATE` operation replicated to the destination cluster.
- A cross-cluster write occurs, which means both clusters are writing to the same key. For example, if the LDR stream attempts to apply a row to the destination cluster where the existing row on the destination was not written by the LDR stream.

LDR uses _last write wins (LWW)_ conflict resolution based on the [MVCC timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) of the replicating write. The LDR will resolve conflicts by inserting the row with the latest MVCC timestamp. When a conflict cannot apply, due to violating a foreign key constraint or schema constraint, it will be retried for up to a minute and then put in the [DLQ](#dead-letter-queue-dlq) if it could not be resolved. 

### Dead letter queue (DLQ)

When the LDR job starts, it will create a DLQ table with each replicating table so that writes or conflicts from multiple LDR streams can be managed with one DLQ table. The DLQ will contain the writes that the LDR job cannot apply after retry. 

To manage the DLQ, you can evaluate entries in the `incoming_rows` column and apply the row manually to another table with SQL statements.

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

When you start on a table, the job will lock the schema, which will prevent any accidental schema changes that would cause issues for the LDR stream. There are some [supported schema changes](#supported-schema-changes) that you can perform on a table that is part of an LDR stream, otherwise it is necessary to stop LDR in order to [coordinate the schema change](#coordinate-schema-changes).

### Supported schema changes

There are some "safe" schema changes that are part of an allow list, which you can perform during LDR:

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

    If you use the `cursor` option, the LDR job will **not** perform an initial scan, it will stream any changes after the given timestamp. The LDR job will encounter an error if you specify a timestamp with `cursor` that before the configured garbage collection window for that table. {% comment  %}to add links to the SQL ref page for create logical rep stream, once published, there will be a list of the available options{% endcomment %}

## Schema validation

{% comment  %}Adding to this page for now, but it should probably live on the `CREATE LOGICAL REPLICATION STREAM` page as it is about when users create a logical replication stream.{% endcomment %}
