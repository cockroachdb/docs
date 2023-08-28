---
title: Migrate and Replicate Data with Oracle GoldenGate
summary: Use GoldenGate to migrate data to a CockroachDB cluster.
toc: true
docs_area: migrate
---

[Oracle GoldenGate](https://www.oracle.com/integration/goldengate/) offers a managed service that can collect, replicate, and manage transactional data between databases. GoldenGate can use CockroachDB as a sink by leveraging CockroachDB's PostgreSQL-compatibility. This page describes how to:

- [Configure Oracle GoldenGate for CockroachDB](#configure-oracle-goldengate-for-cockroachdb)
- [Set up Extract](#set-up-extract)
- [Set up Replicat](#set-up-replicat)
- [Bulk replication](#bulk-replication)

As of this writing, GoldenGate supports the following database [sources](https://docs.oracle.com/en/middleware/goldengate/core/21.3/coredoc/configure-databases.html):

- MySQL
- Oracle
- PostgreSQL
- SQL Server
- Db2 z/OS

This page describes the GoldenGate functionality at a high level and assumes some familiarity with this tool. For detailed information, refer to the [Oracle GoldenGate documentation](https://docs.oracle.com/en/middleware/goldengate/core/21.3/index.html).

For limitations on what PostgreSQL and CockroachDB features are supported, refer to Oracle's [Details of Supported PostgreSQL Data Types](https://docs.oracle.com/en/middleware/goldengate/core/19.1/gghdb/understanding-whats-supported-postgresql.html).

## Before you begin

- Oracle GoldenGate runs as a process separate from CockroachDB and the source database. Ensure your host meets the [minimum requirements](https://docs.oracle.com/en/middleware/goldengate/core/21.3/installing/overview.html).

- Install the [Oracle for Postgres Libraries](https://www.oracle.com/middleware/technologies/goldengate-downloads.html) and ensure [libpg](https://www.postgresql.org/download/linux/redhat/) is available on the Oracle GoldenGate host:

- Ensure that you have an Oracle client installed that is compatible with the host Oracle version. This can be done by doing a full Oracle install, or just the client libraries.

- Ensure that you have the two required Oracle GoldenGate installations:

    1. [Oracle Golden Gate for Oracle](https://www.oracle.com/middleware/technologies/goldengate-downloads.html) is required to pull source data and route it to proper trail files.
    1. [Oracle Golden Gate for PostgreSQL](https://www.oracle.com/middleware/technologies/goldengate-downloads.html) is required to pull data from the trail files to CockroachD.

- For CockroachDB clusters running v22.1 and earlier, enable the following cluster settings:

    ~~~
    set cluster setting  sql.defaults.datestyle.enabled=true;
    set cluster setting sql.defaults.intervalstyle.enabled = true;
    ~~~

    For versions of CockroachDB v22.2 and later, these settings are already enabled by default.

- Ensure you have a secure, publicly available CockroachDB cluster running the latest **{{ page.version.version }}** [production release](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}), and have created a [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).

## Configure Oracle GoldenGate for CockroachDB

This section describes how to configure Oracle GoldenGate to treat CockroachDB as PostgreSQL. Note that this is discussing Oracle GoldenGate for PostgreSQL, the process that pulls data from trail files over to CockroachDB, which is a separate installation from Oracle GoldenGate for Oracle. For more information, refer to the [Oracle GoldenGate for PostgreSQL documentation](https://docs.oracle.com/en/middleware/goldengate/core/19.1/gghdb/preparing-database-oracle-goldengate-postgresql.htm). The examples below will use a [CockroachDB {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.html).

1. Set up the `ODBC.ini` file on Oracle GoldenGate host, and make sure your CockroachDB {{ site.data.products.serverless }} cluster's root cert is in the `TrustStore` path:

~~~
# This is needed so that all the Postgres libraries can be found
export LD_LIBRARY_PATH=/usr/pgsql-13/lib:/u01/ggs-pg/lib

# This is needed so that OGG knows where to look for connection details for the database
export ODBCINI=/etc/odbc.ini

vi /etc/odbc.ini

# Inside put this: replace the details for log in with your own. Be sure to prefix the database name with {hostname}.{db}
# No changes should be needed for CRDBLOCAL
[ODBC Data Sources]
PG_src=DataDirect 7.1 PostgreSQL Wire Protocol
PG_tgt=DataDirect 7.1 PostgreSQL Wire Protocol
CRDB=DataDirect 7.1 PostgreSQL Wire Protocol

[ODBC]
IANAAppCodePage=4
InstallDir=/u01/ggs-pg


[CRDBSERVERLESS]
Driver=/u01/ggs-pg/lib/GGpsql25.so
Description=DataDirect 7.1 PostgreSQL Wire Protocol
Database={host name}.defaultdb
HostName={host}
PortNumber=26257
LogonID={your sql user}
Password={your sql user's pass}
EncryptionMethod=1 
ValidateServerCertificate=1 
TrustStore=/root/.postgresql/root.crt
~~~

1. Ensure that all the PostgreSQL libraries are installed and referenced in the `LD_LIBRARY_PATH`. The path should at least include `/usr/pgsql-13/lib` and `/u01/ggs-pg/lib`.

1. Log in to the database:

~~~
sudo su -

cd /u01/ggs-pg
export LD_LIBRARY_PATH=/usr/pgsql-13/lib:/u01/ggs-pg/lib
export ODBCINI=/etc/odbc.ini

./ggsci

# To log into the local database
DBLOGIN SOURCEDB CRDBLOCAL

# To log into the serverless database and then enter your password
DBLOGIN SOURCEDB CRDBSERVERLESS
~~~

## Set up Extract

1. In a terminal:

~~~
# Setup the environment variables for the Oracle source, which includes the ORACLE_HOME, TNS_ADMIN, LD_LIBRARY_PATH, and ORACLE_SID

cd /u01/ggs # Otherwise known as $OGG_HOME
./ggsci

# Inside the ggsci terminal run these
edit param epos

view param epos

# This is the resulting output
# Note that RMTHOST is the server's internal host name: "hostname" command
# The MGRPORT is the port that the PostgreSQL GGSCI manager is running on (8200 as defined above)
# The USERIDALIAS is something I created with credential store, but you can use USERID {user}, PASSWORD {password}
# This section will run an extract on the source Oracle DB and then send that data over to the trail file at `./dirdat/ab` on the remote host.
EXTRACT epos
USERIDALIAS gg_source
RMTHOST {host-name}, MGRPORT {port}
RMTTRAIL ./dirdat/ab
TABLE OGGADM1.testtable;


# Back in the ./ggsci terminal
add extract epos, tranlog, begin now
add rmttrail ./dirdat/ab, extract epos megabytes 10

# This is crucial in order to address the logmining not found error
register EXTRACT epos, DATABASE

# Starts service
start epos
~~~

1. Check the status of the Extract by adding a row to `oggadm1.testtable`, committing it to the source, and running the following:

~~~
# CREATE TABLE IN ORACLE FIRST
create table OGGADM1.testtable (col1 number, col2 varchar2(20));
alter table OGGADM1.testtable add primary key (col1);


# IN ORACLE
INSERT INTO OGGADM1.testtable (col1, col2) VALUES (11, 'Example data');
COMMIT;


# IN GGSCI in another terminal
GGSCI (ip-172-31-0-218.ec2.internal as oggadm1@ORCL) 28> view param epos
EXTRACT epos
USERIDALIAS gg_source
RMTHOST ip-172-31-0-218.ec2.internal, MGRPORT 8200
RMTTRAIL ./dirdat/ab
TABLE OGGADM1.testtable;
~~~

You should see an output similar to the following:

~~~
Extracting from OGGADM1.TESTTABLE to OGGADM1.TESTTABLE:
*** Total statistics since 2023-06-09 19:06:44 ***
    Total inserts                              1.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           1.00
*** Daily statistics since 2023-06-09 19:06:44 ***
    Total inserts                              1.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           1.00
*** Hourly statistics since 2023-06-09 19:06:44 ***
    Total inserts                              1.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           1.00
*** Latest statistics since 2023-06-09 19:06:44 ***
    Total inserts                              1.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           1.00
End of statistics.
~~~

## Set up Replicat

Replicat is an Oracle process that delivers data to a target database.

1. First, make sure you can log into the database from `./ggsci`:

~~~
export LD_LIBRARY_PATH=/usr/pgsql-13/lib:/u01/ggs-pg/lib
export ODBCINI=/etc/odbc.ini

cd /u01/ggs-pg
./ggsci

# Log into the DB
DBLOGIN SOURCEDB CRDBLOCAL

# Run info all
GGSCI (ip-172-31-15-117.ec2.internal) 2> info all
Program     Status      Group       Lag at Chkpt  Time Since Chkpt
MANAGER     RUNNING                                           

# Then edit param file
edit param RORPSQL 
view param RORPSQL 

# This should be what the file looks like
# Just note that the MAP statement maps the source (oggadm1.testtable) to the target (public.testtable) and describes which columns map to what
REPLICAT RORPSQL
SETENV ( PGCLIENTENCODING = "UTF8" )
SETENV (ODBCINI="/etc/odbc.ini" )
SETENV (NLS_LANG="AMERICAN_AMERICA.AL32UTF8")
TARGETDB CRDBLOCAL
DISCARDFILE ./dirrpt/diskg.dsc, purge
MAP OGGADM1.testtable, TARGET public.testtable, COLMAP (COL1=col1,COL2=col2);


# Back in ./ggsci terminal
add replicat RORPSQL, NODBCHECKPOINT, exttrail ./dirdat/ab
start RORPSQL

# Done
Program     Status      Group       Lag at Chkpt  Time Since Chkpt
MANAGER     RUNNING                                           
REPLICAT    RUNNING     RORPSQL     00:00:00      00:00:09  
~~~

1. Test that Extract and Replicat are working properly:

~~~
# At the source ORACLE
SQL> INSERT INTO OGGADM1.testtable (col1, col2)
  2  VALUES (12, 'Example data');
1 row created.
SQL> COMMIT;
Commit complete.
SQL> 


# At the target CRDB
root@localhost:26257/defaultdb> SELECT * FROM public.testtable;
  col1 |     col2
-------+---------------
    12 | Example data
(1 row)
Time: 2ms total (execution 1ms / network 0ms)
root@localhost:26257/defaultdb> 

# In GGSCI for ORACLE
cd $OGG_HOME
./ggsci

GGSCI (ip-172-31-0-218.ec2.internal as oggadm1@ORCL) 30> stats EXTRACT EPOS
Sending STATS request to Extract group EPOS ...
Start of statistics at 2023-06-09 19:28:30.
Output to ./dirdat/ab:
Extracting from OGGADM1.TESTTABLE to OGGADM1.TESTTABLE:
*** Total statistics since 2023-06-09 19:06:44 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
*** Daily statistics since 2023-06-09 19:06:44 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
*** Hourly statistics since 2023-06-09 19:06:44 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
*** Latest statistics since 2023-06-09 19:06:44 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
End of statistics.
GGSCI (ip-172-31-0-218.ec2.internal as oggadm1@ORCL) 31>


# In GGSCI for PG
cd $OGG_PG_HOME
./ggsci
GGSCI (ip-172-31-0-218.ec2.internal) 7> stats REPLICAT RORPSQL
Sending STATS request to Replicat group RORPSQL ...
Start of statistics at 2023-06-09 19:29:03.
Replicating from OGGADM1.TESTTABLE to public.testtable:
*** Total statistics since 2023-06-09 19:10:20 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
*** Daily statistics since 2023-06-09 19:10:20 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
*** Hourly statistics since 2023-06-09 19:10:20 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
*** Latest statistics since 2023-06-09 19:10:20 ***
    Total inserts                              4.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                           4.00
End of statistics.
GGSCI (ip-172-31-0-218.ec2.internal) 8> 
~~~

## Bulk replication

1. Keep the [Extract process](#set-up-extract) running on Oracle and the [Replicat process](#set-up-replicat) running for PostgreSQL.
1. In the source database, bulk insert:

~~~
INSERT INTO OGGADM1.testtable2 (col1, col2)
SELECT level + 99, 'Example data'
FROM dual
CONNECT BY level <= 50000 - 99;
~~~

1. Run the status command on the Extract `ggsci` terminal.

You will see an output similar to the following:

~~~
GGSCI (ip-172-31-0-218.ec2.internal) 10> STATS EXTRACT EPOS2
Sending STATS request to Extract group EPOS2 ...
Start of statistics at 2023-06-09 21:09:06.
Output to ./dirdat/bb:
Extracting from OGGADM1.TESTTABLE2 to OGGADM1.TESTTABLE2:
*** Total statistics since 2023-06-09 21:02:39 ***
    Total inserts                          49903.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                       49903.00
*** Daily statistics since 2023-06-09 21:02:39 ***
    Total inserts                          49903.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                       49903.00
*** Hourly statistics since 2023-06-09 21:02:39 ***
    Total inserts                          49903.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                       49903.00
*** Latest statistics since 2023-06-09 21:02:39 ***
    Total inserts                          49903.00
    Total updates                              0.00
    Total deletes                              0.00
    Total upserts                              0.00
    Total discards                             0.00
    Total operations                       49903.00
End of statistics.
~~~

1. Run the status command on the Replicat `ggsci` terminal.

    You’ll notice that the number of inserts hasn’t updated yet. Wait a few minutes and you’ll see that it updates. The reason for this is that once it finishes inserting and committing to the database, it will report back the final inserts. During the process, it will show the previous state:

    ~~~
    GGSCI (ip-172-31-0-218.ec2.internal) 1> stats REPLICAT RORPSQL
    Sending STATS request to Replicat group RORPSQL ...
    Start of statistics at 2023-06-09 21:10:22.
    Replicating from OGGADM1.TESTTABLE2 to public.testtable:
    *** Total statistics since 2023-06-09 21:04:05 ***
        Total inserts                          49903.00
        Total updates                              0.00
        Total deletes                              0.00
        Total upserts                              0.00
        Total discards                             0.00
        Total operations                       49903.00
    *** Daily statistics since 2023-06-09 21:04:05 ***
        Total inserts                          49903.00
        Total updates                              0.00
        Total deletes                              0.00
        Total upserts                              0.00
        Total discards                             0.00
        Total operations                       49903.00
    *** Hourly statistics since 2023-06-09 21:04:05 ***
        Total inserts                          49903.00
        Total updates                              0.00
        Total deletes                              0.00
        Total upserts                              0.00
        Total discards                             0.00
        Total operations                       49903.00
    *** Latest statistics since 2023-06-09 21:04:05 ***
        Total inserts                          49903.00
        Total updates                              0.00
        Total deletes                              0.00
        Total upserts                              0.00
        Total discards                             0.00
        Total operations                       49903.00
    End of statistics.
    ~~~
    
To verify that the insert is happening, you can run: `SELECT COUNT(*) FROM public.testtable;`. The query should hang while it’s still inserting, which makes sense.

1. To see where the replication is processing while it's ongoing, view the report:
~~~
./ggsci

VIEW REPORT RORPSQL
~~~

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Third-Party Tools Supported by Cockroach Labs]({% link {{ page.version.version }}/third-party-database-tools.md %})
