Use the following flags to filter the data to be migrated:

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
|      Filter type       |            Flag            |                                                                   Description                                                                   |
|------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Schema filter          | `--schema-filter`          | [POSIX regex](https://wikipedia.org/wiki/Regular_expression) matching schema names to include; all matching schemas and their tables are moved. |
| Table filter           | `--table-filter`           | POSIX regex matching table names to include across all selected schemas.                                                                        |
| Table exclusion filter | `--table-exclusion-filter` | POSIX regex matching table names to exclude across all selected schemas.                                                                        |
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
When migrating from Oracle, you **must** include `--schema-filter` to name an Oracle schema to migrate. This prevents Fetch from attempting to load tables owned by other users. For example:

~~~
--schema-filter 'migration_schema'
~~~
</section>

{% if page.name != "migrate-bulk-load.md" %}
<section class="filter-content" markdown="1" data-scope="oracle">
#### Table filter userscript

When loading a subset of tables using `--table-filter`, you **must** provide a TypeScript userscript to specify which tables to replicate.

For example, the following `table_filter.ts` userscript filters change events to the specified source tables:

~~~ ts
import * as api from "replicator@v1";

// List the source tables (matching source names and casing) to include in replication
const allowedTables = ["EMPLOYEES", "PAYMENTS", "ORDERS"];

// Update this to your target CockroachDB database and schema name
api.configureSource("molt.migration_schema", {
  dispatch: (doc: Document, meta: Document): Record<Table, Document[]> | null => {
    // Replicate only if the table matches one of the allowed tables
    if (allowedTables.includes(meta.table)) {
      let ret: Record<Table, Document[]> = {};
      ret[meta.table] = [doc];
      return ret;
    }
    // Ignore all other tables
    return null;
  },
  deletesTo: (doc: Document, meta: Document): Record<Table, Document[]> | null => {
    // Optionally filter deletes the same way
    if (allowedTables.includes(meta.table)) {
      let ret: Record<Table, Document[]> = {};
      ret[meta.table] = [doc];
      return ret;
    }
    return null;
  },
});
~~~

Pass the userscript to MOLT Replicator with the `--userscript` [flag](#replicator-flags):

~~~
--userscript table_filter.ts
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
#### Table filter userscript

When loading a subset of tables using `--table-filter`, you **must** provide a TypeScript userscript to specify which tables to replicate.

For example, the following `table_filter.ts` userscript filters change events to the specified source tables:

~~~ ts
import * as api from "replicator@v1";

// List the source tables (matching source names and casing) to include in replication
const allowedTables = ["EMPLOYEES", "PAYMENTS", "ORDERS"];

// Update this to your target CockroachDB database and schema name
api.configureSource("molt.public", {
  dispatch: (doc: Document, meta: Document): Record<Table, Document[]> | null => {
    // Replicate only if the table matches one of the allowed tables
    if (allowedTables.includes(meta.table)) {
      let ret: Record<Table, Document[]> = {};
      ret[meta.table] = [doc];
      return ret;
    }
    // Ignore all other tables
    return null;
  },
  deletesTo: (doc: Document, meta: Document): Record<Table, Document[]> | null => {
    // Optionally filter deletes the same way
    if (allowedTables.includes(meta.table)) {
      let ret: Record<Table, Document[]> = {};
      ret[meta.table] = [doc];
      return ret;
    }
    return null;
  },
});
~~~

Pass the userscript to MOLT Replicator with the `--userscript` [flag](#replicator-flags):

~~~
--userscript table_filter.ts
~~~
</section>
{% endif %}