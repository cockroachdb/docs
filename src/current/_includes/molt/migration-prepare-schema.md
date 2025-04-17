<section class="filter-content" markdown="1" data-scope="postgres">
{{site.data.alerts.callout_info}}
CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely compatible with PostgreSQL syntax. For syntax differences, refer to [Features that differ from PostgreSQL]({% link {{ site.current_cloud_version }}/postgresql-compatibility.md %}#features-that-differ-from-postgresql).
{{site.data.alerts.end}}
</section>

{% include molt/migration-schema-design-practices.md %}

1. Convert your database schema to an equivalent CockroachDB schema.

	The simplest method is to use the [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) to convert your schema line-by-line. The tool accepts `.sql` files and will convert the syntax, identify [unimplemented features and syntax incompatibilities]({% link {{ site.current_cloud_version }}/migration-overview.md %}#unimplemented-features-and-syntax-incompatibilities) in the schema, and suggest edits according to [CockroachDB best practices]({% link {{ site.current_cloud_version }}/migration-overview.md %}#schema-design-best-practices).

	The Schema Conversion Tool requires a free [CockroachDB {{ site.data.products.cloud }} account]({% link cockroachcloud/create-an-account.md %}). If this is not an option for you, do one of the following: 
	- Enable automatic schema creation when [loading data](#step-3-load-data-into-cockroachdb) with MOLT Fetch. The [`--table-handling drop-on-target-and-recreate`]({% link molt/molt-fetch.md %}#target-table-handling) option creates one-to-one [type mappings]({% link molt/molt-fetch.md %}#type-mapping) between the source database and CockroachDB and works well when the source schema is well-defined. 
	- Manually convert the schema according to the [schema design best practices]({% link {{ site.current_cloud_version }}/migration-overview.md %}#schema-design-best-practices){% comment %}and data type mappings{% endcomment %}. You can also [export a partially converted schema]({% link cockroachcloud/migrations-page.md %}#export-the-schema) from the Schema Conversion Tool to finish the conversion manually.

	For additional help, contact your account team.

1. Import the converted schema to a CockroachDB cluster.
	- When migrating to CockroachDB {{ site.data.products.cloud }}, use the Schema Conversion Tool to [migrate the converted schema to a new {{ site.data.products.cloud }} database]({% link cockroachcloud/migrations-page.md %}#migrate-the-schema).
	- When migrating to a {{ site.data.products.core }} CockroachDB cluster, pipe the [data definition language (DDL)]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements) directly into [`cockroach sql`]({% link {{ site.current_cloud_version }}/cockroach-sql.md %}). You can [export a converted schema file]({% link cockroachcloud/migrations-page.md %}#export-the-schema) from the Schema Conversion Tool.
		{{site.data.alerts.callout_success}}
		For the fastest performance, you can use a [local, single-node CockroachDB cluster]({% link {{ site.current_cloud_version }}/cockroach-start-single-node.md %}#start-a-single-node-cluster) to convert your schema.
		{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="mysql">
When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), syntax that cannot automatically be converted will be displayed in the [**Summary Report**]({% link cockroachcloud/migrations-page.md %}?filters=mysql#summary-report). These may include the following:

#### String case sensitivity

Strings are case-insensitive in MySQL and case-sensitive in CockroachDB. You may need to edit your MySQL data to get the results you expect from CockroachDB. For example, you may have been doing string comparisons in MySQL that will need to be changed to work with CockroachDB.

For more information about the case sensitivity of strings in MySQL, refer to [Case Sensitivity in String Searches](https://dev.mysql.com/doc/refman/8.0/en/case-sensitivity.html) from the MySQL documentation. For more information about CockroachDB strings, refer to [`STRING`]({% link {{ site.current_cloud_version }}/string.md %}).

#### Identifier case sensitivity

Identifiers are case-sensitive in MySQL and [case-insensitive in CockroachDB]({% link {{ site.current_cloud_version }}/keywords-and-identifiers.md %}#identifiers). When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), you can either keep case sensitivity by enclosing identifiers in double quotes, or make identifiers case-insensitive by converting them to lowercase.

#### `AUTO_INCREMENT` attribute

The MySQL [`AUTO_INCREMENT`](https://dev.mysql.com/doc/refman/8.0/en/example-auto-increment.html) attribute, which creates sequential column values, is not supported in CockroachDB. When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), columns with `AUTO_INCREMENT` can be converted to use [sequences]({% link {{ site.current_cloud_version }}/create-sequence.md %}), `UUID` values with [`gen_random_uuid()`]({% link {{ site.current_cloud_version }}/functions-and-operators.md %}#id-generation-functions), or unique `INT8` values using [`unique_rowid()`]({% link {{ site.current_cloud_version }}/functions-and-operators.md %}#id-generation-functions). Cockroach Labs does not recommend using a sequence to define a primary key column. For more information, refer to [Unique ID best practices]({% link {{ site.current_cloud_version }}/performance-best-practices-overview.md %}#unique-id-best-practices).

{{site.data.alerts.callout_info}}
Changing a column type during schema conversion will cause [MOLT Verify]({% link molt/molt-verify.md %}) to identify a type mismatch during data validation. This is expected behavior.
{{site.data.alerts.end}}

#### `ENUM` type

MySQL `ENUM` types are defined in table columns. On CockroachDB, [`ENUM`]({% link {{ site.current_cloud_version }}/enum.md %}) is a standalone type. When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), you can either deduplicate the `ENUM` definitions or create a separate type for each column.

#### `TINYINT` type

`TINYINT` data types are not supported in CockroachDB. The [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql) automatically converts `TINYINT` columns to [`INT2`]({% link {{ site.current_cloud_version }}/int.md %}) (`SMALLINT`).

#### Geospatial types

MySQL geometry types are not converted to CockroachDB [geospatial types]({% link {{ site.current_cloud_version }}/spatial-data-overview.md %}#spatial-objects) by the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql). They should be manually converted to the corresponding types in CockroachDB.

#### `FIELD` function

The MYSQL `FIELD` function is not supported in CockroachDB. Instead, you can use the [`array_position`]({% link {{ site.current_cloud_version }}/functions-and-operators.md %}#array-functions) function, which returns the index of the first occurrence of element in the array.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT array_position(ARRAY[4,1,3,2],1);
~~~

~~~
  array_position
------------------
               2
(1 row)
~~~

While MySQL returns 0 when the element is not found, CockroachDB returns `NULL`. So if you are using the `ORDER BY` clause in a statement with the `array_position` function, the caveat is that sort is applied even when the element is not found. As a workaround, you can use the [`COALESCE`]({% link {{ site.current_cloud_version }}/functions-and-operators.md %}#conditional-and-function-like-operators) operator.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table_a ORDER BY COALESCE(array_position(ARRAY[4,1,3,2],5),999);
~~~
</section>