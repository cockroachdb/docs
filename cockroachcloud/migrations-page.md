---
title: Use the Schema Conversion Tool
summary: Use the Schema Conversion Tool to begin a database migration to CockroachDB.
toc: true
cloud: true
docs_area: migrate
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Migrations** page on the {{ site.data.products.db }} Console features a **Schema Conversion Tool** that helps you:

- Convert a schema from a PostgreSQL, MySQL, Oracle, or Microsoft SQL Server database for use with CockroachDB.
- Create a new {{ site.data.products.serverless }} database that uses the converted schema. You specify the target database and database owner when [migrating the schema](#migrate-the-schema). {% include cockroachcloud/migration/sct-self-hosted.md %}

    {{site.data.alerts.callout_info}}
    The **Migrations** page is used to convert a schema for use with CockroachDB and to create a new database that uses the schema. It does not include moving data to the new database. For details on all steps required to complete a database migration, see [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html).
    {{site.data.alerts.end}}

To view this page, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and click **Migration** in the **Data** section of the left side navigation.

## Convert a schema

The steps to convert your schema depend on your source dialect.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
    <button class="filter-button" data-scope="mssql">SQL Server</button>
</div>

<section class="filter-content" markdown="1" data-scope="oracle mssql">
{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}
</section>

<ol>
<li>With the <b>Schemas</b> tab open, click the <b>Add Schema</b> button. This opens the <b>Add SQL Schema</b> dialog.</li>
<li>In step 1 of the <b>Add SQL Schema</b> dialog, select the appropriate <b>Dialect</b> from the pulldown menu.</li>
<li>Configure the following defaults for schema conversion:

<ul>
<section class="filter-content" markdown="1" data-scope="postgres">
<li><b>INT type conversion</b>: On CockroachDB, <code>INT</code> is an alias for <code>INT8</code>, which creates 64-bit signed integers. On PostgreSQL, <code>INT</code> defaults to <code>INT4</code>. For details, see <a href="../{{version_prefix}}migration-overview.html#schema-design-best-practices">Schema design best practices</a>.</li> 
</section>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li><b>Casing of Identifiers:</b> Select <b>Keep case sensitivity</b> to enclose identifiers in double-quotes, and <b>Make case insensitive</b> to convert identifiers to lowercase. For details on how CockroachDB handles identifiers, see <a href="../{{version_prefix}}keywords-and-identifiers.html#identifiers">Identifiers</a>.</li>
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
<li><b>AUTO_INCREMENT Conversion Option:</b> We do not recommend using a sequence to define a primary key column. For details, see <a href="../{{version_prefix}}migration-overview.html#schema-design-best-practices">Schema design best practices</a>. To understand the differences between the <code><b>UUID</b></code> and <code><b>unique_rowid()</b></code></b> options, see the <a href="../{{version_prefix}}sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid">SQL FAQs</a>.</li>
<li><b>Enum Preferences:</b> On CockroachDB, <a href="../{{version_prefix}}enum.html"><code>ENUMS</code></a> are a standalone type. On MySQL, they are part of column definitions. You can select to either deduplicate the <code>ENUM</code> definitions or create a separate type for each column.</li>
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
<li><b>GENERATED AS IDENTITY Conversion Option:</b> We do not recommend using a sequence to define a primary key column. For details, see <a href="../{{version_prefix}}migration-overview.html#schema-design-best-practices">Schema design best practices</a>. To understand the differences between the <code><b>UUID</b></code> and <code><b>unique_rowid()</b></code></b> options, see the <a href="../{{version_prefix}}sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid">SQL FAQs</a>.</li>
</section>

<section class="filter-content" markdown="1" data-scope="mssql">
<li><b>IDENTITY Conversion Option:</b> We do not recommend using a sequence to define a primary key column. For details, see <a href="../{{version_prefix}}migration-overview.html#schema-design-best-practices">Schema design best practices</a>. To understand the differences between the <code><b>UUID</b></code> and <code><b>unique_rowid()</b></code></b> options, see the <a href="../{{version_prefix}}sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid">SQL FAQs</a>.</li>
</section>
</ul>

</li>
<li>Click <b>Next</b>.</li>
<section class="filter-content" markdown="1" data-scope="postgres mysql">
<li>Use either the <a href="#upload-file"><b>Upload File</b></a> or <a href="#use-credentials"><b>Use Credentials</b></a> option to add your schema.
</section>
</ol>

### Upload File
<a name="upload-a-sql-dump"></a>

The Schema Conversion Tool expects to analyze a SQL dump file containing only [data definition statements](../{{version_prefix}}sql-statements.html#data-definition-statements). 

<section class="filter-content" markdown="1" data-scope="postgres">
To generate an appropriate PostgreSQL schema file, run the [`pg_dump` utility](https://www.postgresql.org/docs/current/app-pgdump.html) and specify the `-s` or `--schema-only` options to extract **only the schema** of a PostgreSQL database to a `.sql` file.
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
To generate an appropriate MySQL schema file, run the [`mysqldump` utility](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) and specify the `-d` or `--no-data` options to extract **only the schema** of the MySQL database to a `.sql` file.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
To generate an appropriate Oracle schema file, run the [`expdp` utility](https://docs.oracle.com/cd/E11882_01/server.112/e22490/dp_export.htm#i1007509) to extract **only the schema** of the Oracle database to a `.sql` file.
</section>

<section class="filter-content" markdown="1" data-scope="mssql">
To generate an appropriate Microsoft SQL Server schema file, use either [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/tutorials/scripting-ssms?view=sql-server-ver16#script-a-database-by-using-the-script-option) or the equivalent [`mssql-scripter` utility](https://github.com/microsoft/mssql-scripter) to extract **only the schema** of the SQL Server database to a `.sql` file.
</section>

The dump file must be smaller than 4 MB. `INSERT` and `COPY` statements will be ignored in schema conversion. To add a schema file:

1. In step 2 of the **Add SQL Schema** dialog, click **Upload File**. Click the upload box and select a `.sql` file, or drop a `.sql` file directly into the box.
1. Click **Convert** and wait for the schema to be analyzed. A loading screen is displayed. Depending on the size and complexity of the SQL dump, analyzing the schema can require up to several minutes.
1. When analysis is complete, review the [**Summary Report**](#summary-report) and edit, add, or remove SQL statements in the [**Statements** list](#statements-list).

<section class="filter-content" markdown="1" data-scope="postgres mysql">
### Use Credentials

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The Schema Conversion Tool can connect directly to a PostgreSQL or MySQL database to obtain the schema. To add a schema using credentials:

1. In step 2 of the **Add SQL Schema** dialog, click **Use Credential**. Select the credentials to use. If the list is empty, this is because no credentials have been created for the selected database type. You can [add credentials](#add-database-credentials) directly from the pulldown menu.
1. Click **Convert** and wait for the schema to be analyzed. In the background, the Schema Conversion Tool runs the [`pg_dump`](https://www.postgresql.org/docs/current/app-pgdump.html) or [`mysqldump`](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) utility to obtain the schema.

    A loading screen is displayed. Depending on the size and complexity of the SQL dump, analyzing the schema can require up to several minutes.

1. When analysis is complete, review errors and suggestions in the [**Summary Report**](#summary-report). Apply bulk actions in the **Summary Report** and edit, add, or remove SQL statements in the [**Statements** list](#statements-list).

#### Add database credentials

{{site.data.alerts.callout_info}}
Credentials can be added for PostgreSQL and MySQL databases.
{{site.data.alerts.end}}

1. With the **Credentials** tab open, click the **Add Credential** button.
1. Provide the following information:
    - A **Credential Name** to associate with the credentials.
    - The **Dialect** of the database you are connecting to. Currently, PostgreSQL and MySQL are supported.
    - The **Host** for accessing the database.
    - The **Port** for accessing the database.
    - A valid **Username** and **Password** for accessing the database.
    - The **Database Name** to access. The Schema Conversion Tool will obtain the schema for this database.
    - The **SSL Mode** for accessing the database:
        - `None`: Do not force a secure connection.
        - `Verify CA`: Force a secure connection and verify that the server certificate is signed by a known CA.
        - `Verify Full`: Force a secure connection, verify that the server certificate is signed by a known CA, and verify that the server address matches that specified in the certificate.

If the credentials are valid, they will be added to the [**Credentials** table](#credentials-table) with a `VERIFIED` badge.

</section>

## Review the schema

Use the **Summary Report** and **Statements** list to [update the schema](#update-the-schema) and finalize it for migration.

The banner at the top of the page displays:

<ul>
<li>The number of <b>Statements Total</b> in the uploaded <code>.sql</code> file that were analyzed.</li>
<li>The number of <b>Errors</b> in SQL statements that are blocking <a href="#migrate-the-schema">schema migration</a>. Errors are further categorized and counted in the <a href="#summary-report"><b>Summary Report</b></a>.</li>
<li>The number of <b>Incidental Errors</b> in SQL statements that are caused by errors in other SQL statements.</li>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li>The number of <b>Incompatible Statements</b> that could not be converted because they have no equivalent syntax on CockroachDB.</li>
<li>The number of <b>Compatibility Notes</b> on differences in SQL syntax. Although these statements do not block schema migration, you should [update](#update-the-schema) them before migrating the schema.</li>
</section>

<li>The number of <b>Suggestions</b> regarding <a href="../{{version_prefix}}migration-overview.html#schema-design-best-practices">CockroachDB best practices</a>.</li>
</ul>

### Summary Report

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The **Summary Report** displays the results of the schema analysis and provides bulk actions you can apply to [update the schema](#update-the-schema).

To apply bulk actions to statements, refer to the tables in the Summary Report:

<ul>
<li><a href="#required-fixes">Required Fixes</a></li>
<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li>[Compatibility Notes](#compatibility-notes)</li>
</section>
<li><a href="#suggestions">Suggestions</a></li>
</ul>

{{site.data.alerts.callout_danger}}
Bulk actions **cannot** be undone after you [retry the migration](#retry-the-migration).
{{site.data.alerts.end}}

To edit, add, or delete individual statements, click the **Statements** tab to open the [**Statements** list](#statements-list). Errors and suggestions are displayed for each statement.

After updating the schema, click [**Retry Migration**](#retry-the-migration). If the schema has zero errors, click **Migrate Schema** to [migrate the schema](#migrate-the-schema) to a new {{ site.data.products.serverless }} database.

#### Required Fixes

**Required Fixes** indicate errors that must be resolved before you can [migrate the schema](#migrate-the-schema).

|        Column       |                                                                                                                                                                                                                                                                                                            Description                                                                                                                                                                                                                                                                                                             |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description         | A summary of the error type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Category            | The category of error:<ul><li>**Unimplemented Feature:** A statement that uses an [unimplemented feature](../{{version_prefix}}migration-overview.html#unimplemented-features).</li><li>**Uncreated User:** A statement that references a nonexistent user.</li><li>**Incompatibility:** (Non-PostgreSQL dialects) A statement that could not be converted because it has no equivalent syntax on CockroachDB.</li><li>**Uncategorized:** A statement that the tool did not or could not execute.</li><li>**Incidental:** A statement that failed because another SQL statement encountered one of the preceding error types.</ul> |
| Complexity          | The estimated difficulty of addressing the error.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Remaining Instances | The number of times the error still occurs on the provided schema. This number will change as you [update the schema](#update-the-schema) to fix errors. Click the `+` icon on the row to view up to 20 individual statements where this occurs.                                                                                                                                                                                                                                                                                                                                                                                   |
| Actions             | The option to **Add User** to add a missing SQL user, or **Delete** all statements that contain the error type. This cannot be undone after you [retry the migration](#retry-the-migration).                                                                                                                                                                                                                                                                                                                                                                                                                                       |

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
#### Compatibility Notes

**Compatibility Notes** indicate compatibility issues that do not block [schema migration](#migrate-the-schema).

|    Column   |                                                                            Description                                                                            |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | A summary of the SQL compatibility issue.                                                                                                                         |
| Complexity  | The estimated difficulty of addressing the suggestion.                                                                                                            |
| Instances   | The number of times the compatibility note occurs on the provided schema. Click the `+` icon on the row to view up to 20 individual statements where this occurs. |
| Actions     | The option to **Acknowledge** all instances of the compatibility note. This is not required for schema migration.                                                 |
</section>

#### Suggestions

**Suggestions** relate to [schema design best practices](../{{version_prefix}}migration-overview.html#schema-design-best-practices). They do not block [schema migration](#migrate-the-schema).

|    Column   |                                                                                                                                                                                                                                                                                                                                                                                                          Description                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | One of the following suggestion types:<br><ul><li> **Sequences:** A statement that uses a sequence to define a primary key column. [Using a sequence for a primary key column is not recommended.](../{{version_prefix}}create-sequence.html#considerations)</li><li>**Missing Primary Key:** A statement that does not define an explicit primary key for a table. [Defining an explicit primary key on every table is recommended.](../{{version_prefix}}schema-design-table.html#select-primary-key-columns)</li><li>**Index Set On Timestamp Related Column:** A statement that creates an index on a [`TIMESTAMP`/`TIMESTAMPTZ`](../{{version_prefix}}timestamp.html) column. [Indexing on sequential keys can negatively affect performance.](../{{version_prefix}}schema-design-indexes.html#best-practices)</li></ul> |
| Complexity  | The estimated difficulty of addressing the suggestion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Instances   | The number of times the suggestion occurs on the provided schema. Click the `+` icon on the row to view up to 20 individual statements where this occurs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Actions     | The option to **Acknowledge** all instances of the suggestion. This is not required for schema migration.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### Statements list

The **Statements** list displays the result of analyzing each statement in the `.sql` file that you provided. The numbers from the [**Summary Report**](#summary-report) are displayed above the list of statements.

To [migrate the schema](#migrate-the-schema) and create a new database for migration, click **Migrate Schema**. The schema must have zero errors.

If the **Migrate Schema** button is disabled, use the **Statements** list to [update the schema](#update-the-schema). Navigate the list by scrolling or by clicking the arrows and **Scroll to Top** button on the bottom-right.

By default, the **Statements** list displays both successful and failed statements. To view only the statements that failed, check **Collapse successful statements**.

Statements are displayed as follows:

<ul>
<li>A statement that succeeded is displayed without further detail.</li>
<li>A statement that failed is displayed with <code>[error]</code> and a message with error details. If the failure was due to an incidental error, the message also states: <code>This error may automatically resolve once an earlier statement no longer errors</code>.</li>

<section class="filter-content" markdown="1" data-scope="mysql oracle mssql">
<li>A statement that failed due to incompatible syntax is displayed with <code>[incompat]</code>, a message with syntax details, and an <b>Acknowledge</b> checkbox.</li>
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

## Export the schema

To export the current schema, click **Export SQL File** at the top of the [**Statements** list](#statements-list).

## Update the schema

To update the schema, apply bulk actions in the [**Summary Report**](#summary-report) or edit, add, or remove statements in the [**Statements** list](#statements-list).

|                   Category                   |                                                                                                                                                                                                          Solution                                                                                                                                                                                                         |   Bulk Actions   | Required for schema migration? |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|--------------------------------|
| Unimplemented feature                        | The feature does not yet exist on CockroachDB. Implement a workaround by editing the statement and adding statements. Otherwise, remove the statement from the schema. If a link to a tracking issue is included, click the link for further context. For more information about unimplemented features, see [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html#unimplemented-features). | Delete           | Yes                            |
| Uncreated user                               | Click the **Add User** button next to the error message. You must be a member of the [`admin` role](managing-access.html). This adds the missing user to the cluster.                                                                                                                                                                                                                                                     | Add User, Delete | Yes                            |
| Incidental                                   | Resolve the error in the earlier failed statement that caused the incidental error.                                                                                                                                                                                                                                                                                                                                       | Delete           | Yes                            |
| Incompatibility (non-PostgreSQL dialects)    | There is no equivalent syntax on CockroachDB. Implement a workaround by replacing the statement. Otherwise, remove the statement from the schema. Then check **Acknowledge**.                                                                                                                                                                                                                                             | Delete           | Yes                            |
| Uncategorized                                | Edit the statement to fix the error. Otherwise, remove the statement from the schema.                                                                                                                                                                                                                                                                                                                                     | Delete           | Yes                            |
| Compatibility note (non-PostgreSQL dialects) | Edit the statement to match the CockroachDB syntax. Then optionally check **Acknowledge**.                                                                                                                                                                                                                                                                                                                                | Acknowledge      | No                             |
| Suggestion                                   | Review and take any relevant actions indicated by the message. Then optionally check **Acknowledge**.                                                                                                                                                                                                                                                                                                                     | Acknowledge      | No                             |

After updating the schema, click [**Retry Migration**](#retry-the-migration). If the schema has zero errors, click **Migrate Schema** to [migrate the schema](#migrate-the-schema) to a new {{ site.data.products.serverless }} database.

### Retry the migration

To analyze a schema that you have [updated](#update-the-schema), click **Retry Migration** at the top of the **Summary Report** or **Statements** list.

This will verify that the schema has zero errors and can be [migrated](#migrate-the-schema).

### Migrate the schema

You can migrate the schema when the number of errors is zero. This value is displayed on the [Schemas table](#schemas-table), [**Summary Report**](#summary-report), and [**Statements** list](#statements-list).

To migrate the schema, click **Migrate Schema** when viewing the **Summary Report** or **Statements** list. A modal will open:

1. Name the new database and select a SQL user to own the database. 
1. Click **Migrate**.

After migrating the schema and creating the new database, [move data into the database](../{{version_prefix}}migration-overview.html#step-2-move-your-data-to-cockroachdb) and [test your application](../{{version_prefix}}migration-overview.html#step-3-test-and-update-your-application).

## Schemas table

If you have [added a schema to convert](#convert-a-schema), the following details are displayed when the **Schemas** tab is open:

|     Column    |                                                                                Description                                                                                |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Schema Name   | The filename of the `.sql` file that you added.                                                                                                                           |
| Status        | The status of the schema migration: `READY FOR REVIEW`, `READY TO MIGRATE`, or `MIGRATED`. You can [migrate](#migrate-the-schema) schemas with `READY TO MIGRATE` status. |
| Date Imported | The timestamp when the SQL dump was uploaded.                                                                                                                             |
| Last Updated  | The timestamp when the [SQL statements](#statements-list) were updated.                                                                                                   |
| Errors        | The number of SQL errors preventing a schema from attaining `READY TO MIGRATE` status.                                                                                    |

To view the [**Summary Report**](#summary-report) or [**Statements** list](#statements-list) for a migration, click the migration name.

## Credentials table

If you have added any external database credentials (PostgreSQL or MySQL only), the following details are displayed when the **Credentials** tab is open:

|      Column     |                                                    Description                                                    |
|-----------------|-------------------------------------------------------------------------------------------------------------------|
| Credential Name | The name associated with the access credentials. A `VERIFIED` badge will display if the credentials are verified. |
| Dialect         | The type of database being accessed.                                                                              |
| Host / Port     | The host and port used to access the database.                                                                    |
| Database Name   | The name of the database being accessed.                                                                          |
| Created At      | The timestamp when the credentials were successfully created.                                                     |

To delete or verify a set of credentials, select the appropriate option in the **Actions** column.

## See also

- [Migrate Your Database to CockroachDB](../{{version_prefix}}migration-overview.html)
