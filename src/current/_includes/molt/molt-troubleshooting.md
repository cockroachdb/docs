## Troubleshooting

##### Fetch exits early due to mismatches

`molt fetch` exits early in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `true`:

- A source table is missing a primary key.
- A source and table primary key have mismatching types.
- A [`STRING`]({% link {{site.current_cloud_version}}/string.md %}) primary key has a different [collation]({% link {{site.current_cloud_version}}/collate.md %}) on the source and target.
- A source and target column have mismatching types that are not [allowable mappings](#type-mapping).
- A target table is missing a column that is in the corresponding source table.
- A source column is nullable, but the corresponding target column is not nullable (i.e., the constraint is more strict on the target).

`molt fetch` can continue in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `false`:

- A target table has a column that is not in the corresponding source table.
- A source column has a `NOT NULL` constraint, and the corresponding target column is nullable (i.e., the constraint is less strict on the target).
- A [`DEFAULT`]({% link {{site.current_cloud_version}}/default-value.md %}), [`CHECK`]({% link {{site.current_cloud_version}}/check.md %}), [`FOREIGN KEY`]({% link {{site.current_cloud_version}}/foreign-key.md %}), or [`UNIQUE`]({% link {{site.current_cloud_version}}/unique.md %}) constraint is specified on a target column and not on the source column.

<section class="filter-content" markdown="1" data-scope="oracle">
##### ORA-01950: no privileges on tablespace

If you receive `ORA-01950: no privileges on tablespace 'USERS'`, the Oracle migration user does not have sufficient quota on the tablespace used to store its values (by default, this is `USERS`, but can vary). Grant a quota to the schema. For example:

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

If the Oracle migration user lacks privileges on certain tables, you may receive errors stating that the table or view does not exist. Either use `--table-filter` to [limit the tables to be migrated](#schema-and-table-filtering), or grant the migration user `SELECT` privileges on all objects in the schema. Refer to [Create migration user on source database](#create-migration-user-on-source-database).

{% if page.name != "migration-bulk-load.md" %}
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
- Once both processes are confirmed stopped, ask a DBA to check for lingering Oracle sessions with:

    ~~~ sql
    SELECT sid, serial#, username, status, osuser, machine, program
    FROM v$session
    WHERE username = 'C##CDB_USER';
    ~~~

    Wait for any remaining sessions to show an `INACTIVE` status, then terminate them using:

    ~~~ sql
    ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;
    ~~~
</section>