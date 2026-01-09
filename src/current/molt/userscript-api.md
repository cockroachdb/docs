---
title: Userscript API
summary: A list of the available userscript functions, including descriptions and examples.
toc: true
docs_area: migrate
---

The userscript API provides configuration functions (`configureTargetSchema`, `configureTargetTables`), and lifecycle handlers (`onRowUpsert`, `onRowDelete`, `onWrite`) that allow you to define custom logic for specific tables and schemas.

## Common typescript definitions

~~~ ts
type RowHandlerFn = (row: Row, metadata: Metadata) => Row | Record<string, Row[]> | null

// RowValue represents any value that can appear in a database column:
// - string: text or numbers (numbers are always stored as strings)
// - boolean: true/false values
// - null: empty/missing values
// - Row: nested objects (like JSON columns)
// - Array<RowValue>: arrays of any of these types
// NOTE: Numbers are always strings. Parse them when reading, convert back to string after calculations.
type RowValue = string | boolean | null | Row | Array<RowValue>

// Row represents a database row: column names mapped to their values.
type Row = { [column: string]: RowValue }
type Metadata = Row & {schema: string, table: string};

~~~

<!-- | Function | Description | 
|---|---|
| <a id="configure-target-schema"></a> `configureTargetSchema(targetSchemaName, handlers)` | test2 | -->

---
<a id="configure-target-schema"></a> 

## `configureTargetSchema(targetSchemaName, handlers)` 

`configureTargetSchema` registers schema-level handlers that run before staging and table-level processing. Use this to transform, filter, or reroute rows broadly across a target database schema.

TypeScript Signature:

~~~ ts
declare function configureTargetSchema(targetSchemaName: string, handlers: {
  onRowUpsert: RowHandlerFn
  onRowDelete: RowHandlerFn
}): void
~~~

<a id="configure-target-schema-on-row-upsert"></a> 

### `onRowUpsert(row, metadata)`

Called when a row is inserted or updated on the source database. Return one of the following types of values depending on your needs:

-  A **Row** to write to the default target database table it was destined for
- `{ [table: string]: Row[] }` to fan-out or reroute any number of Rows to multiple tables.
- `null` to skip writing this source data row modification to the target database

TypeScript Signature:

~~~ ts
declare function onRowUpsert(row: Row, metadata: Metadata): Row | Record<string, Row[]> | null
~~~

Example

~~~ ts
import * as api from "replicator@v2";

/**
 * This example demonstrates how to use configureTargetSchema() with onRowUpsert
 * and onRowDelete to transform and filter data during replication.
 *
 * What it does:
 * - Transform column values before writing (e.g., normalize data)
 * - Filter out upserts for tables other tables
 * - Apply different logic for upserts vs deletes
 */
api.configureTargetSchema("target_db.target_schema", {
  onRowUpsert: (row, metadata) => {
    // Transform a column before writing
    // Convert order status to uppercase for consistency
    if (metadata.table === "orders" && row.status) {
      row.status = row.status.toUpperCase();
    }

    // Drop non-target tables by returning null
    // Only replicate orders and customers tables
    if (metadata.table !== "orders" && metadata.table !== "customers") {
      return null;
    }

    return row;
  },

  onRowDelete: (row, metadata) => {
    // Pass deletes through unchanged by default, accept all tables
    return row;
  },
});
~~~

<a id="configure-target-schema-on-row-delete"></a> 

### `onRowDelete(row, metadata)`

Called when a row is deleted on the source database. Return one of the following types of values depending on your needs:

- A **Row** deletion to write to the default target database table it was destined for.
- `{ [table: string]: Row[] }` to fan-out or reroute any number of Row deletions to multiple tables.
- `null` to skip writing this source data row deletion to the target database.

Note: depending on the database source type, the row argument passed to onRowDelete may include the data columns for the deleted row, or may just include the primary key values.

TypeScript Signature:

~~~ ts
declare function onRowDelete(row: Row, metadata: Metadata): Row | Record<string, Row[]> | null
~~~
---

<a id="configure-target-tables"></a> 

## `configureTargetTables(tableNames, configuration)`

`configureTargetTables` registers table-level handlers that run when rows are staged and ready to be written to the target database. You can use this to define transformations, filters, or column-level behavior specific to certain tables. Table-level configuration gives you finer control than schema-level handlers, allowing you to perform transactional logic on the target database and use extra built-in features like ignoring source columns that don’t exist in the target table.

