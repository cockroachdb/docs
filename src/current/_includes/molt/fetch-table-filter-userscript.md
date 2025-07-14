#### Table filter userscript

When migrating only a subset of tables using `--table-filter`, you **must** supply a userscript that filters change events to those tables. For example, save the following as `table_filter.ts`:

~~~ ts
import * as api from "replicator@v1";

// List the source tables (matching source names) to include in replication
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

Pass the userscript to MOLT Fetch with the `--userscript` [replication flag](#replication-flags):

~~~
--replicator-flags "--userscript table_filter.ts"
~~~