#### Table filter userscript

When loading a subset of tables using `--table-filter`, you **must** provide a TypeScript userscript to specify which tables to replicate.

For example, the following `table_filter.ts` userscript filters change events to the specified source tables:

~~~ ts
import * as api from "replicator@v1";

// List the source tables (matching source names and casing) to include in replication
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