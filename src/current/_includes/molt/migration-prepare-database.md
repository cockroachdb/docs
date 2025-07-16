#### Create migration user on source database

Create a dedicated migration user (e.g., `MIGRATION_USER`) on the source database. This user is responsible for reading data from source tables during the migration. You will pass this username in the [source connection string](#source-connection-string).

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER migration_user WITH PASSWORD 'password';
~~~

Grant the user privileges to connect, view schema objects, and select the tables you migrate.

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT CONNECT ON DATABASE source_database TO MIGRATION_USER;
GRANT USAGE ON SCHEMA migration_schema TO MIGRATION_USER;
GRANT SELECT ON ALL TABLES IN SCHEMA migration_schema TO MIGRATION_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA migration_schema GRANT SELECT ON TABLES TO MIGRATION_USER;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER 'migration_user'@'%' IDENTIFIED BY 'password';
~~~

Grant the user privileges to select only the tables you migrate:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT ON source_database.* TO MIGRATION_USER@'%';
FLUSH PRIVILEGES;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER MIGRATION_USER IDENTIFIED BY 'password';
~~~

{{site.data.alerts.callout_info}}
When migrating from Oracle Multitenant (PDB/CDB), this should be a [common user](https://docs.oracle.com/database/121/ADMQS/GUID-DA54EBE5-43EF-4B09-B8CC-FAABA335FBB8.htm). Prefix the username with `C##` (e.g., `C##MIGRATION_USER`).
{{site.data.alerts.end}}

Grant the user privileges to connect, read metadata, and `SELECT` and `FLASHBACK` the tables you plan to migrate. The tables should all reside in a single schema (e.g., `migration_schema`). For details, refer to [Schema and table filtering](#schema-and-table-filtering).

##### Oracle Multitenant (PDB/CDB) user privileges

Connect to the Oracle CDB as a DBA and grant the following:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Basic access
GRANT CONNECT TO C##MIGRATION_USER;
GRANT CREATE SESSION TO C##MIGRATION_USER;

-- General metadata access
GRANT EXECUTE_CATALOG_ROLE TO C##MIGRATION_USER;
GRANT SELECT_CATALOG_ROLE TO C##MIGRATION_USER;

-- Access to necessary V$ views
GRANT SELECT ON V_$DATABASE TO C##MIGRATION_USER;

-- Direct grants to specific DBA views
GRANT SELECT ON ALL_USERS TO C##MIGRATION_USER;
GRANT SELECT ON DBA_USERS TO C##MIGRATION_USER;
GRANT SELECT ON DBA_OBJECTS TO C##MIGRATION_USER;
GRANT SELECT ON DBA_SYNONYMS TO C##MIGRATION_USER;
GRANT SELECT ON DBA_TABLES TO C##MIGRATION_USER;
~~~

Connect to the Oracle PDB (not the CDB) as a DBA and grant the following:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Allow C##MIGRATION_USER to connect to the PDB and see active transaction metadata
GRANT CONNECT TO C##MIGRATION_USER;
GRANT CREATE SESSION TO C##MIGRATION_USER;

-- General metadata access
GRANT SELECT_CATALOG_ROLE TO C##MIGRATION_USER;

-- Access to necessary V$ views
GRANT SELECT ON V_$SESSION TO C##MIGRATION_USER;
GRANT SELECT ON V_$TRANSACTION TO C##MIGRATION_USER;

-- Grant these two for every table to migrate in the migration_schema
GRANT SELECT, FLASHBACK ON migration_schema.tbl TO C##MIGRATION_USER;
~~~

##### Single-tenant Oracle user privileges

Connect to the Oracle database as a DBA and grant the following:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Basic access
GRANT CONNECT TO MIGRATION_USER;
GRANT CREATE SESSION TO MIGRATION_USER;

-- General metadata access
GRANT SELECT_CATALOG_ROLE TO MIGRATION_USER;
GRANT EXECUTE_CATALOG_ROLE TO MIGRATION_USER;

-- Access to necessary V$ views
GRANT SELECT ON V_$DATABASE TO MIGRATION_USER;
GRANT SELECT ON V_$SESSION TO MIGRATION_USER;
GRANT SELECT ON V_$TRANSACTION TO MIGRATION_USER;

-- Direct grants to specific DBA views
GRANT SELECT ON ALL_USERS TO MIGRATION_USER;
GRANT SELECT ON DBA_USERS TO MIGRATION_USER;
GRANT SELECT ON DBA_OBJECTS TO MIGRATION_USER;
GRANT SELECT ON DBA_SYNONYMS TO MIGRATION_USER;
GRANT SELECT ON DBA_TABLES TO MIGRATION_USER;

-- Grant these two for every table to migrate in the migration_schema
GRANT SELECT, FLASHBACK ON migration_schema.tbl TO MIGRATION_USER;
~~~
</section>

{% if page.name != "migrate-bulk-load.md" %}
#### Configure source database for replication

<section class="filter-content" markdown="1" data-scope="postgres">
Enable logical replication by setting `wal_level` to `logical` in `postgresql.conf` or in the SQL shell. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER SYSTEM SET wal_level = 'logical';
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For MySQL **8.0 and later** sources, enable [global transaction identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) consistency. Set the following values in `mysql.cnf`, in the SQL shell, or as flags in the `mysql` start command:

- `--enforce-gtid-consistency=ON`
- `--gtid-mode=ON`
- `--binlog-row-metadata=full`

For MySQL **5.7** sources, set the following values. Note that `binlog-row-image` is used instead of `binlog-row-metadata`. Set `server-id` to a unique integer that differs from any other MySQL server you have in your cluster (e.g., `3`).

- `--enforce-gtid-consistency=ON`
- `--gtid-mode=ON`
- `--binlog-row-image=full`
- `--server-id={ID}`
- `--log-bin=log-bin`
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
##### Create source sentinel table

Create a checkpoint table called `_replicator_sentinel` in the Oracle schema you will migrate:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE migration_schema."_replicator_sentinel" (
  keycol NUMBER PRIMARY KEY,
  lastSCN NUMBER
);
~~~

Grant privileges to modify the checkpoint table. In Oracle Multitenant, grant the privileges on the PDB:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, UPDATE ON migration_schema."_replicator_sentinel" TO C##MIGRATION_USER;
~~~

##### Grant LogMiner privileges

Grant LogMiner privileges. In Oracle Multitenant, grant the permissions on the CDB:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Access to necessary V$ views
GRANT SELECT ON V_$LOG TO C##MIGRATION_USER;
GRANT SELECT ON V_$LOGFILE TO C##MIGRATION_USER;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO C##MIGRATION_USER;
GRANT SELECT ON V_$ARCHIVED_LOG TO C##MIGRATION_USER;
GRANT SELECT ON V_$LOG_HISTORY TO C##MIGRATION_USER;

-- SYS-prefixed views (for full dictionary access)
GRANT SELECT ON SYS.V_$LOGMNR_DICTIONARY TO C##MIGRATION_USER;
GRANT SELECT ON SYS.V_$LOGMNR_LOGS TO C##MIGRATION_USER;
GRANT SELECT ON SYS.V_$LOGMNR_PARAMETERS TO C##MIGRATION_USER;
GRANT SELECT ON SYS.V_$LOGMNR_SESSION TO C##MIGRATION_USER;

-- Access to LogMiner views and controls
GRANT LOGMINING TO C##MIGRATION_USER;
GRANT EXECUTE ON DBMS_LOGMNR TO C##MIGRATION_USER;
~~~

The user must:

- Query [redo logs from LogMiner](#verify-logminer-privileges).
- Retrieve active transaction information to determine the starting point for ongoing replication.
- Update the internal [`_replicator_sentinel` table](#create-source-sentinel-table) created on the Oracle source schema by the DBA.

##### Verify LogMiner privileges

Query the locations of redo files in the Oracle database:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    l.GROUP#,
    lf.MEMBER,
    l.FIRST_CHANGE# AS START_SCN,
    l.NEXT_CHANGE# AS END_SCN
FROM
    V$LOG l
JOIN
    V$LOGFILE lf
ON
    l.GROUP# = lf.GROUP#;
~~~

~~~
   GROUP# MEMBER                                       START_SCN                END_SCN 
_________ _________________________________________ ____________ ______________________ 
        3 /opt/oracle/oradata/ORCLCDB/redo03.log         1232896    9295429630892703743 
        2 /opt/oracle/oradata/ORCLCDB/redo02.log         1155042                1232896 
        1 /opt/oracle/oradata/ORCLCDB/redo01.log         1141934                1155042 

3 rows selected.
~~~

Get the current snapshot System Change Number (SCN):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT CURRENT_SCN FROM V$DATABASE;
~~~

~~~
CURRENT_SCN
-----------
2358840

1 row selected.
~~~

Load the redo logs into LogMiner, replacing `{current-scn}` with the SCN you queried:

{% include_cached copy-clipboard.html %}
~~~ sql
EXEC DBMS_LOGMNR.START_LOGMNR(
  STARTSCN => {current-scn},
  ENDSCN   => 2358840,
  OPTIONS  => DBMS_LOGMNR.DICT_FROM_ONLINE_CATALOG
);
~~~

~~~
PL/SQL procedure successfully completed.
~~~

{{site.data.alerts.callout_success}}
If you receive `ORA-01435: user does not exist`, the Oracle user lacks sufficient LogMiner privileges. Refer to [Grant LogMiner privileges](#grant-logminer-privileges).
{{site.data.alerts.end}}
</section>
{% endif %}