TypeScript Definitions:

~~~ ts
declare function configureTargetTables(tables: string[], configuration: {
  onRowUpsert: onRowUpsertFn
  onRowDelete: onRowDeleteFn
  onWrite:     onWriteFn
  ignore: { [k: Column]: boolean }
}): void

type onRowUpsertFn = (row: Row, meta: Metadata) => Row | null;
type onRowDeleteFn = (keyVals: string[], meta: Metadata) => string[] | null; // primary key values for a row, not the row itself
type onWriteFn = (rows: RowOp[]) => Promise<any>;

type RowOp = ({
    action: "delete";
} | {
    action: "upsert";
    data: Row;
}) & {
    before?: Row;
    meta: Metadata;
    pk: string[];
}
~~~

<a id="configure-target-tables-on-row-upsert"></a> 

### `onRowUpsert(row, metadata)`

Called when a row is inserted or updated on the source database, and when it is finally read from the staging database and being prepared to be written to the target database.

Possible return values:

- Return a new or modified Row to write it to the target table.
- Return null to discard the Row (it will not be written to the target table).

TypeScript Signature:

~~~ ts
declare function onRowUpsert(row: Row, meta: Metadata) => Row | null
~~~

Example

~~~ ts
import * as api from "replicator@v2";

/**
 * This example demonstrates how to use configureTargetTables() to enrich
 * and transform data during replication on a per-table basis.
 *
 * Use cases:
 * - Add computed or metadata columns during replication
 * - Transform data values based on business logic
 * - Enrich records with additional information
 */
api.configureTargetTables(["orders"], {
  onRowUpsert: (row, metadata) => {
    // Add a timestamp when the row was replicated
    const now = new Date().toISOString();
    row.replicated_at = now;

    // Convert status codes to full descriptions
    if (row.status_code) {
      const statusMap: { [key: string]: string } = {
        "1": "pending",
        "2": "processing",
        "3": "shipped",
        "4": "delivered",
        "5": "cancelled",
      };
      row.status_description = statusMap[row.status_code as string] || "unknown";
    }

    return row;
  },

  onRowDelete: (keys, metadata) => {
    // Pass delete operations through unchanged
    return keys;
  },
});
~~~

What this does:

Rounds and normalizes the amount column before writing.
Passes delete keys through unchanged.

<a id="configure-target-tables-on-row-delete"></a> 

### `onRowDelete(keys, metadata)`

Called when a row is deleted on the source database, and when its deletion is finally read from the staging database and being prepared to be written to the target database. Instead of the row being passed to `onRowDelete`, the primary key values of the Row being deleted will be passed instead in a list of strings. Can be used to transform deletes from the source database to accommodate a different target table schema.

Possible return values:

- Return a list of primary key values to perform the delete on the target table for that primary key
- Return `null` to discard the Row deletion (it will not be deleted from the target table).

TypeScript Signature:

~~~ ts
declare function onRowDelete(keyVals: string[], meta: Metadata) => string[] | null;
~~~

Example

~~~
import * as api from "replicator@v2";

/**
 * This example demonstrates how to use configureTargetTables() with onRowDelete
 * to conditionally filter or transform delete operations.
 *
 * What it does:
 * - Conditionally skip deletes based on primary key values (>= 1000 or EU)
 *
 * Note: The keys parameter is an array of primary key values in the order
 * they are defined in the table's PRIMARY KEY constraint.
 */
api.configureTargetTables(["orders"], {
  onRowUpsert: (row, metadata) => {
    // Pass upserts through unchanged
    return row;
  },

  onRowDelete: (keys, metadata) => {
    // keys is an array of primary key values in order: [id, region_code]
    // For a table with PRIMARY KEY (id, region_code), keys would be: ["123", "US"]

    const [orderId, regionCode] = keys;

    // Skip deletes for orders in the "EU" region
    if (regionCode === "EU") {
      return null; // Returning null prevents the delete
    }

    // Skip deletes for high-value order IDs (>= 1000)
    const id = parseInt(orderId as string);
    if (id >= 1000) {
      return null;
    }

    // Proceed with normal delete for all other orders
    return keys;
  },
});
~~~

## See also