---
title: Migrate and Replicate Data with Oracle GoldenGate
summary: Use GoldenGate to migrate data to a CockroachDB cluster.
toc: true
docs_area: migrate
---

[Oracle GoldenGate](https://www.oracle.com/integration/goldengate/) is a managed service that can collect, replicate, and manage transactional data between databases. GoldenGate can use CockroachDB as a sink by leveraging CockroachDB's PostgreSQL compatibility. This page describes how to:

- [Configure Oracle GoldenGate for PostgreSQL](#configure-oracle-goldengate-for-postgresql).
- [Set up Extract to capture data from a source database](#set-up-extract-to-capture-data-from-a-source-database).
- [Set up Replicat to deliver data to CockroachDB](#set-up-replicat-to-deliver-data-to-cockroachdb).
- [Perform bulk replication](#perform-bulk-replication).

As of this writing, GoldenGate supports the following database [sources](https://docs.oracle.com/en/middleware/goldengate/core/21.3/coredoc/configure-databases.html):

- MySQL
- Oracle
- PostgreSQL
- SQL Server
- Db2 z/OS

This page describes GoldenGate at a high level and assumes some familiarity with this tool. For detailed information, refer to the [Oracle GoldenGate documentation](https://docs.oracle.com/en/middleware/goldengate/core/21.3/index.html).

For limitations on what PostgreSQL features are supported, refer to Oracle's [Details of Supported PostgreSQL Data Types](https://docs.oracle.com/en/middleware/goldengate/core/19.1/gghdb/understanding-whats-supported-postgresql.html).

## Before you begin

- Oracle GoldenGate runs as a process separate from CockroachDB and the source database. Ensure your host meets the [minimum requirements](https://docs.oracle.com/en/middleware/goldengate/core/21.3/installing/overview.html).

- Ensure that your Oracle client or client libraries are compatible with the host Oracle version.

- Ensure that you have installed both required Oracle GoldenGate components:
    1. [Oracle GoldenGate for Oracle](https://www.oracle.com/middleware/technologies/goldengate-downloads.html) is required to pull source data and route it to proper [trail files](https://docs.oracle.com/goldengate/c1230/gg-winux/GGCON/processes-and-terminology.html).
    1. [Oracle GoldenGate for PostgreSQL](https://www.oracle.com/middleware/technologies/goldengate-downloads.html) is required to pull data from the trail files to CockroachDB.
- For CockroachDB clusters running v22.1 and earlier, enable the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING sql.defaults.datestyle.enabled = true;
    SET CLUSTER SETTING sql.defaults.intervalstyle.enabled = true;
    ~~~

    For CockroachDB v22.2 and later, these settings are enabled by default.

- Ensure [libpg](https://www.postgresql.org/download/linux/redhat/) is available on the Oracle GoldenGate host.

- Ensure you have a secure, [publicly available]({% link cockroachcloud/network-authorization.md %}) CockroachDB cluster running the latest **{{ page.version.version }}** [production release]({% link releases/{{ page.version.version }}.md %}), and have created a [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).

## Configure Oracle GoldenGate for PostgreSQL

This section describes how to configure Oracle GoldenGate for PostgreSQL to work with CockroachDB. Oracle GoldenGate for PostgreSQL is the process that pulls data from [trail files](https://docs.oracle.com/goldengate/c1230/gg-winux/GGCON/processes-and-terminology.html) over to CockroachDB. This is a separate installation from Oracle GoldenGate for Oracle, which will be used to pull source data and route it to proper [trail files](https://docs.oracle.com/goldengate/c1230/gg-winux/GGCON/processes-and-terminology.html). For more information, refer to the [Oracle GoldenGate for PostgreSQL documentation](https://docs.oracle.com/en/middleware/goldengate/core/19.1/gghdb/preparing-database-oracle-goldengate-postgresql.html). The following example uses a [CockroachDB {{ site.data.products.standard }} cluster](https://cockroachlabs.com/docs/cockroachcloud/create-your-cluster).

1. Edit the `ODBC.ini` file to set up the ODBC data sources and configuration:

    {% include_cached copy-clipboard.html %}
    ~~~
    # No changes should be needed for CRDBLOCAL
    [ODBC Data Sources]
    PG_src=DataDirect 7.1 PostgreSQL Wire Protocol
    PG_tgt=DataDirect 7.1 PostgreSQL Wire Protocol
    CRDB=DataDirect 7.1 PostgreSQL Wire Protocol

    [ODBC]
    IANAAppCodePage=4
    # The following path is your Oracle GoldenGate for PostgreSQL installation directory
    InstallDir=/u01/ggs-pg
    ~~~
    
1. Ensure that all the PostgreSQL libraries are installed and referenced in `LD_LIBRARY_PATH`. 

    The path should at least include `/usr/pgsql-13/lib` and `/u01/ggs-pg/lib`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # The path is a concatenation of your PostgreSQL libraries and GoldenGate installation directory
    export LD_LIBRARY_PATH=/usr/pgsql-13/lib:/u01/ggs-pg/lib
    ~~~

1. Set up the `ODBC.ini` file for the Oracle GoldenGate host:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # This is needed so that OGG knows where to look for connection details for the database
    export ODBCINI=/etc/odbc.ini
    ~~~
    
    To make this change permanent, you must also add the command to your shell's configuration file, such as `~/.zshrc`.
            
1. In the `ODBC.ini` file, set up the CockroachDB {{ site.data.products.standard }} parameters:
    - Replace the login details with your own. Be sure to prefix the database name with `{hostname}`.
    - Make sure your CockroachDB {{ site.data.products.standard }} cluster's [root CA certificate](https://cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster#connect-to-your-cluster) is in the `TrustStore` path.

    {% include_cached copy-clipboard.html %}
    ~~~
    [CRDBSTANDARD]
    # The following driver will always point to your Oracle GoldenGate for PostgreSQL installation
    Driver=/u01/ggs-pg/lib/GGpsql25.so
    Description=DataDirect 7.1 PostgreSQL Wire Protocol
    Database={hostname}.{database}
    HostName={host}
    PortNumber=26257
    LogonID={your sql user}
    Password={your sql user's pass}
    EncryptionMethod=1 
    ValidateServerCertificate=1 
    TrustStore=/root/.postgresql/root.crt
    ~~~
        
1. Log in to the database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd /u01/ggs-pg

    ./ggsci

    # To log into the local database
    DBLOGIN SOURCEDB CRDBLOCAL

    # To log into the CockroachDB Standard database and then enter your password
    DBLOGIN SOURCEDB CRDBSTANDARD
    ~~~     

## Set up Extract to capture data from a source database

[Extract](https://docs.oracle.com/goldengate/c1230/gg-winux/GGCON/processes-and-terminology.html) is Oracle GoldenGate's data capture mechanism that is configured to run against the source database.

{{site.data.alerts.callout_success}}
Complete the steps in this section on a machine and in a directory where Oracle GoldenGate for Oracle is installed.
{{site.data.alerts.end}}

1. In the GGSCI terminal, create and open the `epos` parameter file for the Oracle source:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd /u01/ggs # Otherwise known as $OGG_HOME
    ./ggsci

    edit param epos
    view param epos
    ~~~

1. Edit the parameters that configure Extract to send data to the trail file at `./dirdat/ab` on the remote host:

    {% include_cached copy-clipboard.html %}
    ~~~
    EXTRACT epos
    USERIDALIAS gg_source
    RMTHOST {host-name}, MGRPORT {port}
    RMTTRAIL ./dirdat/ab
    TABLE OGGADM1.testtable;
    ~~~

1. In the GGSCI terminal, run the following and start the Extract service.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    add extract epos, tranlog, begin now
    add rmttrail ./dirdat/ab, extract epos megabytes 10

    # This is crucial in order to address the logmining not found error
    register EXTRACT epos, DATABASE

    # Starts service
    start epos
    ~~~

1. Check the status of the Extract by creating a test table `OGGADM1.testtable` in Oracle and adding a row:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE OGGADM1.testtable (col1 number, col2 varchar2(20));
    ALTER TABLE OGGADM1.testtable ADD PRIMARY KEY (col1);
    INSERT INTO OGGADM1.testtable (col1, col2) VALUES (11, 'Example data');
    COMMIT;
    ~~~

1. In GGSCI, in another terminal, check that Extract is working correctly:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    stats EXTRACT epos
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

## Set up Replicat to deliver data to CockroachDB

[Replicat](https://docs.oracle.com/goldengate/c1230/gg-winux/GGCON/processes-and-terminology.html) is an Oracle process that reads [trail files](https://docs.oracle.com/goldengate/c1230/gg-winux/GGCON/processes-and-terminology.html) and delivers data to a target database.

{{site.data.alerts.callout_success}}
Run the steps in this section on a machine and in a directory where Oracle GoldenGate for PostgreSQL is installed.
{{site.data.alerts.end}}

1. Log in to the database from GGSCI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export LD_LIBRARY_PATH=/usr/pgsql-13/lib:/u01/ggs-pg/lib
    export ODBCINI=/etc/odbc.ini

    cd /u01/ggs-pg
    ./ggsci

    # Log into the DB
    DBLOGIN SOURCEDB CRDBLOCAL
    ~~~

1. Check the status in the GGSCI terminal:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    info all
    ~~~

    You should see the following output:

    ~~~
    Program     Status      Group       Lag at Chkpt  Time Since Chkpt
    MANAGER     RUNNING                                           
    ~~~

1. Open the parameter file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    edit param RORPSQL 
    view param RORPSQL 
    ~~~

1. Edit the parameters to configure the `MAP` statement, which maps the source (`OGGADM1.testtable`) to the target (`public.testtable`):

    {% include_cached copy-clipboard.html %}
    ~~~
    REPLICAT RORPSQL
    SETENV ( PGCLIENTENCODING = "UTF8" )
    SETENV (ODBCINI="/etc/odbc.ini" )
    SETENV (NLS_LANG="AMERICAN_AMERICA.AL32UTF8")
    TARGETDB CRDBLOCAL
    DISCARDFILE ./dirrpt/diskg.dsc, purge
    MAP OGGADM1.testtable, TARGET public.testtable, COLMAP (COL1=col1,COL2=col2);
    ~~~

1. In the GGSCI terminal, run the following and start the Replicat service:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    add replicat RORPSQL, NODBCHECKPOINT, exttrail ./dirdat/ab
    start RORPSQL
    ~~~

    ~~~
    Program     Status      Group       Lag at Chkpt  Time Since Chkpt
    MANAGER     RUNNING                                           
    REPLICAT    RUNNING     RORPSQL     00:00:00      00:00:09  
    ~~~

1. Test that Extract and Replicat are working properly by adding values to `OGGADM1.testtable`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO OGGADM1.testtable (col1, col2) VALUES (12, 'Example data');
    COMMIT;
    ~~~

1. [Connect to the target CockroachDB {{ site.data.products.standard }} cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}) and check that the data was delivered to `public.testtable`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM public.testtable;
    ~~~
    
    ~~~
      col1 |     col2
    -------+---------------
        12 | Example data
    ~~~

1. Open the GGSCI terminal for Oracle: 

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd $OGG_HOME
    ./ggsci
    ~~~

1. Check that Extract is working correctly:
    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    stats EXTRACT EPOS
    ~~~

    You should see an output similar to the following:

    ~~~
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
    ~~~

1. Open the GGSCI terminal for CockroachDB: 

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd $OGG_PG_HOME
    ./ggsci
    ~~~

1.  Check that Replicat is working correctly:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    stats REPLICAT RORPSQL
    ~~~

    You should see an output similar to the following:

    ~~~
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
    ~~~

## Perform bulk replication

1. Keep the [Extract process](#set-up-extract-to-capture-data-from-a-source-database) running on Oracle and the [Replicat process](#set-up-replicat-to-deliver-data-to-cockroachdb) running for CockroachDB.
1. In the source database, bulk insert some data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO OGGADM1.testtable2 (col1, col2)
    SELECT level + 99, 'Example data'
    FROM dual
    CONNECT BY level <= 50000 - 99;
    ~~~

1. Run the status command on the Extract GGSCI terminal:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    stats EXTRACT EPOS
    ~~~
    
    You will see an output similar to the following:

    ~~~
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

1. Run the status command on the Replicat GGSCI terminal:

    The number of inserts takes a few minutes to update. After the process finishes inserting and committing to the database, it will report back the final inserts. During the process, it will show the previous state:

    ~~~
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
    
    To verify that the insert is happening, you can run: `SELECT COUNT(*) FROM public.testtable;`. The query will hang while it's still inserting.

1. To track the status of an ongoing replication, view the report:

    ~~~
    ./ggsci

    VIEW REPORT RORPSQL
    ~~~

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Third-Party Tools Supported by Cockroach Labs]({% link {{ page.version.version }}/third-party-database-tools.md %})
