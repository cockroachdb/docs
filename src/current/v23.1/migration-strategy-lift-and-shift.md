---
title: "Migration Strategy: Lift and Shift"
summary: Learn about the 'Lift and Shift' data migration strategy
toc: true
docs_area: migrate
---

There are multiple strategies for [migrating off legacy technology]({% link {{ page.version.version }}/migration-overview.md %}) to CockroachDB.

This page discusses the ["Lift and Shift" strategy]({% link {{ page.version.version }}/migration-overview.md %}#lift-and-shift) for migrating your database, which is a commonly used approach. This approach, which is also known as "Big Bang" (and by other names), refers to the process where your data is moved in its entirety from a source system to a target system within a defined period of time. This typically involves some application downtime and can involve some service degradation.

Lift and Shift may not be the right approach if a strong application service continuity during the migration is required. It may be a viable method if application downtime is permitted.

{{site.data.alerts.callout_info}}
The information on this page assumes you have already reviewed the [migration overview]({% link {{ page.version.version }}/migration-overview.md %}).
{{site.data.alerts.end}}

## Pros and Cons

On the spectrum of different data migration strategies, Lift and Shift has the following pros and cons. The terms "lower" and "higher" are not absolute, but relative to other approaches.

Pros:

- Conceptually straightforward.
- Less complex: If you can afford some downtime, the overall effort will usually be lower, and the chance of errors is lower.
- Lower time start-to-finish: In general, the more downtime you can afford, the shorter the overall migration project timeframe can be.
- Lower technical risk: It does not involve running multiple systems alongside each other for an extended period of time.
- Easy to practice [dry runs]({% link {{ page.version.version }}/migration-overview.md %}#perform-a-dry-run) of import/export using testing/non-production systems.
- Good import/export tooling is available (e.g., external tools like: [AWS Database Migration Service (DMS)]({% link {{ page.version.version }}/aws-dms.md %}), [Qlik Replicate]({% link {{ page.version.version }}/qlik.md %}), [Striim]({% link {{ page.version.version }}/striim.md %}); or internal tools like [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}), [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}), [`cockroach userdata`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %})).
- If your application already has regularly scheduled maintenance windows, your customers will not encounter application downtime.

Cons:

- All or nothing: It either works or does not work; once you start, you have to finish or [roll back]({% link {{ page.version.version }}/migration-overview.md %}#all-at-once-rollback).
- Higher project risk: The project **must** be completed to meet a given [downtime / service degradation window]({% link {{ page.version.version }}/migration-overview.md %}#downtime-window).
- Application service continuity requirements must be relaxed (that is, application downtime or increased latency may be needed).

## Process design considerations

{{site.data.alerts.callout_info}}
The high-level considerations in this section only refer to the data-loading portion of your migration. They assume you are following the steps in the overall migration process described in [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %}).
{{site.data.alerts.end}}

Keep in mind the following considerations when designing a Lift and Shift data migration process.

- [Decide on your data migration tooling.](#managed-migration)
- [Decide which data formats you will use.](#data-formats)
- [Design a restartable process.](#restartable)
- [Design a scalable process.](#scalable)

<a name="managed-migration"></a>

### Decide on your data migration tooling

If you plan to do your bulk data migration using a managed migration service, you must have a secure, publicly available CockroachDB cluster. CockroachDB supports the following [third-party migration services]({% link {{ page.version.version }}/third-party-database-tools.md %}#data-migration-tools):

- [AWS Database Migration Service (DMS)]({% link {{ page.version.version }}/aws-dms.md %})
- [Qlik Replicate]({% link {{ page.version.version }}/qlik.md %})
- [Striim]({% link {{ page.version.version }}/striim.md %})

{{site.data.alerts.callout_info}}
Depending on the migration service you choose, [long-running transactions]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#hanging-or-stuck-queries) can occur. In some cases, these queries will cause [transaction retry errors]({% link {{ page.version.version }}/common-errors.md %}#restart-transaction). If you encounter these errors while migrating to CockroachDB using a managed migration service, please reach out to our [Support Resources]({% link {{ page.version.version }}/support-resources.md %}).
{{site.data.alerts.end}}

If you will not be using a managed migration service, see the following sections for more information on how to use SQL statements like [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}), [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}), etc.

<a name="data-formats"></a>

### Decide which data formats and storage media you will use

It's important to decide which data formats, storage media, and database features you will use to migrate your data.

Data formats that can be imported by CockroachDB include:

- [SQL]({% link {{ page.version.version }}/schema-design-overview.md %}) for the [schema import](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page).
- [CSV]({% link {{ page.version.version }}/migrate-from-csv.md %}) for table data.
- [Avro]({% link {{ page.version.version }}/migrate-from-avro.md %}) for table data.

The storage media you use to export / import from can be intermediate data files or streaming data coming over the network. Options include:

- Local "userdata" storage for small tables (see [`cockroach userdata`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}), [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})).
- Cloud blob storage (see [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}), [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %}), [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})).
- Direct wire transfers (see [managed migration services](#managed-migration)).

Database features for export/import from the source and target databases can include:

- Tools for exporting from the source database may include: `pg_dump --schema-only` and `COPY FROM`, `mysqldump`, `expdp`, etc.
- For import into CockroachDB, use [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}) or [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}). For a bulk data migrations, most users should use `IMPORT INTO` because the tables will be offline anyway, and `IMPORT INTO` can [perform the data import much faster]({% link {{ page.version.version }}/import-performance-best-practices.md %}) than `COPY FROM`.

