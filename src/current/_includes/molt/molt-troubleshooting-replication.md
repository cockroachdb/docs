### Forward replication issues

##### Performance troubleshooting

If MOLT Replicator appears hung or performs poorly:

1. Enable trace logging with `-vv` to get more visibility into the replicator's state and behavior.

1. If MOLT Replicator is in an unknown, hung, or erroneous state, collect performance profiles to include with support tickets. Replace `{host}` and `{metrics-port}` with your Replicator host and the port specified by [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr):

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl '{host}:{metrics-port}/debug/pprof/trace?seconds=15' > trace.out
    curl '{host}:{metrics-port}/debug/pprof/profile?seconds=15' > profile.out
    curl '{host}:{metrics-port}/debug/pprof/goroutine?seconds=15' > gr.out
    curl '{host}:{metrics-port}/debug/pprof/heap?seconds=15' > heap.out
    ~~~

1. Monitor lag metrics and adjust performance parameters as needed.

<section class="filter-content" markdown="1" data-scope="postgres">
##### Unable to create publication or slot

This error occurs when logical replication is not supported.

**Resolution:** If you are connected to a replica, connect to the primary instance instead. Replicas cannot create or manage logical replication slots or publications.

Verify that the source database supports logical replication by checking the `wal_level` parameter on PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW wal_level;
~~~

If `wal_level` is not set to `logical`, update it and restart PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER SYSTEM SET wal_level = 'logical';
~~~

##### Replication slot already exists

~~~
ERROR: replication slot "molt_slot" already exists
~~~

**Resolution:** Either create a new slot with a different name, or drop the existing slot to start fresh:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pg_drop_replication_slot('molt_slot');
~~~

{{site.data.alerts.callout_danger}}
Dropping a replication slot can be destructive and delete data that is not yet replicated. Only use this if you want to restart replication from the current position.
{{site.data.alerts.end}}

##### Publication does not exist

~~~
run CREATE PUBLICATION molt_fetch FOR ALL TABLES;
~~~

**Resolution:** Create the publication on the source database. Ensure you also create the replication slot:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PUBLICATION molt_publication FOR ALL TABLES;
SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
~~~

##### Could not connect to PostgreSQL

~~~
could not connect to source database: failed to connect to `user=migration_user database=migration_db`
~~~

**Resolution:** Verify the connection details including user, host, port, and database name. Ensure the database name in your `--sourceConn` connection string matches exactly where you created the publication and slot. Verify you're connecting to the same host and port where you ran the `CREATE PUBLICATION` and `SELECT pg_create_logical_replication_slot()` commands. Check if TLS certificates need to be included in the connection URI.

##### Wrong replication slot name

~~~
run SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput'); in source database
~~~

