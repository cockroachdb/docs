### Create migration user on source database

{% if page.source_db_not_selectable %}
{% else %}
<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>
{% endif %}

Create a dedicated migration user (for example, `MIGRATION_USER`) on the source database. This user is responsible for reading data from source tables during the migration. You will pass this username in the [source connection string](#source-connection-string).

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER migration_user WITH PASSWORD 'password';
~~~

Grant the user privileges to connect, view schema objects, and select the tables you migrate.

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT CONNECT ON DATABASE migration_db TO migration_user;
GRANT USAGE ON SCHEMA migration_schema TO migration_user;
GRANT SELECT ON ALL TABLES IN SCHEMA migration_schema TO migration_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA migration_schema GRANT SELECT ON TABLES TO migration_user;
~~~

{% if page.name contains "delta" %}
Grant the `SUPERUSER` role to the user (recommended for replication configuration):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER USER migration_user WITH SUPERUSER;
~~~

Alternatively, grant the following permissions to create replication slots, access replication data, create publications, and add tables to publications:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER USER migration_user WITH LOGIN REPLICATION;
GRANT CREATE ON DATABASE migration_db TO migration_user;
ALTER TABLE migration_schema.table_name OWNER TO migration_user;
~~~

Run the `ALTER TABLE` command for each table to replicate.
{% endif %}
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER 'migration_user'@'%' IDENTIFIED BY 'password';
~~~

Grant the user privileges to select the tables you migrate and access GTID information for snapshot consistency:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT ON migration_db.* TO 'migration_user'@'%';
GRANT SELECT ON mysql.gtid_executed TO 'migration_user'@'%';
FLUSH PRIVILEGES;
~~~

{% if page.name contains "delta" %}
For replication, grant additional privileges for binlog access:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'migration_user'@'%';
FLUSH PRIVILEGES;
~~~
{% endif %}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER MIGRATION_USER IDENTIFIED BY 'password';
~~~

{{site.data.alerts.callout_info}}
When migrating from Oracle Multitenant (PDB/CDB), this should be a [common user](https://docs.oracle.com/database/121/ADMQS/GUID-DA54EBE5-43EF-4B09-B8CC-FAABA335FBB8.htm). Prefix the username with `C##` (e.g., `C##MIGRATION_USER`).
{{site.data.alerts.end}}

Grant the user privileges to connect, read metadata, and `SELECT` and `FLASHBACK` the tables you plan to migrate. The tables should all reside in a single schema (for example, `migration_schema`). For details, refer to [Schema and table filtering](#schema-and-table-filtering).

#### Oracle Multitenant (PDB/CDB) user privileges

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

#### Single-tenant Oracle user privileges

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

{% if page.name contains "delta" %}
### Configure source database for replication

{% if page.source_db_not_selectable %}
{% else %}
<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>
{% endif %}

{{site.data.alerts.callout_info}}
Connect to the primary instance (PostgreSQL primary, MySQL primary/master, or Oracle primary), **not** a replica. Replicas cannot provide the necessary replication checkpoints and transaction metadata required for ongoing replication.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="postgres">
Verify that you are connected to the primary server:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pg_is_in_recovery();
~~~

You should get a false result:

~~~
 pg_is_in_recovery
-------------------
 f
~~~

Enable logical replication by setting `wal_level` to `logical` in `postgresql.conf` or in the SQL shell. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER SYSTEM SET wal_level = 'logical';
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Enable [global transaction identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) and configure binary logging. Set `binlog-row-metadata` or `binlog-row-image` to `full` to provide complete metadata for replication.

Configure binlog retention to ensure GTIDs remain available throughout the migration:

- MySQL 8.0.1+: Set `binlog_expire_logs_seconds` (default: 2592000 = 30 days) based on your migration timeline.
- MySQL < 8.0: Set `expire_logs_days`, or manually manage retention by setting `max_binlog_size` and using `PURGE BINARY LOGS BEFORE NOW() - INTERVAL 1 HOUR` (adjusting the interval as needed). Force binlog rotation with `FLUSH BINARY LOGS` if needed.
- Managed services: Refer to provider-specific configuration for [Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html) or [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql/flags#mysql-b).

{{site.data.alerts.callout_info}}
GTID replication sends all database changes to Replicator. To limit replication to specific tables or schemas, [apply a userscript](#replicator-flags) when you run Replicator. Refer to the [Filter multiple tables]({% link molt/userscript-cookbook.md %}#filter-multiple-tables) cookbook example.
{{site.data.alerts.end}}

|  Version   |                                                                                         Configuration                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MySQL 5.6  | `--gtid-mode=on`<br>`--enforce-gtid-consistency=on`<br>`--server-id={unique_id}`<br>`--log-bin=mysql-binlog`<br>`--binlog-format=row`<br>`--binlog-row-image=full`<br>`--log-slave-updates=ON` |
| MySQL 5.7  | `--gtid-mode=on`<br>`--enforce-gtid-consistency=on`<br>`--binlog-row-image=full`<br>`--server-id={unique_id}`<br>`--log-bin=log-bin`                                                           |
| MySQL 8.0+ | `--gtid-mode=on`<br>`--enforce-gtid-consistency=on`<br>`--binlog-row-metadata=full`                                                                                                            |
| MariaDB    | `--log-bin`<br>`--server_id={unique_id}`<br>`--log-basename=master1`<br>`--binlog-format=row`<br>`--binlog-row-metadata=full`                                                                  |
</section>

<section class="filter-content" markdown="1" data-scope="oracle">

#### Enable ARCHIVELOG and FORCE LOGGING

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
-- Enable minimal supplemental logging for primary keys
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;

-- Verify supplemental logging status
SELECT supplemental_log_data_min, supplemental_log_data_pk FROM v$database;
-- Expected:
--   SUPPLEMENTAL_LOG_DATA_MIN: IMPLICIT (or YES)
--   SUPPLEMENTAL_LOG_DATA_PK: YES
~~~

Enable `FORCE LOGGING` to ensure all changes are logged:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE FORCE LOGGING;

-- Verify FORCE LOGGING is enabled
SELECT force_logging FROM v$database; -- Expected: YES
~~~

#### Create source sentinel table

Create a checkpoint table called `REPLICATOR_SENTINEL` in the Oracle schema you will migrate:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE migration_schema."REPLICATOR_SENTINEL" (
  keycol NUMBER PRIMARY KEY,
  lastSCN NUMBER
);
~~~

Grant privileges to modify the checkpoint table. In Oracle Multitenant, grant the privileges on the PDB:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, UPDATE ON migration_schema."REPLICATOR_SENTINEL" TO C##MIGRATION_USER;
~~~

#### Grant LogMiner privileges

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
- Update the internal [`REPLICATOR_SENTINEL` table](#create-source-sentinel-table) created on the Oracle source schema by the DBA.

#### Verify LogMiner privileges

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