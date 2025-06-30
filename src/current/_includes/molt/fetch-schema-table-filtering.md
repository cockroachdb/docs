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

#### Table filter userscript

When migrating only a subset of tables using `--table-filter`, you **must** supply a userscript that filters change events to those tables. For example, save the following as `table_filter.ts`:

~~~ ts
import * as api from "replicator@v1";

// List the source tables (matching case) to include in replication
const allowedTables = ["EMPLOYEES", "PAYMENTS", "ORDERS"];

// Update this to your target CockroachDB database and schema name
api.configureSource("defaultdb.migration_schema", {
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

Then pass the userscript to MOLT Fetch using `--replicator-flags`:

~~~ shell
molt fetch \
  --source $SOURCE \
  --target $TARGET \
  --schema-filter schema_to_migrate \
  --table-filter 'employees|payments|orders' \
  --replicator-flags "--userscript table_filter.ts"
~~~
</section>