---
title: Userscript API
summary: A list of the available userscript functions, including descriptions and examples.
toc: true
docs_area: migrate
---

Userscripts allow you to define how rows are transformed, filtered, and routed before [MOLT Replicator]({% link molt/molt-replicator.md %}) writes them to the target database.

The userscript API provides configuration functions (`configureTargetSchema`, `configureTargetTables`), and lifecycle handlers (`onRowUpsert`, `onRowDelete`, `onWrite`) that allow you to define custom logic for specific tables and schemas.

The [userscript cookbook]({% link molt/userscript-cookbook.md %}) includes example scenarios that further demonstrate how to use this API.

## Userscript functions list

- [`configureTargetSchema(targetSchemaName, handlers)`](#configure-target-schema)
  - [`onRowUpsert(row, metadata)`](#configure-target-schema-on-row-upsert)
  - [`onRowDelete(row, metadata)`](#configure-target-schema-on-row-delete)
- [`configureTargetTables(tableNames, configuration)`](#configure-target-tables)
  - [`onRowUpsert(row, metadata)`](#configure-target-tables-on-row-upsert)
  - [`onRowDelete(keys, metadata)`](#configure-target-tables-on-row-delete)
  - [`onWrite(rows, metadata)`](#configure-target-tables-on-write)
      - `getTX()`
          - `getTX().query(sql, ...params)`
          - `getTX().exec(sql, ...params)`
          - `getTX().columns()`
          - `getTX().schema()`
          - `getTX().table()`
      - `write(rows)`
- `console`

## Common TypeScript definitions

These TypeScript definitions are referenced throughout the API and describe the object structures you will deal with when writing userscript handler functions.

{% include_cached copy-clipboard.html %}
~~~ ts
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

// Metadata includes the row's schema name and table name. 
type Metadata = Row & {schema: string, table: string};
~~~

<!-- As shown above, the `RowHandlerFn` type receives a source `Row` and `Metadata` (the `Metadata` type includes the row's `schema` name and `table` name).

The `RowHandlerFn` type returns either:

- A modified row
- A table-to-rows mapping (for fan-out)
- `null` (to skip writing or deleting)

The `RowHandlerFn` type forms the basis of the `configureTargetSchema` lifecycle handlers, defined below. -->

## Userscript functions reference

<a id="configure-target-schema"></a> 

### `configureTargetSchema(targetSchemaName, handlers)` 

`configureTargetSchema` registers schema-level handlers that run before staging and table-level processing. Use this to transform, filter, or reroute rows broadly across a target database schema.

#### TypeScript Signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function configureTargetSchema(targetSchemaName: string, handlers: {
  onRowUpsert: RowHandlerFn
  onRowDelete: RowHandlerFn
}): void

type RowHandlerFn = (row: Row, metadata: Metadata) => Row | Record<string, Row[]> | null
~~~

`Row` and `Metadata` are defined in [Common TypeScript definitions](#common-typescript-definitions).

<a id="configure-target-schema-on-row-upsert"></a> 

#### `onRowUpsert(row, metadata)`

`onRowUpsert` is called when a row is inserted or updated on the source database. Because it's a handler for the `configureTargetSchema` function, it's called before staging and table-level processing. It returns a value of one of the following types:

-  A modified `Row` to write to the default target database table.
- `{ [table: string]: Row[] }`, to fan-out or reroute any number of `Rows` to multiple tables.
- `null`, to skip writing this source data row modification to the target database.

##### TypeScript Signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowUpsert(row: Row, metadata: Metadata): Row | Record<string, Row[]> | null
~~~
`Row` and `Metadata` are defined in [Common TypeScript definitions](#common-typescript-definitions).

##### Example

The example below demonstrates how to use `configureTargetSchema` with `onRowUpsert` to transform and filter data during replication. 

This function is called during upserts. It uppercases the value in the `status` field of the `orders` table, and it prevents the replication of non-target tables (that is, tables other than `orders` and `customers`).

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

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

#### `onRowDelete(row, metadata)`

`onRowDelete` is called when a row is deleted on the source database. It returns a value of one of the following types:

- A `Row` deletion to write to the default target database table.
- `{ [table: string]: Row[] }`, to fan-out or reroute any number of `Row` deletions to multiple tables.
- `null`, to skip writing this source data row deletion to the target database. This row will not be deleted on the target.

{{site.data.alerts.callout_info}}
Depending on the database source type, the `row` argument passed to `onRowDelete` may include the data columns for the deleted row, or may just include the primary key values.
{{site.data.alerts.end}}

##### TypeScript Signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowDelete(row: Row, metadata: Metadata): Row | Record<string, Row[]> | null
~~~
`Row` and `Metadata` are defined in [Common TypeScript definitions](#common-typescript-definitions).

##### Example

The example below demonstrates how to use `configureTargetSchema` with `onRowDelete` to transform and filter data during replication.

This function is called during deletions. The source primary key `(pk1, pk2)` differs from the target primary key `(id1, id2)` in name and in value. The function adds 100 to the values in the source primary key, and maps them to the target primary key fields for proper delete matching.
 
~~~ ts
import * as api from "replicator@v2";
api.configureTargetSchema("target_db.target_schema", {
  onRowUpsert: (row, metadata) => {
    // Pass upserts through unchanged by default, accept all tables
    return row;
  },

  onRowDelete: (row, metadata) => {
    // Map source PK columns (pk1, pk2) to target PK columns (id1, id2)
    // and add 100 to each value for proper delete matching
    if (metadata.table === "items") {
      const transformedRow = {
        id1: (parseInt(row.pk1 as string) + 100).toString(),
        id2: (parseInt(row.pk2 as string) + 100).toString(),
      };
      return transformedRow;
    }

    // All other tables/rows are passed through unchanged
    return row;
  },
});
~~~

---

<a id="configure-target-tables"></a> 

### `configureTargetTables(tableNames, configuration)`

`configureTargetTables` registers table-level handlers that run after rows are staged and are ready to be written to the target database. You can use this function to define transformations, filters, or column-level behaviors that are specific to certain tables. 

Table-level configuration provides finer control than schema-level handlers, allowing you to perform transactional logic on tables in the target database.

#### TypeScript signature

{% include_cached copy-clipboard.html %}
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

`Row` and `Metadata` are defined in [Common TypeScript definitions](#common-typescript-definitions).

<a id="configure-target-tables-on-row-upsert"></a> 

#### `onRowUpsert(row, metadata)`

`onRowUpsert` is called when a row is inserted or updated on the source database. Because it's a handler for the `configureTargetTables` function, it's called after rows are staged and are ready to be written to the target database. It returns a value of one of the following types:

-  A modified `Row` to write to the default target database table.
- `null`, to skip writing this source data row modification to the target database.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowUpsert(row: Row, meta: Metadata) => Row | null
~~~

##### Example

This example demonstrates how to use `configureTargetTables` to transform data during upserts, on a per-table basis.

This implementation adds a `replicated_at` column to the row, and it sets its value to the current time. It also adds a `status_description` column to the row, deriving its value from the value in the existing `status_code` field.

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

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

<a id="configure-target-tables-on-row-delete"></a> 

#### `onRowDelete(keys, metadata)`

`onRowDelete` is called when a row is deleted on the source database. Because it's a handler for the `configureTargetTables` function, it's called after rows are staged and are ready to be written to the target database. Unlike `configureTargetSchema`'s `onRowDelete` handler, which receives a whole `row` as an input, this function receives only that row's primary keys as a list of strings called `keyVals`.

It returns a value of one of the following types:

- A list of primary key values, defining the row on the target table to delete.
- `null`, to skip writing this source data row deletion to the target database. This row will not be deleted on the target.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowDelete(keyVals: string[], meta: Metadata) => string[] | null;
~~~

##### Example

This example demonstrates how to use `configureTargetTables` with `onRowDelete` to conditionally filter or transform delete operations.

This implementation skips deleting any row in the `EU` region, or whose `orderId` is greater than or equal to 1000.

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

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

<a id="configure-target-tables-on-write"></a> 

#### `onWrite(rows, metadata)`

This handler is called after `onRowUpsert` or `onRowDelete` for each of the passed-in rows. The onWrite handler lets you override MOLT Replicator’s default behavior when rows are written to the target database. It is called right before the final commit, after all schema-level and table-level processing has completed. A commit will be scheduled once `onWrite` returns.

##### `getTX()`
###### `getTX().query(sql, ...params)`
###### `getTX().exec(sql, ...params)`
###### `getTX().columns()`
###### `getTX().schema()`
###### `getTX().table()`
##### `write(rows)`

## See also