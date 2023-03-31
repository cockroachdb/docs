---
title: Migrate and Replicate Data with Qlik Replicate
summary: Use Qlik Replicate to migrate data to a CockroachDB cluster.
toc: true
docs_area: migrate
---

[Qlik](https://www.qlik.com) offers a service called Qlik Replicate that you can use to do the following:

- [Migrate data to CockroachDB](#migrate-and-replicate-data-to-cockroachdb) from an existing, publicly hosted database containing application data, such as PostgreSQL, MySQL, Oracle, or Microsoft SQL Server. 

{% comment %}
- [Replicate data to a secondary source](#replicate-data-from-cockroachdb-to-a-secondary-source) such as Kafka or cloud storage.
{% endcomment %}

As of this writing, Qlik supports the following database [sources](https://www.qlik.com/us/products/data-sources):

- Cassandra
- Couchbase
- DB2 for iSeries
- DB2 for LUW
- DB2 for z/OS
- HP Nonstop Enscribe (AIS)
- HP Nonstop SQL/MP (AIS)
- IBM Informix
- IMS/DB
- MariaDB
- Microsoft SQL Server
- MongoDB
- MySQL
- OpenVMS RMS
- Oracle
- Percona
- PostgreSQL
- SAP HANA
- SAP Sybase ASE
- Other via ODBC (with or without CDC)

This page describes the Qlik Replicate functionality at a high level. For detailed information, refer to the tutorial and documentation provided when [signing up for Qlik Replicate](https://www.qlik.com/us/products/qlik-replicate).

## Before you begin

Complete the following items before using Qlik Replicate:

- Ensure you have a secure, publicly available CockroachDB cluster running the latest **{{ page.version.version }}** [production release](../releases/index.html), and have created a [SQL user](security-reference/authorization.html#sql-users) that you can use for your Qlik Replicate target endpoint.
    - Set the following [session variables](set-vars.html#supported-variables) using [`ALTER ROLE ... SET {session variable}`](alter-role.html#set-default-session-variable-values-for-a-role):

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        ALTER ROLE {username} SET copy_from_retries_enabled = true;
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        ALTER ROLE {username} SET copy_from_atomic_enabled = false;
        ~~~

        This prevents a potential issue when migrating especially large tables with millions of rows.

- If you are migrating to a {{ site.data.products.db }} cluster and plan to [use replication as part of your migration strategy](#migrate-and-replicate-data-to-cockroachdb), you must first **disable** [revision history for cluster backups](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) for the migration to succeed.
    {{site.data.alerts.callout_danger}}
    You will not be able to run a [point-in-time restore](take-backups-with-revision-history-and-restore-from-a-point-in-time.html#point-in-time-restore) as long as revision history for cluster backups is disabled. Once you verify in the Qlik Replicate Monitor view that the migration succeeded, you should re-enable revision history.
    {{site.data.alerts.end}}

    - If the output of [`SHOW SCHEDULES`](show-schedules.html) shows any backup schedules, run [`ALTER BACKUP SCHEDULE {schedule_id} SET WITH revision_history = 'false'`](alter-backup-schedule.html) for each backup schedule.
    - If the output of `SHOW SCHEDULES` does not show backup schedules, [contact Support](https://support.cockroachlabs.com) to disable revision history for cluster backups.
- Manually create all schema objects in the target CockroachDB cluster. This is required in order for Qlik Replicate to populate data successfully.
    - If you are migrating from PostgreSQL, MySQL, Oracle, or Microsoft SQL Server, [use the **Schema Conversion Tool**](../cockroachcloud/migrations-page.html) to convert and export your schema. Ensure that any schema changes are also reflected on your tables, or add transformation rules. If you make substantial schema changes, the Qlik Replicate migration may fail.

    {{site.data.alerts.callout_info}}
    All tables must have an explicitly defined primary key. For more guidance, see [Migrate Your Database to CockroachDB](migration-overview.html#step-1-convert-your-schema).
    {{site.data.alerts.end}}

## Migrate and replicate data to CockroachDB

You can use Qlik Replicate to migrate tables from a source database to CockroachDB. This can comprise an initial load that copies the selected schemas and their data from the source database to CockroachDB, followed by continuous replication of ongoing changes using Qlik change data capture (CDC).

In the Qlik Replicate interface, the source database is configured as a **source endpoint** with the appropriate dialect, and CockroachDB is configured as a PostgreSQL **target endpoint**. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster](connect-to-the-database.html).

{{site.data.alerts.callout_info}}
To use a {{ site.data.products.serverless }} cluster as the target endpoint, set the **Database Name** to `{database}` in the Qlik Replicate dialog.
{{site.data.alerts.end}}

- To perform both an initial load and continuous replication of ongoing changes to the target tables, select **Full Load** and **Apply Changes**. This minimizes downtime for your migration.
- To perform a one-time migration to CockroachDB, select **Full Load** only.

{% comment %}
## Replicate data from CockroachDB to a secondary source

You can use Qlik Replicate to replicate ongoing changes from CockroachDB to a secondary source. This may include a [downstream sink](changefeed-sinks.html) such as Kafka or cloud storage for purposes such as reporting, caching, or full-text indexing.

In the Qlik Replicate interface, CockroachDB is configured as a PostgreSQL **source endpoint**, and the secondary source is configured as the **target endpoint**. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster](connect-to-the-database.html).
{% endcomment %}

## See also

- [Migrate Your Database to CockroachDB](migration-overview.html)
- [Schema Conversion Tool](../cockroachcloud/migrations-page.html)
- [Change Data Capture Overview](change-data-capture-overview.html)
- [Third-Party Tools Supported by Cockroach Labs](third-party-database-tools.html)
- [Migrate with AWS Database Migration Service (DMS)](aws-dms.html)