**Resolution:** {% if page.name contains "delta" %}[Create the replication slot](#configure-source-database-for-replication){% else %}[Create the replication slot]({% link molt/delta-migration-postgres.md %}#configure-source-database-for-replication){% endif %} or verify the correct slot name:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
~~~
</section>

{% if page.name contains "delta" %}
##### Resuming from stale location

<section class="filter-content" markdown="1" data-scope="postgres">
For PostgreSQL, the replication slot on the source database tracks progress automatically. Clearing the memo table is only necessary if the replication slot was destroyed and you need to restart replication from a specific LSN.

**Resolution:** Clear the `_replicator.memo` table:
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
**Resolution:** Clear the `_replicator.memo` table to remove stale GTID checkpoints:
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
**Resolution:** Clear the `_replicator.memo` table to remove stale SCN (System Change Number) checkpoints:
</section>

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM _replicator.memo WHERE true;
~~~
{% endif %}

<section class="filter-content" markdown="1" data-scope="mysql">
##### Repeated binlog syncing restarts

If Replicator repeatedly restarts binlog syncing or starts replication from an unexpectedly old location, this indicates an invalid or purged GTID. When an invalid GTID is provided, the binlog syncer will fall back to the first valid GTID.

**Resolution:** Verify the GTID set is valid and **not** purged:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Check if GTID is in executed set
SELECT GTID_SUBSET('your-gtid-set', @@GLOBAL.gtid_executed) AS in_executed;

-- Check if GTID is purged
SELECT GTID_SUBSET('your-gtid-set', @@GLOBAL.gtid_purged) AS in_purged;
~~~

Interpret the results as follows:

- If `in_executed` returns `1` and `in_purged` returns `0`, the GTID is valid for replication.
- If `in_purged` returns `1`, the GTID has been purged and you must find a newer consistent point.
- If both return `0`, the GTID doesn't exist in the records and is invalid.

If the GTID is purged or invalid, follow these steps:

1. Increase binlog retention by configuring `binlog_expire_logs_seconds` in MySQL:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    -- Increase binlog retention (example: 7 days = 604800 seconds)
    SET GLOBAL binlog_expire_logs_seconds = 604800;
    ~~~

    {{site.data.alerts.callout_info}}
    For managed MySQL services (such as Amazon RDS, Google Cloud SQL, or Azure Database for MySQL), binlog retention is typically configured through the provider's console or CLI. Consult your provider's documentation for how to adjust binlog retention settings.
    {{site.data.alerts.end}}

1. Get a current GTID set to restart replication:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    -- For MySQL < 8.0:
    SHOW MASTER STATUS;
    -- For MySQL 8.0+:
    SHOW BINARY LOG STATUS;
    ~~~

    ~~~
    +---------------+----------+--------------+------------------+-------------------------------------------+
    | File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set                         |
    +---------------+----------+--------------+------------------+-------------------------------------------+
    | binlog.000005 |      197 |              |                  | 77263736-7899-11f0-81a5-0242ac120002:1-38 |
    +---------------+----------+--------------+------------------+-------------------------------------------+
    ~~~

    Use the `Executed_Gtid_Set` value for the `--defaultGTIDSet` flag.

##### Invalid GTID format

Invalid GTIDs can occur when GTIDs are purged due to insufficient binlog retention, when connecting to a replica instead of the primary host, or when passing a GTID that has valid format but doesn't exist in the binlog history.

**Resolution:** Use a valid GTID from `SHOW MASTER STATUS` (MySQL < 8.0) or `SHOW BINARY LOG STATUS` (MySQL 8.0+) and ensure you're connecting to the primary host. If GTIDs are being purged, increase binlog retention.

{% if page.name contains "delta" %}
##### Stale GTID from cache

**Resolution:** Clear the `_replicator` database memo table:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM _replicator.memo WHERE true;
~~~
{% endif %}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
##### Table/column names exceed 30 characters

Oracle LogMiner excludes tables and columns with names longer than 30 characters from redo logs.

**Resolution:** Rename tables and columns to 30 characters or fewer before migration.

##### Unsupported data types

LogMiner and replication do not support:

- Long `BLOB`/`CLOB`s (4000+ characters)
- User-defined types (UDTs)
- Nested tables
- Varrays
- `GEOGRAPHY` and `GEOMETRY`

**Resolution:** Convert unsupported data types or exclude affected tables from replication.

##### LOB column UPDATE statements

UPDATE statements that only modify LOB columns are not supported by Oracle LogMiner.

**Resolution:** Avoid LOB-only updates during replication, or use Binary Reader for Oracle 12c.

##### JSONB null handling

SQL NULL and JSON null values are not distinguishable in JSON payloads during replication.

**Resolution:** Avoid using nullable JSONB columns where the distinction between SQL NULL and JSON null is important.

##### Missing redo logs or unavailable SCN

If the Oracle redo log files are too small or do not retain enough history, you may get errors indicating that required log files are missing for a given SCN range, or that a specific SCN is unavailable.

**Resolution:** Increase the number and size of online redo log files, and verify that archived log files are being generated and retained correctly in your Oracle environment.

##### Replicator lag

If the `replicator` process is lagging significantly behind the current Oracle SCN, you may see log messages like: `replicator is catching up to the current SCN at 5000 from 1000…`. This indicates that replication is progressing but is still behind the most recent changes on the source database.
</section>

##### Schema drift errors

Indicates source and target schemas are mismatched:

~~~
WARNING: schema drift detected in "database"."table" at payload object offset 0: unexpected columns: column_name
~~~

**Resolution:** Align schemas or [use userscripts to transform data]({% link molt/userscript-cookbook.md %}#filter-columns).

##### Apply flow failures

Apply flow failures occur when the target database encounters error conditions such as unique constraint violations, target database being unavailable, or incorrect data (missing or extraneous columns) during apply operations:

~~~
WARNING: warning during tryCommit: ERROR: duplicate key value violates unique constraint
ERROR: maximum number of retries (10) exceeded
~~~

**Resolution:** Check target database constraints and connection stability. MOLT Replicator will log warnings for each retry attempt. If you see warnings but no final error, the apply succeeded after retrying. If all retry attempts are exhausted, Replicator will surface a final error and restart the apply loop to continue processing.