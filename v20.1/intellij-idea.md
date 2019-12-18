---
title: Intellij IDEA
summary: Learn how to use IntelliJ IDEA with CockroachDB.
toc: true
---

You can use CockroachDB in [IntelliJ IDEA](https://www.jetbrains.com/idea/) as a [database data source](https://www.jetbrains.com/help/idea/managing-data-sources.html#data_sources), which lets you accomplish tasks like managing your database's schema from within your IDE.

## Support

As of CockroachDB {{page.version.version}}, IntelliJ IDEA only has **partial support**. This means that the application is mostly functional, but its integration still has a few rough edges.

### Versions

The level of support in this document was tested as of the following versions:

- CockroachDB v19.1.0-beta.20190225
- IntelliJ IDEA Ultimate 18.1.3
- PostgreSQL JDBC 41.1

{{site.data.alerts.callout_info}}
This feature should also work with other JetBrains IDEs, such as PyCharm, but Cockroach Labs has not yet tested its integration.
{{site.data.alerts.end}}

### Warnings & Errors

Users can expect to encounter the following behaviors when using CockroachDB within IntelliJ IDEA.

- **Warnings** do not require any action on the user's end and can be ignored. Note that even if a message indicates that it is an "error", it can still be treated as a warning by this definition.
- **Errors** require the user to take action to resolve the problem and cannot be ignored.

#### Warnings

##### [XXUUU] ERROR: could not decorrelate subquery...

<img src="{{ 'images/v2.1/intellij/XX000_error_could_not_decorrelate_subquery.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />

Displays once per load of schema.

<hr/>

##### [42883] ERROR: unknown function: pg_function_is_visible() Failed to retrieve...

<img src="{{ 'images/v2.1/intellij/42883_error_pg_function_is_visible.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />

Display periodically. Does not impact functionality.

#### Errors

##### [42703] org.postgresql.util.PSQLException: ERROR: column "n.xmin" does not exist

<img src="{{ 'images/v2.1/intellij/42073_error_column_n_xmin_does_not_exist.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />

Requires setting **Introspect using JDBC metadata** ([details below](#set-cockroachdb-as-a-data-source-in-intellij)).

<hr/>

## Set CockroachDB as a Data Source in IntelliJ

1. Launch the **Database** tool window. (**View** > **Tool Windows** > **Database**) <img src="{{ 'images/v2.1/intellij/01_database_tool_window.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />
1. Add a PostgreSQL data source. (**New (+)** > **Data Source** > **PostgreSQL**)<img src="{{ 'images/v2.1/intellij/02_postgresql_data_source.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />
1. On the **General** tab, enter your database's connection string:

	Field | Value
	------|-------
	**Host** | Your CockroachDB cluster's hostname
	**Port** | Your CockroachDB cluster's port. By default, CockroachDB uses port **26257**.
	**Database** | The database you want to connect to. Note that CockroachDB's notion of database differs from PostgreSQL's; you can see your cluster's databases through the [`SHOW DATABASES`](show-databases.html) command.
	**User** | The user to connect as. By default, you can use **root**.
	**Password** | If your cluster uses password authentication, enter the password.
	**Driver** | Select or install **PostgreSQL** using a version greater than or equal to 41.1. (Older drivers have not been tested.)

	<img src="{{ 'images/v2.1/intellij/03_general_tab.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />
1. Install or select a **PostgreSQL** driver. We recommend a version greater than or equal to 41.1.
1. If your cluster uses SSL authentication, go to the **SSH/SSL** tab, select **Use SSL** and provide the location of your certificate files.
1. Go to the **Options** tab, and then select **Introspect using JDBC metadata**.<img src="{{ 'images/v2.1/intellij/04_options_tab.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />
1. Click **OK**.

You can now use IntelliJ's [database tool window](https://www.jetbrains.com/help/idea/working-with-the-database-tool-window.html) to interact with your CockroachDB cluster.

## Report Issues with IntelliJ IDEA & CockroachDB

If you encounter issues other than those outlined above, please [file an issue on the `cockroachdb/cockroach` GitHub repo](https://github.com/cockroachdb/cockroach/issues/new?template=bug_report.md), including the following details about the environment where you encountered the issue:

- CockroachDB version ([`cockroach version`](cockroach-version.html))
- IntelliJ IDEA version
- Operating system
- Steps to reproduce the behavior
- If possible, a trace of the SQL statements sent to CockroachDB while the error is being reproduced using [SQL query logging](query-behavior-troubleshooting.html#sql-logging).

## See Also

+ [Client connection paramters](connection-parameters.html)
+ [Third-Party Database Tools](third-party-database-tools.html)
