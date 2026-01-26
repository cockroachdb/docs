### Fetch issues

##### Fetch exits early due to mismatches

When run in `none` or `truncate-if-exists` mode, `molt fetch` exits early in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `true`:

- A source table is missing a primary key.
- A source primary key and target primary key have mismatching types.
    {{site.data.alerts.callout_success}}
    These restrictions (missing or mismatching primary keys) can be bypassed with [`--skip-pk-check`]({% link molt/molt-fetch.md %}#skip-primary-key-matching).
    {{site.data.alerts.end}}

- A [`STRING`]({% link {{site.current_cloud_version}}/string.md %}) primary key has a different [collation]({% link {{site.current_cloud_version}}/collate.md %}) on the source and target.
- A source and target column have mismatching types that are not [allowable mappings]({% link molt/molt-fetch.md %}#type-mapping).
- A target table is missing a column that is in the corresponding source table.
- A source column is nullable, but the corresponding target column is not nullable (i.e., the constraint is more strict on the target).

`molt fetch` can continue in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `false`:

- A target table has a column that is not in the corresponding source table.
- A source column has a `NOT NULL` constraint, and the corresponding target column is nullable (i.e., the constraint is less strict on the target).
- A [`DEFAULT`]({% link {{site.current_cloud_version}}/default-value.md %}), [`CHECK`]({% link {{site.current_cloud_version}}/check.md %}), [`FOREIGN KEY`]({% link {{site.current_cloud_version}}/foreign-key.md %}), or [`UNIQUE`]({% link {{site.current_cloud_version}}/unique.md %}) constraint is specified on a target column and not on the source column.

<section class="filter-content" markdown="1" data-scope="mysql">
##### Failed to export snapshot: no rows in result set

~~~
failed to export snapshot: please ensure that you have GTID-based replication enabled: sql: no rows in result set
~~~

This typically occurs on a new MySQL cluster that has not had any writes committed. The GTID set will not appear in `SHOW MASTER STATUS` until at least one transaction has been committed on the database.

**Resolution:** Execute a minimal transaction to initialize the GTID set:

{% include_cached copy-clipboard.html %}
~~~ sql
START TRANSACTION;
SELECT 1;
COMMIT;
~~~

Verify that the GTID set now appears:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW MASTER STATUS;
~~~

This should return a valid GTID value instead of an empty result.
</section>

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

If the Oracle migration user lacks privileges on certain tables, you may receive errors stating that the table or view does not exist. Either use `--table-filter` to {% if page.name == "migrate-load-replicate.md" or page.name == "delta-migration.md" %}[limit the tables to be migrated](#schema-and-table-filtering){% else %}[limit the tables to be migrated]({% link molt/delta-migration.md %}#schema-and-table-filtering){% endif %}, or grant the migration user `SELECT` privileges on all objects in the schema. Refer to {% if page.name == "migrate-load-replicate.md" or page.name == "delta-migration.md" %}[Create migration user on source database](#create-migration-user-on-source-database){% else %}[Create migration user on source database]({% link molt/delta-migration.md %}#create-migration-user-on-source-database){% endif %}.

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