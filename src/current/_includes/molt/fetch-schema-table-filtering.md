Use the following flags to filter the data to be migrated.

<section class="filter-content" markdown="1" data-scope="mysql">
|      Filter type       |            Flag            |                               Description                                |
|------------------------|----------------------------|--------------------------------------------------------------------------|
| Table filter           | `--table-filter`           | POSIX regex matching table names to include across all selected schemas. |
| Table exclusion filter | `--table-exclusion-filter` | POSIX regex matching table names to exclude across all selected schemas. |

{{site.data.alerts.callout_info}}
`--schema-filter` does not apply to MySQL sources because MySQL tables belong directly to the database specified in the connection string, not to a separate schema.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="postgres oracle">
|      Filter type       |            Flag            |                                                                                       Description                                                                                        |
|------------------------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Schema filter          | `--schema-filter`          | [POSIX regex](https://wikipedia.org/wiki/Regular_expression) matching schema names to include; all matching schemas and their tables are moved. **Required** when migrating from Oracle. |
| Table filter           | `--table-filter`           | POSIX regex matching table names to include across all selected schemas.                                                                                                                 |
| Table exclusion filter | `--table-exclusion-filter` | POSIX regex matching table names to exclude across all selected schemas.                                                                                                                 |
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
When migrating from Oracle, you **must** include `--schema-filter` to name an Oracle schema to migrate. This prevents Fetch from attempting to load tables owned by other users. For example:

~~~
--schema-filter 'migration_schema'
~~~
</section>