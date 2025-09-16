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
GRANT SELECT ON V_$LOG TO C##MIGRATION_USER;
GRANT SELECT ON V_$LOGFILE TO C##MIGRATION_USER;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO C##MIGRATION_USER;
GRANT SELECT ON V_$ARCHIVED_LOG TO C##MIGRATION_USER;
GRANT SELECT ON V_$DATABASE TO C##MIGRATION_USER;
GRANT SELECT ON V_$LOG_HISTORY TO C##MIGRATION_USER;

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
{{site.data.alerts.callout_info}}
Connect to the primary PostgreSQL instance, **not** a read replica. Read replicas cannot create or manage logical replication slots. Verify that you are connected to the primary server by running `SELECT pg_is_in_recovery();` and getting a `false` result.
{{site.data.alerts.end}}

Enable logical replication by setting `wal_level` to `logical` in `postgresql.conf` or in the SQL shell. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER SYSTEM SET wal_level = 'logical';
~~~

Create a publication for the tables you want to replicate. Do this **before** creating the replication slot. 

To create a publication for all tables:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PUBLICATION molt_publication FOR ALL TABLES;
~~~

To create a publication for specific tables:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PUBLICATION molt_publication FOR TABLE employees, payments, orders;
~~~

Create a logical replication slot:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
~~~

##### Verify logical replication setup

Verify the publication was created successfully:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM pg_publication;
~~~

~~~
  oid  |     pubname      | pubowner | puballtables | pubinsert | pubupdate | pubdelete | pubtruncate | pubviaroot
-------+------------------+----------+--------------+-----------+-----------+-----------+-------------+------------
 59084 | molt_publication |       10 | t            | t         | t         | t         | t           | f
~~~

Verify the replication slot was created:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM pg_replication_slots;
~~~

~~~
 slot_name |  plugin  | slot_type | datoid | database | temporary | active | active_pid | xmin | catalog_xmin | restart_lsn | confirmed_flush_lsn | wal_status | safe_wal_size | two_phase
-----------+----------+-----------+--------+----------+-----------+--------+------------+------+--------------+-------------+---------------------+------------+---------------+-----------
 molt_slot | pgoutput | logical   |  16385 | molt     | f         | f      |            |      |         2261 | 0/49913A20  | 0/49913A58          | reserved   |               | f
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Enable [global transaction identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) and configure binary logging. Set `binlog-row-metadata` or `binlog-row-image` to `full` to provide complete metadata for replication.

{{site.data.alerts.callout_info}}
GTID replication sends all database changes to Replicator. To limit replication to specific tables or schemas, use the `--table-filter` and `--schema-filter` flags in the `replicator` command.
{{site.data.alerts.end}}

|  Version   |                                                                                         Configuration                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MySQL 5.6  | `--gtid-mode=on`<br>`--enforce-gtid-consistency=on`<br>`--server-id={unique_id}`<br>`--log-bin=mysql-binlog`<br>`--binlog-format=row`<br>`--binlog-row-image=full`<br>`--log-slave-updates=ON` |
| MySQL 5.7  | `--gtid-mode=on`<br>`--enforce-gtid-consistency=on`<br>`--binlog-row-image=full`<br>`--server-id={unique_id}`<br>`--log-bin=log-bin`                                                           |
| MySQL 8.0+ | `--gtid-mode=on`<br>`--enforce-gtid-consistency=on`<br>`--binlog-row-metadata=full`                                                                                                            |
| MariaDB    | `--log-bin`<br>`--server_id={unique_id}`<br>`--log-basename=master1`<br>`--binlog-format=row`<br>`--binlog-row-metadata=full`                                                                  |

##### Verify MySQL GTID setup

Get the current GTID set to use as the starting point for replication:

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

Use the `Executed_Gtid_Set` value for the `--defaultGTIDSet` flag in MOLT Replicator.

To verify that a GTID set is valid and not purged, use the following queries:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Verify the GTID set is in the executed set
SELECT GTID_SUBSET('77263736-7899-11f0-81a5-0242ac120002:1-38', @@GLOBAL.gtid_executed) AS in_executed;

-- Verify the GTID set is not in the purged set
SELECT GTID_SUBSET('77263736-7899-11f0-81a5-0242ac120002:1-38', @@GLOBAL.gtid_purged) AS in_purged;
~~~

If `in_executed` returns `1` and `in_purged` returns `0`, the GTID set is valid for replication.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
##### Enable ARCHIVELOG and FORCE LOGGING

Enable `ARCHIVELOG` mode for LogMiner to access archived redo logs:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Check current log mode
SELECT log_mode FROM v$database;

-- Enable ARCHIVELOG (requires database restart)
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;

-- Verify ARCHIVELOG is enabled
SELECT log_mode FROM v$database; -- Expected: ARCHIVELOG
~~~

Enable supplemental logging for primary keys:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;

-- Verify supplemental logging
SELECT supplemental_log_data_min, supplemental_log_data_pk FROM v$database;
-- Expected: SUPPLEMENTAL_LOG_DATA_MIN: IMPLICIT (or YES), SUPPLEMENTAL_LOG_DATA_PK: YES
~~~

Enable `FORCE LOGGING` to ensure all changes are logged:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE FORCE LOGGING;

-- Verify FORCE LOGGING is enabled
SELECT force_logging FROM v$database; -- Expected: YES
~~~

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

##### Get SCNs for replication startup

If you plan to use [initial data load](#start-fetch) followed by [replication](#start-replicator), obtain the correct SCNs **before** starting the initial data load to ensure no active transactions are missed. Run the following queries on the PDB in the order shown:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Query the current SCN from Oracle
SELECT CURRENT_SCN FROM V$DATABASE;

-- Query the starting SCN of the earliest active transaction
SELECT MIN(t.START_SCNB) FROM V$TRANSACTION t;
~~~

Use the results as follows:

- `--scn`: Use the result from the first query (current SCN)
- `--backfillFromSCN`: Use the result from the second query (earliest active transaction SCN). If the second query returns no results, use the result from the first query instead.

Add the redo log files to LogMiner, using the redo log file paths you queried:

{% include_cached copy-clipboard.html %}
~~~ sql
EXEC DBMS_LOGMNR.ADD_LOGFILE(LOGFILENAME => '/opt/oracle/oradata/ORCLCDB/redo01.log', OPTIONS => DBMS_LOGMNR.NEW);
EXEC DBMS_LOGMNR.ADD_LOGFILE(LOGFILENAME => '/opt/oracle/oradata/ORCLCDB/redo02.log', OPTIONS => DBMS_LOGMNR.ADDFILE);
EXEC DBMS_LOGMNR.ADD_LOGFILE(LOGFILENAME => '/opt/oracle/oradata/ORCLCDB/redo03.log', OPTIONS => DBMS_LOGMNR.ADDFILE);
~~~

Start LogMiner, specifying the SCN you queried:

{% include_cached copy-clipboard.html %}
~~~ sql
EXEC DBMS_LOGMNR.START_LOGMNR(
  STARTSCN => 2358840,
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