Decide which of the options above will meet your requirements while resulting in a process that is [restartable](#restartable) and [scalable](#scalable).

<a name="restartable"></a>

### Design a restartable process

To have a higher chance of success, design your data migration process so it can be stopped and restarted from an intermediate state at any time during the process. This will help minimize errors and avoid wasted effort.

Keep the following requirements in mind as you design a restartable import/export process:

- Bulk migrate data in manageable size batches for your source and target systems.
    - This is a best practice. If something happens to the target cluster during import, the amount of wasted work will be minimized.
- Implement progress/state keeping with process restart capabilities.
- Make sure your export process is idempotent: the same input to your export process should return the same output data.
- If possible, export and import the majority of your data before taking down the source database. This can ensure that you only have to deal with the incremental changes from your last import to complete the migration process.

<a name="scalable"></a>

### Design a scalable and performant process

Once your process is [restartable and resilient to failures](#design-a-restartable-process), it's important to also make sure it will scale to the needs of your data set. The larger the data set you are migrating to CockroachDB, the more important the performance and scalability of your process will be.

Keep the following requirements in mind:

- Schema and data should be imported separately.
- Your process should handle multiple files across multiple export/import streams concurrently.
  - For best performance, these files should contain presorted, disjoint data sets.
- Benchmark the performance of your migration process to help ensure it will complete within the allotted downtime window.
  
For more information about import performance, see [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %}).

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Use the Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [Migrate with AWS Database Migration Service (DMS)]({% link {{ page.version.version }}/aws-dms.md %})
- [AWS DMS documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [Migrate and Replicate Data with Qlik Replicate]({% link {{ page.version.version }}/qlik.md %})
- [Migrate and Replicate Data with Striim]({% link {{ page.version.version }}/striim.md %})
- [Schema Design Overview]({% link {{ page.version.version }}/schema-design-overview.md %})
- [Back Up and Restore]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Export data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %})
- [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Migrate from CSV]({% link {{ page.version.version }}/migrate-from-csv.md %})
- [Migrate from Avro]({% link {{ page.version.version }}/migrate-from-avro.md %})
- [Client connection parameters]({% link {{ page.version.version }}/connection-parameters.md %})


{% comment %} eof {% endcomment %}
