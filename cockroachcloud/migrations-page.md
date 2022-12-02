---
title: Migrations Page
summary: Use the Schema Conversion Tool to begin a database migration to CockroachDB.
toc: true
cloud: true
docs_area: migrate
---

{% capture version_prefix %}{{site.versions["cloud"]}}/{% endcapture %}

{% include feature-phases/preview.md %}

The **Migrations** page on the {{ site.data.products.db }} Console features a **Schema Conversion Tool** that helps you:

- Convert a schema from a PostgreSQL, MySQL, Oracle, or Microsoft SQL Server database for use with CockroachDB.
- Create a new database that uses the converted schema. You specify the target database and database owner when [finalizing the schema](#finalize-the-schema).

{{site.data.alerts.callout_info}}
On the **Migrations** page, a *migration* refers to converting a schema for use with CockroachDB and creating a new database that uses the schema. It does not include moving data to the new database. For details on all steps required to complete a database migration, see [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html).
{{site.data.alerts.end}}

To view this page, click **Migrations** in the left navigation of the {{ site.data.products.db }} Console. The **Migrations** tab is selected.

## Upload a SQL dump

The upload box for the **Schema Conversion Tool** is displayed at the top of the **Migrations** page.

The **Schema Conversion Tool** expects to analyze a SQL dump file containing [data definition statements](../{{version_prefix}}sql-statements.html#data-definition-statements) that create a database schema. The exact steps depend on the dialect from which you are migrating.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
    <button class="filter-button" data-scope="mssql">SQL Server</button>
</div>

<section class="filter-content" markdown="1" data-scope="postgres">
To generate an appropriate file, run the [`pg_dump` utility](https://www.postgresql.org/docs/current/app-pgdump.html) and specify the `-s` or `--schema-only` options to extract **only the schema** of a PostgreSQL database to a `.sql` file.
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
To generate an appropriate file, run the [`mysqldump` utility](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) and specify the `-d` or `--no-data` options to extract **only the schema** of the MySQL database to a `.sql` file.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
To generate an appropriate file, run the [`expdp` utility](https://docs.oracle.com/cd/E11882_01/server.112/e22490/dp_export.htm#i1007509) to extract **only the schema** of the Oracle database to a `.sql` file.
</section>

<section class="filter-content" markdown="1" data-scope="mssql">
To generate an appropriate file, use either [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/tutorials/scripting-ssms?view=sql-server-ver16#script-a-database-by-using-the-script-option) or the equivalent [`mssql-scripter` utility](https://github.com/microsoft/mssql-scripter) to extract **only the schema** of the SQL Server database to a `.sql` file.
</section>

The dump file must be smaller than 4 MB. `INSERT` and `COPY` statements will be ignored in schema conversion. To begin your database migration:

<ol>
<li>Click the upload box and select a <code>.sql</code> file, or drop a <code>.sql</code> file directly into the box.</li>
<li>Select your <b>Dialect</b> from the pulldown menu and configure the following conversion defaults:</li>

<ul>
<section class="filter-content" markdown="1" data-scope="postgres">
<li><b>INT type conversion</b>: On CockroachDB, <code>INT</code> is an alias for <code>INT8</code>, which creates 64-bit signed integers. On PostgreSQL, <code>INT</code> defaults to <code>INT4</code>. For details, see <a href="migration-overview.html#differences-from-other-databases">Differences from other databases</a>.</li> 
</section>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li><b>Casing of Identifiers:</b> Select <b>Keep case sensitivity</b> to enclose identifiers in double-quotes, and <b>Make case insensitive</b> to convert identifiers to lowercase. For details on how CockroachDB handles identifiers, see <a href="keywords-and-identifiers.html#identifiers">Identifiers</a>.</li>
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
<li><b>AUTO_INCREMENT Conversion Option:</b> We do not recommend using a sequence to define a primary key column. For details, see <a href="migration-overview.html#differences-from-other-databases">Differences from other databases</a>. To understand the differences between the <code><b>UUID</b></code> and <code><b>unique_rowid()</b></code></b> options, see the <a href="sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid">SQL FAQs</a>.</li>
<li><b>Enum Preferences:</b> On CockroachDB, <a href="enum.html"><code>ENUMS</code></a> are a standalone type. On MySQL, they are part of column definitions. You can select to either deduplicate the <code>ENUM</code> definitions or create a separate type for each column.</li>
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
<li><b>GENERATED AS IDENTITY Conversion Option:</b> We do not recommend using a sequence to define a primary key column. For details, see <a href="migration-overview.html#differences-from-other-databases">Differences from other databases</a>. To understand the differences between the <code><b>UUID</b></code> and <code><b>unique_rowid()</b></code></b> options, see the <a href="sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid">SQL FAQs</a>.</li>
</section>

<section class="filter-content" markdown="1" data-scope="mssql">
<li><b>IDENTITY Conversion Option:</b> We do not recommend using a sequence to define a primary key column. For details, see <a href="migration-overview.html#differences-from-other-databases">Differences from other databases</a>. To understand the differences between the <code><b>UUID</b></code> and <code><b>unique_rowid()</b></code></b> options, see the <a href="sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid">SQL FAQs</a>.</li>
</section>
</ul>

<li>Click <b>Migrate</b> and wait for the schema to be analyzed. A loading screen is displayed. Depending on the size and complexity of the SQL dump, analyzing the schema can require up to several minutes.</li>
<li>When analysis is complete, review the <a href="#summary-report"><b>Summary Report</b></a> and edit, add, or remove SQL statements in the <a href="#statements-list"><b>Statements</b> list</a>.</li>
</ol>

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

<ul>
<li>The number of <b>Statements Total</b> in the uploaded <code>.sql</code> file that were analyzed.</li>
<li>The number of <b>Errors</b> in SQL statements that are blocking <a href="#finalize-the-schema">finalization</a>. Errors are further categorized and counted on the <a href="#statement-status"><b>Statement Status</b></a> graph.</li>
<li>The number of <b>Incidental Errors</b> in SQL statements that are caused by errors in other SQL statements.</li>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li>The number of <b>Incompatible Statements</b> that could not be converted because they have no equivalent syntax on CockroachDB.</li>
<li>The number of <b>Compatibility Notes</b> regarding differences in SQL syntax. Although these statements do not block finalization, you should [update](#update-the-schema) them before finalization.</li>
</section>

<li>The number of <b>Suggestions</b> regarding <a href="../{{version_prefix}}migration-overview.html#differences-from-other-databases">CockroachDB best practices</a>.</li>
</ul>

To review and [update the schema](#update-the-schema), click **View Statements** or the **Statements** tab to open the [**Statements** list](#statements-list).

To [finalize the schema](#finalize-the-schema) and create a new database for migration, click **Finalize Schema**. The schema must have zero errors.

### Statement Status

The **Statement Status** graph displays the number of successful statements (green), the number of failed statements (red), and the number of incidental errors (orange):

<ul>
<li><b>OK</b> represents a successful statement.</li>
<li><b>Unimplemented Feature</b> represents a statement that uses an <a href="../{{version_prefix}}migration-overview.html#unimplemented-features">unimplemented feature</a>.</li>
<li><b>Statement Error</b> represents a statement that failed for a reason other than a missing user, unimplemented feature, or incompatible syntax.</li>
<li><b>Not Executed</b> represents a statement that was not executed by the tool, such as an `INSERT` or `COPY` statement.</li>
<li><b>Missing User</b> represents a statement that references a nonexistent user. </li>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li><b>Incompatible</b> represents a statement that could not be converted because it has no equivalent syntax on CockroachDB.</li>
</section>

<li><b>Incidental Error</b> represents a statement that failed because another SQL statement encountered one of the preceding error types.</li>
</ul>

### Suggestions

The **Suggestions** graph displays the number of each suggestion type:

- **Sequences** represents a statement that uses a sequence to define a primary key column. [Using a sequence for a primary key column is not recommended.](../{{version_prefix}}create-sequence.html#considerations)
- **Default INT Size** represents a statement that was **added** to change the integer size to `4`. [By default, CockroachDB uses `INT8`.](../{{version_prefix}}int.html#considerations-for-64-bit-signed-integers) If you don't want to change the integer size, you can remove this statement in the [**Statements** list](#statements-list).
- **Missing Primary Key** represents a statement that does not define an explicit primary key for a table. [Defining an explicit primary key on every table is recommended.](../{{version_prefix}}schema-design-table.html#select-primary-key-columns)

{{site.data.alerts.callout_success}}
For more details on why these suggestions are made, see [Differences from other databases](../{{version_prefix}}migration-overview.html#differences-from-other-databases).
{{site.data.alerts.end}}

## Statements list

The **Statements** list displays the result of analyzing each statement in the `.sql` file that you uploaded. The numbers from the [**Summary Report**](#summary-report) are displayed above the list of statements.

To [finalize the schema](#finalize-the-schema) and create a new database for migration, click **Finalize Schema**. The schema must have zero errors.

If the **Finalize Schema** button is disabled, use the **Statements** list to [update the schema](#update-the-schema). Navigate the list by scrolling or by clicking the arrows and **Scroll to Top** button on the bottom-right.

By default, the **Statements** list displays both successful and failed statements. To view only the statements that failed, check **Collapse successful statements**.

Statements are displayed as follows:

<ul>
<li>A statement that succeeded is displayed without further detail.</li>
<li>A statement that failed is displayed with <code>[error]</code> and a message with error details. If the failure was due to an incidental error, the message also states: <code>This error may automatically resolve once an earlier statement no longer errors</code>.</li>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li>A statement that could not be converted due to incompatible syntax is displayed with <code>[incompat]</code>, a message with syntax details, and an <b>Acknowledge</b> checkbox.</li>
<li>A statement that has a SQL compatibility issue is displayed with <code>[compat note]</code>, a message with syntax details, and an <b>Acknowledge</b> checkbox.
<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
{{site.data.alerts.callout_info}}
Some statements with compatibility issues are automatically removed during conversion. If a statement was removed from the schema, this is stated in the statement's <code>[incompat]</code> or <code>[compat note]</code> message.
{{site.data.alerts.end}}
</section>
</li>
</section>

<li>A statement that has a suggestion is displayed with `[suggestion]`, a message with suggestion details, and an **Acknowledge** checkbox.</li>
</ul>

To edit a statement, click the **Edit** button or the statement itself and enter your changes. Your changes are saved when you click outside the statement, or when you click the **Save** button. Click **Cancel** to discard your changes.

To remove or add a statement, click the ellipsis above the statement and then click **Delete statement**, **Add statement above**, or **Add statement below**.

### Update the schema

Respond to errors and suggestions according to the following guidelines:

|                       Type                       |                                                                                                                                                                                                          Solution                                                                                                                                                                                                         |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Unimplemented feature                            | The feature does not yet exist on CockroachDB. Implement a workaround by editing the statement and adding statements. Otherwise, remove the statement from the schema. If a link to a tracking issue is included, click the link for further context. For more information about unimplemented features, see [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html#unimplemented-features). |
| Statement error                                  | Edit the statement to fix the error. Otherwise, remove the statement from the schema.                                                                                                                                                                                                                                                                                                                                     |
| Not executed                                     | Remove the statement from the schema. You can include it when [moving data to the new database](../{{version_prefix}}migration-overview.html#step-2-move-your-data-to-cockroachdb).                                                                                                                                                                                                                                       |
| Missing user                                     | Click the **Add User** button next to the error message. You must be a member of the [`admin` role](user-authorization.html). This adds the missing user to the cluster.                                                                                                                                                                                                                                                  |
| Incidental error                                 | Resolve the error in the earlier failed statement that caused the incidental error.                                                                                                                                                                                                                                                                                                                                                    |
| Incompatible statement (non-PostgreSQL dialects) | There is no equivalent syntax on CockroachDB. Implement a workaround by replacing the statement. Otherwise, remove the statement from the schema. Then check **Acknowledge**.                                                                                                                                                                            |
| Compatibility note (non-PostgreSQL dialects)     | Edit the statement to match the CockroachDB syntax. Then check **Acknowledge**.                                                                                                                                                                                                                                                                  |
| Suggestion                                       | Review and take any relevant actions indicated by the message. Then check **Acknowledge**.                                                                                                                                                                                                                                                                                              |

After updating the schema, [retry the migration](#retry-the-migration) to update the **Summary Report**. This is necessary in order to verify that the schema has zero errors and can be [finalized](#finalize-the-schema).

To export the current schema, click **Export SQL File** at the top of the **Statements** list.

### Retry the migration

To analyze a schema that you have [updated](#update-the-schema), click **Retry Migration** at the top of the **Statements** list. This updates the **Summary Report**.

This is necessary in order to verify that the schema has zero errors and can be [finalized](#finalize-the-schema).

## Finalize the schema

You can finalize the schema when the number of errors is zero. This value is displayed on the [Migrations table](#migrations-table), [**Summary Report**](#summary-report), and [**Statements** list](#statements-list).

To finalize the schema, click **Finalize Schema** when viewing the **Summary Report** or **Statements** list. A modal will open:

1. In the **Success** tab, click **Next**.

1. In the **Create Schema** tab, name the new database and select a user to own the database. Optionally click **Download SQL export** to download your schema file. This is useful for migrating your database to a different cluster. Then click **Finalize** to create the new database.

{{site.data.alerts.callout_success}}
After finalizing the schema and creating the new database, [move data into the database](../{{version_prefix}}migration-overview.html#step-2-move-your-data-to-cockroachdb) and [test your application](../{{version_prefix}}migration-overview.html#step-3-test-and-update-your-application).
{{site.data.alerts.end}}

## See also

- [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html)
