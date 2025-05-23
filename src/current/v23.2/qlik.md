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

- Ensure you have a secure, publicly available CockroachDB cluster running the latest **{{ page.version.version }}** [production release]({% link releases/index.md %}), and have created a [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users) that you can use for your Qlik Replicate target endpoint.
    - Set the following [session variables]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) using [`ALTER ROLE ... SET {session variable}`]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-role):

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        ALTER ROLE {username} SET copy_from_retries_enabled = true;
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        ALTER ROLE {username} SET copy_from_atomic_enabled = false;
        ~~~

        This prevents a potential issue when migrating especially large tables with millions of rows.

- If you are migrating to a CockroachDB {{ site.data.products.cloud }} cluster and plan to [use replication as part of your migration strategy](#migrate-and-replicate-data-to-cockroachdb), you must first **disable** [revision history for cluster backups]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}) for the migration to succeed.
    {{site.data.alerts.callout_danger}}
    You will not be able to run a [point-in-time restore]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}#point-in-time-restore) as long as revision history for cluster backups is disabled. Once you verify in the Qlik Replicate Monitor view that the migration succeeded, you should re-enable revision history.
    {{site.data.alerts.end}}

    - If the output of [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}) shows any backup schedules, run [`ALTER BACKUP SCHEDULE {schedule_id} SET WITH revision_history = 'false'`]({% link {{ page.version.version }}/alter-backup-schedule.md %}) for each backup schedule.
    - If the output of `SHOW SCHEDULES` does not show backup schedules, [contact Support](https://support.cockroachlabs.com) to disable revision history for cluster backups.
- Manually create all schema objects in the target CockroachDB cluster. Qlik can create a basic schema, but does not create indexes or constraints such as foreign keys and defaults.
    - If you are migrating from PostgreSQL, MySQL, Oracle, or Microsoft SQL Server, [use the **Schema Conversion Tool**]({% link cockroachcloud/migrations-page.md %}) to convert and export your schema. Ensure that any schema changes are also reflected on your tables, or add transformation rules. If you make substantial schema changes, the Qlik Replicate migration may fail.

        {{site.data.alerts.callout_info}}
        All tables must have an explicitly defined primary key. For more guidance, see [Migration Strategy]({% link molt/migration-strategy.md %}#schema-design-best-practices).
        {{site.data.alerts.end}}

## Migrate and replicate data to CockroachDB

You can use Qlik Replicate to migrate tables from a source database to CockroachDB. This can comprise an initial load that copies the selected schemas and their data from the source database to CockroachDB, followed by continuous replication of ongoing changes using Qlik change data capture (CDC).

In the Qlik Replicate interface, the source database is configured as a **source endpoint** with the appropriate dialect, and CockroachDB is configured as a PostgreSQL **target endpoint**. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}).

{{site.data.alerts.callout_info}}
To use a CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster as the target endpoint, set the **Database name** to `{host}.{database}` in the Qlik Replicate dialog. For details on how to find these parameters, see [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %}?filters=connection-parameters#connect-to-your-cluster). Also set **Secure Socket Layer (SSL) mode** to **require**.
{{site.data.alerts.end}}

- To perform both an initial load and continuous replication of ongoing changes to the target tables, select **Full Load** and **Apply Changes**. This minimizes downtime for your migration.
- To perform a one-time migration to CockroachDB, select **Full Load** only.

To preserve the schema you manually created, select **TRUNCATE before loading** or **Do nothing**.

{% comment %}
## Replicate data from CockroachDB to a secondary source

You can use Qlik Replicate to replicate ongoing changes from CockroachDB to a secondary source. This may include a [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) such as Kafka or cloud storage for purposes such as reporting, caching, or full-text indexing.

In the Qlik Replicate interface, CockroachDB is configured as a PostgreSQL **source endpoint**, and the secondary source is configured as the **target endpoint**. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}).
{% endcomment %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Third-Party Tools Supported by Cockroach Labs]({% link {{ page.version.version }}/third-party-database-tools.md %})
- [Migrate with AWS Database Migration Service (DMS)]({% link {{ page.version.version }}/aws-dms.md %})
