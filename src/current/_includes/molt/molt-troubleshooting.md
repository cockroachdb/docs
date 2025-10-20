## Troubleshooting

{% if page.name != "migrate-resume-replication.md" %}
### Fetch issues

##### Fetch exits early due to mismatches

`molt fetch` exits early in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `true`:

- A source table is missing a primary key.
- A source primary key and target primary key have mismatching types.
- A [`STRING`]({% link {{site.current_cloud_version}}/string.md %}) primary key has a different [collation]({% link {{site.current_cloud_version}}/collate.md %}) on the source and target.
- A source and target column have mismatching types that are not [allowable mappings]({% link molt/molt-fetch.md %}#type-mapping).
- A target table is missing a column that is in the corresponding source table.
- A source column is nullable, but the corresponding target column is not nullable (i.e., the constraint is more strict on the target).

`molt fetch` can continue in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `false`:

- A target table has a column that is not in the corresponding source table.
- A source column has a `NOT NULL` constraint, and the corresponding target column is nullable (i.e., the constraint is less strict on the target).
- A [`DEFAULT`]({% link {{site.current_cloud_version}}/default-value.md %}), [`CHECK`]({% link {{site.current_cloud_version}}/check.md %}), [`FOREIGN KEY`]({% link {{site.current_cloud_version}}/foreign-key.md %}), or [`UNIQUE`]({% link {{site.current_cloud_version}}/unique.md %}) constraint is specified on a target column and not on the source column.

<section class="filter-content" markdown="1" data-scope="oracle">
##### ORA-01950: no privileges on tablespace

If you receive `ORA-01950: no privileges on tablespace 'USERS'`, it means the Oracle table owner (`migration_schema` in the preceding examples) does not have sufficient quota on the tablespace used to store its data. By default, this tablespace is `USERS`, but it can vary. To resolve this issue, grant a quota to the table owner. For example:

~~~ sql
-- change UNLIMITED to a suitable limit for the table owner
ALTER USER migration_schema QUOTA UNLIMITED ON USERS;
~~~

##### No tables to drop and recreate on target

When expecting a bulk load but seeing `no tables to drop and recreate on the target`, ensure the migration user has `SELECT` and `FLASHBACK` privileges on each table to be migrated. For example:

~~~ sql
GRANT SELECT, FLASHBACK ON migration_schema.employees TO C##MIGRATION_USER;
GRANT SELECT, FLASHBACK ON migration_schema.payments TO C##MIGRATION_USER;
GRANT SELECT, FLASHBACK ON migration_schema.orders TO C##MIGRATION_USER;
~~~

##### Table or view does not exist

If the Oracle migration user lacks privileges on certain tables, you may receive errors stating that the table or view does not exist. Either use `--table-filter` to {% if page.name == "migrate-resume-replication.md" %}[limit the tables to be migrated]({% link molt/migrate-load-replicate.md %}#schema-and-table-filtering){% else %}[limit the tables to be migrated](#schema-and-table-filtering){% endif %}, or grant the migration user `SELECT` privileges on all objects in the schema. Refer to {% if page.name == "migrate-resume-replication.md" %}[Create migration user on source database]({% link molt/migrate-load-replicate.md %}#create-migration-user-on-source-database){% else %}[Create migration user on source database](#create-migration-user-on-source-database){% endif %}.

{% if page.name != "migrate-bulk-load.md" %}
##### Missing redo logs or unavailable SCN

If the Oracle redo log files are too small or do not retain enough history, you may get errors indicating that required log files are missing for a given SCN range, or that a specific SCN is unavailable.

Increase the number and size of online redo log files, and verify that archived log files are being generated and retained correctly in your Oracle environment.

##### Missing replicator flags

If required `--replicator-flags` are missing, ensure that the necessary flags for your mode are included. For details, refer to [Replication flags](#replication-flags).

##### Replicator lag

If the `replicator` process is lagging significantly behind the current Oracle SCN, you may see log messages like: `replicator is catching up to the current SCN at 5000 from 1000…`. This indicates that replication is progressing but is still behind the most recent changes on the source database.
{% endif %}

##### Oracle sessions remain open after forcefully stopping `molt` or `replicator`

If you shut down `molt` or `replicator` unexpectedly (e.g., with `kill -9` or a system crash), Oracle sessions opened by these tools may remain active.

- Check your operating system for any running `molt` or `replicator` processes and terminate them manually.
- After confirming that both processes have stopped, ask a DBA to check for active Oracle sessions using:

    ~~~ sql
    SELECT sid, serial#, username, status, osuser, machine, program
    FROM v$session
    WHERE username = 'C##MIGRATION_USER';
    ~~~

    Wait until any remaining sessions display an `INACTIVE` status, then terminate them using:

    ~~~ sql
    ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;
    ~~~

    Replace `sid` and `serial#` in the preceding statement with the values returned by the `SELECT` query.
</section>
{% endif %}

{% if page.name != "migrate-bulk-load.md" %}
### Replicator issues

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

**Resolution:** {% if page.name == "migrate-resume-replication.md" %}[Create the publication]({% link molt/migrate-load-replicate.md %}#configure-source-database-for-replication){% else %}[Create the publication](#configure-source-database-for-replication){% endif %} on the source database. Ensure you also create the replication slot:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PUBLICATION molt_publication FOR ALL TABLES;
SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
~~~

##### Could not connect to PostgreSQL

~~~
could not connect to source database: failed to connect to `user=migration_user database=source_database`
~~~

**Resolution:** Verify the connection details including user, host, port, and database name. Ensure the database name in your `--sourceConn` connection string matches exactly where you created the publication and slot. Verify you're connecting to the same host and port where you ran the `CREATE PUBLICATION` and `SELECT pg_create_logical_replication_slot()` commands. Check if TLS certificates need to be included in the connection URI.

##### Wrong replication slot name

~~~
run SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput'); in source database
~~~

**Resolution:** {% if page.name == "migrate-resume-replication.md" %}[Create the replication slot]({% link molt/migrate-load-replicate.md %}#configure-source-database-for-replication){% else %}[Create the replication slot](#configure-source-database-for-replication){% endif %} or verify the correct slot name:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
~~~
</section>

{% if page.name == "migrate-resume-replication.md" %}
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

1. Increase binlog retention by configuring `binlog_expire_logs_seconds` in MySQL or through your cloud provider:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    -- Increase binlog retention (example: 7 days = 604800 seconds)
    SET GLOBAL binlog_expire_logs_seconds = 604800;
    ~~~

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

{% if page.name == "migrate-resume-replication.md" %}
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
- Long BLOB/CLOBs (4000+ characters)
- User-defined types (UDTs)
- Nested tables
- Varrays

**Resolution:** Convert unsupported data types or exclude affected tables from replication.

##### LOB column UPDATE statements

UPDATE statements that only modify LOB columns are not supported by Oracle LogMiner.

**Resolution:** Avoid LOB-only updates during replication, or use Binary Reader for Oracle 12c.

##### JSONB null handling

SQL NULL and JSON null values are not distinguishable in JSON payloads during replication.

**Resolution:** Avoid using nullable JSONB columns where the distinction between SQL NULL and JSON null is important.
</section>

##### Schema drift errors

Indicates source and target schemas are mismatched:

~~~
WARNING: schema drift detected in "database"."table" at payload object offset 0: unexpected columns: column_name
~~~

**Resolution:** Align schemas or use userscripts to transform data.

##### Apply flow failures

Apply flow failures occur when the target database encounters error conditions such as unique constraint violations, target database being unavailable, or incorrect data (missing or extraneous columns) during apply operations:

~~~
WARNING: warning during tryCommit: ERROR: duplicate key value violates unique constraint
ERROR: maximum number of retries (10) exceeded
~~~

**Resolution:** Check target database constraints and connection stability. MOLT Replicator will log warnings for each retry attempt. If you see warnings but no final error, the apply succeeded after retrying. If all retry attempts are exhausted, Replicator will surface a final error and restart the apply loop to continue processing.

##### CockroachDB changefeed connection issues

Connection errors when setting up changefeeds:

~~~
transient error: Post "https://localhost:30004/molt/public": dial tcp [::1]:30004: connect: connection refused
~~~

**Resolution:** Verify MOLT Replicator is running on the specified port and the webhook URL is correct.

##### Incorrect schema path errors

Schema path mismatches in changefeed URLs:

~~~
transient error: 400 Bad Request: unknown schema:
~~~

**Resolution:** Verify the webhook path matches your target database schema. Use `/database/schema` for CockroachDB/PostgreSQL targets and `/DATABASE` for MySQL/Oracle targets.

### Performance troubleshooting

If MOLT Replicator appears hung or performs poorly:

1. Enable trace logging with `-vv` to get more visibility into the replicator's state and behavior.

1. If MOLT Replicator is in an unknown, hung, or erroneous state, collect performance profiles to include with support tickets:

	{% include_cached copy-clipboard.html %}
	~~~shell
	curl 'localhost:30005/debug/pprof/trace?seconds=15' > trace.out
	curl 'localhost:30005/debug/pprof/profile?seconds=15' > profile.out
	curl 'localhost:30005/debug/pprof/goroutine?seconds=15' > gr.out
	curl 'localhost:30005/debug/pprof/heap?seconds=15' > heap.out
	~~~

1. Monitor lag metrics and adjust performance parameters as needed.
{% endif %}