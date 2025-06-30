<section class="filter-content" markdown="1" data-scope="oracle">
## Prerequisites

#### Oracle Instant Client

Install Oracle Instant Client on the machine that will run `molt` and `replicator`:

- On macOS ARM machines, download the [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/macos-arm64-downloads.html#ic_osx_inst). After installation, you should have a new directory at `/Users/$USER/Downloads/instantclient_23_3` containing `.dylib` files. Set the `LD_LIBRARY_PATH` environment variable to this directory:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	export LD_LIBRARY_PATH=/Users/$USER/Downloads/instantclient_23_3
	~~~

- On Linux machines, install the Oracle Instant Client dependencies and set the `LD_LIBRARY_PATH` to the client library path:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	sudo apt-get install -yqq --no-install-recommends libaio1t64
	sudo ln -s /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1
	curl -o /tmp/ora-libs.zip https://replicator.cockroachdb.com/third_party/instantclient-basiclite-linux-amd64.zip
	unzip -d /tmp /tmp/ora-libs.zip
	sudo mv /tmp/instantclient_21_13/* /usr/lib
	export LD_LIBRARY_PATH=/usr/lib
	~~~

#### Enable `ARCHIVELOG`

Enable `ARCHIVELOG` mode on the Oracle database. This is required for Oracle LogMiner, Oracle's built-in changefeed tool that captures DML events for replication. If you do **not** plan to use replication, you can skip this section.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT log_mode FROM v$database;
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;
SELECT log_mode FROM v$database;
~~~

~~~
LOG_MODE
--------
ARCHIVELOG

1 row selected.
~~~

Enable supplemental primary key logging for logical replication:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
SELECT supplemental_log_data_min, supplemental_log_data_pk FROM v$database;
~~~

~~~
SUPPLEMENTAL_LOG_DATA_MIN SUPPLEMENTAL_LOG_DATA_PK
------------------------- ------------------------
IMPLICIT                  YES

1 row selected.
~~~

#### Ensure Oracle user privileges for LogMiner

Ensure the Oracle user you will use for source replication has LogMiner privileges and access to redo logs before starting replication. If you do **not** plan to use replication, you can skip this section.

Query the locations of redo files in the Oracle database:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT l.GROUP#, lf.MEMBER, l.FIRST_CHANGE# AS START_SCN, l.NEXT_CHANGE# AS END_SCN 
FROM V$LOG l
JOIN V$LOGFILE lf
ON l.GROUP# = lf.GROUP#;
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

If you receive `ORA-01435: user does not exist`, the Oracle user lacks LogMiner privileges.
You can skip LogMiner setup if you are not using replication.

Ensure the Oracle source user has the following privileges on the PDB schema:

- `CREATE TABLE`, `INSERT`, and `UPDATE` (for initial data load and staging).
- `FLASHBACK` (enables LogMiner to read archived redo logs).
</section>