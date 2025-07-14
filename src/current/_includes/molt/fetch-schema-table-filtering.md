MOLT Fetch can restrict which schemas (or users) and tables are migrated by using the `--schema-filter`, `--table-filter`, and `--table-exclusion-filter` flags:

|      Filter type       |            Flag            |                                                                   Description                                                                   |
|------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Schema filter          | `--schema-filter`          | [POSIX regex](https://wikipedia.org/wiki/Regular_expression) matching schema names to include; all matching schemas and their tables are moved. |
| Table filter           | `--table-filter`           | POSIX regex matching table names to include across all selected schemas.                                                                        |
| Table exclusion filter | `--table-exclusion-filter` | POSIX regex matching table names to exclude across all selected schemas.                                                                        |

{{site.data.alerts.callout_success}}
Use `--schema-filter` to migrate only the specified schemas, and refine which tables are moved using `--table-filter` or `--table-exclusion-filter`.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="oracle">
When migrating from Oracle, you **must** include `--schema-filter` to name an Oracle schema to migrate. This prevents Fetch from attempting to load tables owned by other users. For example:

~~~
--schema-filter 'migration_schema'
~~~
</section>

{% if page.name != "migrate-bulk-load.md" %}
<section class="filter-content" markdown="1" data-scope="mysql">
{% include molt/fetch-table-filter-userscript.md %}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include molt/fetch-table-filter-userscript.md %}
</section>
{% endif %}