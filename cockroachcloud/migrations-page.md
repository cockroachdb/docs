---
title: Migrations Page
summary: Use the Schema Conversion Tool to begin a database migration to CockroachDB.
toc: true
cloud: true
docs_area: migrate
---

{% capture version_prefix %}{{site.versions["stable"]}}/{% endcapture %}

{% include feature-phases/preview.md %}

The **Migrations** page on the {{ site.data.products.db }} Console features a **Schema Conversion Tool** that helps you:

- Convert a schema from a PostgreSQL database for use with CockroachDB.
- Create a new database that uses the converted schema.

{{site.data.alerts.callout_info}}
On the **Migrations** page, a *migration* refers to converting a schema for use with CockroachDB and creating a new database that uses the schema. It does not include moving data to the new database. For details on all steps required to complete a database migration, see [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html).
{{site.data.alerts.end}}

To view this page, click **Migrations** in the left navigation of the {{ site.data.products.db }} Console. The **Migrations** tab is selected.

## Upload a SQL dump

The upload box for the **Schema Conversion Tool** is displayed at the top of the **Migrations** page.

The **Schema Conversion Tool** expects to analyze a PostgreSQL dump file containing [data definition statements](../{{version_prefix}}sql-statements.html#data-definition-statements) that create a database schema. To generate an appropriate file, run the [`pg_dump` utility](https://www.postgresql.org/docs/current/app-pgdump.html) and specify the `-s` or `--schema-only` options to extract **only the schema** of a PostgreSQL database to a `.sql` file.

{% comment %}
For an example, see [Migrate a PostgreSQL database](migrate-from-postgres.html#tk).
{% endcomment %}

{{site.data.alerts.callout_info}}
The dump file must be less than 4 MB. `INSERT` and `COPY` statements will be ignored in schema conversion.
{{site.data.alerts.end}}

To begin a database migration:

1. Click the upload box and select a `.sql` file, or drop a `.sql` file directly into the box. 
1. Wait for the schema to be analyzed. A loading screen is displayed. Depending on the size and complexity of the SQL dump, analyzing the schema can require up to several minutes.
1. When analysis is complete, review the [**Summary Report**](#summary-report) and edit, add, or remove SQL statements in the [**Statements** list](#statements-list).

## Migrations table

If you have attempted at least one migration, the Migrations table is displayed with the following details:

|     Column     |                                                                                         Description                                                                                          |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Migration Name | The filename of the `.sql` file that was [uploaded](#upload-a-sql-dump).                                                                                                                       |
| Status         | The status of the migration: `READY FOR REVIEW`, `READY TO FINALIZE`, or `FINALIZED`. You can [finalize](#finalize-the-schema) migrations with `READY TO FINALIZE` status.                    |
| Date Imported  | The timestamp when the SQL dump was uploaded.                                                                                                                                                |
| Last Updated   | The timestamp when the [SQL statements](#statements-list) were updated.                                                                                                                      |
| Errors         | The number of SQL errors preventing a migration from attaining `READY TO FINALIZE` status. |

To view the [**Summary Report**](#summary-report) or [**Statements** list](#statements-list) for a migration, click the migration name.

## Summary Report

The **Summary Report** displays the results of the schema analysis:

- The number of **statements total** in the [uploaded](#upload-a-sql-dump) `.sql` file that were analyzed.
- The number of **errors** in SQL statements that are blocking [finalization](#finalize-the-schema). Errors are further categorized on the [**Statement Status**](#statement-status) graph.
- The number of **incidental errors** in SQL statements that are caused by errors in other SQL statements.
- The number of **suggestions** that were made regarding [differences from other databases](../{{version_prefix}}migration-overview.html#differences-from-other-databases).

To resolve errors and review suggestions, click **View Statements** or the **Statements** tab to open the [**Statements** list](#statements-list).

To [finalize the schema](#finalize-the-schema) and create a new database for migration, click **Finalize Schema**. The number of **errors** must be zero.

### Statement Status

The **Statement Status** graph displays the number of successful statements (green), the number of errors (red), and the number of incidental errors (orange):

- **OK** represents a successful statement.
- **Unimplemented Feature** represents a statement that uses an [unimplemented feature](../{{version_prefix}}migration-overview.html#unimplemented-features).
- **Statement Error** represents a statement that failed for a reason other than a missing user or unimplemented feature.
- **Not Executed** represents a statement that was not executed by the tool.
- **Missing User** represents a statement that references a nonexistent user. 
- **Incidental Error** represents a statement that failed because another SQL statement encountered one of the preceding error types.

### Suggestions

The **Suggestions** graph displays the number of each suggestion type:

- **Sequences** represents a statement that uses a sequence to define a primary key column. [Using a sequence for a primary key column is not recommended.](../{{version_prefix}}create-sequence.html#considerations)
- **Default INT size** represents a statement that was **added** to change the integer size to `4`. [By default, CockroachDB uses `INT8`.](../{{version_prefix}}int.html#considerations-for-64-bit-signed-integers) If you don't want to change the integer size, you can remove this statement in the [**Statements** list](#statements-list).
- **Missing Primary Key** represents a statement that does not define an explicit primary key for a table. [Defining an explicit primary key on every table is recommended.](../{{version_prefix}}schema-design-table.html#select-primary-key-columns)

{{site.data.alerts.callout_success}}
For more details on why these suggestions are made, see [Differences from other databases](../{{version_prefix}}migration-overview.html#differences-from-other-databases).
{{site.data.alerts.end}}

## Statements list

The **Statements** list displays the result of analyzing each statement in the `.sql` file that you uploaded. The number of **Statements Total**, **Errors**, **Incidental Errors**, and **Suggestions** are displayed above the list of statements.

To [finalize the schema](#finalize-the-schema) and create a new database for migration, click **Finalize Schema**. The number of **Errors** must be zero.

Otherwise, use the **Statements** list to review and resolve errors. Navigate the list by scrolling or by clicking the arrows and **Scroll to Top** button on the bottom-right.

{{site.data.alerts.callout_info}}
Incidental errors do not block finalization. This is because they are caused by errors in other SQL statements, and will likely disappear as you resolve those errors.
{{site.data.alerts.end}}

By default, the **Statements** list displays both successful and failed statements. To view only the statements that failed, check **Collapse successful statements**.

Statements are displayed as follows:

- A statement that succeeded is displayed without further detail.
- A statement that failed is displayed with `[error]` and a message with error details. If the failure was due to an incidental error, the message also states: `This error may automatically resolve once an earlier statement no longer errors`.
- A statement with a suggestion is displayed with `[suggestion]`, a message with suggestion details, and an **Acknowledge** checkbox.

To edit a statement, click the statement and enter your changes. Your changes are saved when you click outside the statement.

To remove or add a statement, click the ellipsis above the statement and then click **Delete statement**, **Add statement above**, or **Add statement below**.

### Update the schema

Respond to errors and suggestions according to the following guidelines:

|          Type         |                                                                                                                                                                                                          Solution                                                                                                                                                                                                         |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Unimplemented feature | The feature does not yet exist on CockroachDB. Implement a workaround by editing the statement and adding statements. Otherwise, remove the statement from the schema. If a link to a tracking issue is included, click the link for further context. For more information about unimplemented features, see [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html#unimplemented-features). |
| Statement error       | Edit the statement to fix the error. Otherwise, remove the statement from the schema.                                                                                                                                                                                                                                                                                                                                     |
| Not executed          | Remove the statement from the schema. You can include it when [moving data to the new database](../{{version_prefix}}migration-overview.html#step-2-move-your-data-to-cockroachdb).                                                                                                                                                                                                                                       |
| Missing user          | Click the **Add User** button next to the error message. You must be a member of the [`admin` role](user-authorization.html). This adds the missing user to the cluster.                                                                                                                                                                                                                                                  |
| Incidental error      | Resolve the earlier failed statement that caused the incidental error.                                                                                                                                                                                                                                                                                                                                                    |
| Suggestion            | Review and take any actions relevant to the suggestion. Then check **Acknowledge**.                                                                                                                                                                                                                                                                                                                                       |

If you have made changes to any statements, [retry the migration](#retry-the-migration) to update the number of **Statements Total**, **Errors**, **Incidental Errors**, and **Suggestions**.

To export the current schema, click **Export SQL File** at the top of the **Statements** list.

### Retry the migration

To analyze a schema that has been updated in the [**Statements** list](#statements-list), click **Retry Migration** at the top of the list.

This is necessary in order to update the number of **Errors** and enable [finalization](#finalize-the-schema). 

## Finalize the schema

You can finalize the schema when the number of errors is zero. This value is displayed on the [Migrations table](#migrations-table), [**Summary Report**](#summary-report), and [**Statements** list](#statements-list).

To finalize the schema, click **Finalize Schema** when viewing the **Summary Report** or **Statements** list. A modal will open:

1. In the **Success** tab, click **Next**.

1. In the **Create Schema** tab, name the new database and select a user to own the database. Optionally click **Download SQL export** to download your schema file. This is useful for migrating your database to a different cluster. Then click **Finalize** to create the new database.

1. In the **Move Data** tab, click **Done!**.

{{site.data.alerts.callout_success}}
After finalizing the schema and creating the new database, [move data into the database](../{{version_prefix}}migration-overview.html#step-2-move-your-data-to-cockroachdb) and [test your application](../{{version_prefix}}migration-overview.html#step-3-test-and-update-your-application). 
{{site.data.alerts.end}}

## See also

- [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html)