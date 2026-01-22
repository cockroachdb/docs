---
title: Userscript API
summary: A list of the available userscript functions, including descriptions and examples.
toc: true
docs_area: migrate
---

[Userscripts]({% link molt/userscript-overview.md %}) allow you to define how rows are transformed, filtered, and routed before [MOLT Replicator]({% link molt/molt-replicator.md %}) writes them to the target database.

The userscript API provides configuration functions (`configureTargetSchema`, `configureTargetTables`), and lifecycle handlers (`onRowUpsert`, `onRowDelete`, `onWrite`) that allow you to define custom logic for specific tables and schemas.

The [userscript cookbook]({% link molt/userscript-cookbook.md %}) includes example scenarios that further demonstrate how to use this API. Be sure to follow userscript [best practices](#best-practices).

## Access this API

To access the userscript API, [install MOLT Replicator **v1.3.0 or later**]({% link molt/molt-replicator.md %}#installation). The userscript API is accessible via the `replicator` library, which you should import at the top of your TypeScript file: `import * as api from "replicator@v2";`. The `replicator` library is included in the MOLT Replicator binary itself, so you do not need to install any external packages in order to run userscripts.

In addition to importing the API from the `replicator` library, you can download the [userscript type definitions file](https://replicator.cockroachdb.com/userscripts/replicator@v2.d.ts) and the [tsconfig.json file](https://replicator.cockroachdb.com/userscripts/tsconfig.json). Place these files in your working directory to enable autocomplete, inline documentation, and real-time error detection directly in your IDE.

## Userscript functions list

- [`configureTargetSchema(targetSchemaName, handlers)`](#configure-target-schema)
  - [`onRowUpsert(row, metadata)`](#configure-target-schema-on-row-upsert)
  - [`onRowDelete(row, metadata)`](#configure-target-schema-on-row-delete)
- [`configureTargetTables(tableNames, configuration)`](#configure-target-tables)
  - [`onRowUpsert(row, metadata)`](#configure-target-tables-on-row-upsert)
  - [`onRowDelete(keys, metadata)`](#configure-target-tables-on-row-delete)
  - [`onWrite(rows)`](#configure-target-tables-on-write)
- [`console`](#console)

## Common TypeScript definitions

The following TypeScript definitions are referenced throughout the API and describe the object structures you will deal with when writing userscript handler functions.

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

<a id="configure-target-schema"></a> 

## `configureTargetSchema(targetSchemaName, handlers)` 

`configureTargetSchema` registers schema-level handlers that run [before staging and table-level processing]({% link molt/userscript-overview.md %}#how-it-works). Use this to transform, filter, or reroute rows broadly across a target database schema.

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

#### Arguments

- `targetSchemaName`: The (case-sensitive) name of the schema in the **target** database.
- `handlers`: An object containing an [`onRowUpsert`](#configure-target-schema-on-row-upsert) and an [`onRowDelete`](#configure-target-schema-on-row-delete) handler function. Both handlers must be defined.

You can include multiple `configureTargetSchema` functions in your userscript, each with a different `targetSchemaName`. This enables you to define different functionality for different schemas within the same userscript.

<a id="configure-target-schema-on-row-upsert"></a> 

### `onRowUpsert(row, metadata)`

`onRowUpsert` is called when a row is inserted or updated on the source database. Because it's a handler for the [`configureTargetSchema`](#configure-target-schema) function, it is called [before staging and table-level processing]({% link molt/userscript-overview.md %}#how-it-works). 

#### TypeScript Signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowUpsert(row: Row, metadata: Metadata): Row | Record<string, Row[]> | null
~~~

##### Arguments

- A [`Row`](#common-typescript-definitions) object containing all of the column names for the row in the **source** database, mapped to their values in the **source** database.
- A [`Metadata`](#common-typescript-definitions) object containing the following (case-sensitive): 
  - The `schema` name for the row in the **target** database.
  - The `table` name for the row in the **source** database.

##### What to return

Return one of the following:

-  A modified `Row` to write to the target database, mapping all of the column names for the row in the **target** database to the values that will be written in those columns.
- `{ [table: string]: Row[] }`, to fan out or reroute any number of `Rows` to multiple or differently named tables on the **target** database.
- `null`, to skip writing this source data row modification to the **target** database.

{{site.data.alerts.callout_info}}
By default, a single returned `Row` will be routed to a table in the target database with the same name and casing as the source table. If the target table is named differently than the source table, you will need to use the mapping return value above, `{ [table: string]: Row[] }`, to reroute the row to the target table. This rerouting is only possible in the [`configureTargetSchema`](#configure-target-schema) handler, as the destination tables need to be defined prior to table-level handling. 

For more information about renaming tables, refer to the [Rename tables]({% link molt/userscript-cookbook.md %}#rename-tables) cookbook example.
{{site.data.alerts.end}}

#### Example

The following example demonstrates how to use [`configureTargetSchema`](#configure-target-schema) with `onRowUpsert` to transform and filter data during replication. 

The `onRowUpsert` handler is called during upserts on the source database. It uppercases the value in the `status` field of the `orders` table, and it prevents the replication of non-target tables (that is, tables other than `orders` and `customers`). It still passes deletions to all tables in [`onRowDelete`](#configure-target-schema-on-row-delete).

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

### `onRowDelete(row, metadata)`

`onRowDelete` is called when a row is deleted on the source database. Because it's a handler for the [`configureTargetSchema`](#configure-target-schema) function, it is called [before staging and table-level processing]({% link molt/userscript-overview.md %}#how-it-works).

#### TypeScript Signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowDelete(row: Row, metadata: Metadata): Row | Record<string, Row[]> | null
~~~

##### Arguments

- A [`Row`](#common-typescript-definitions) object containing information about the row's [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) values. It may also contain information about non-primary key columns, **but these are not guaranteed**. If the source and target tables have different names for the primary keys, the key/value mapping may come in one of the following forms, depending on the configuration of the source database:
    - The **source** primary key name(s) mapped to the **source** primary key value(s).
    - The **target** primary key name(s) mapped to the **source** primary key value(s).
    - Both of the above.
- A [`Metadata`](#common-typescript-definitions) object containing the following (case-sensitive): 
  - The `schema` name for the row in the **target** database.
  - The `table` name for the row in the **source** database.

##### What to return

Return one of the following:

- A `Row` object containing the **target** primary keys for the row to delete on the target database.
- `{ [table: string]: Row[] }`, to fan out or reroute any number of `Row` deletions to multiple **target** tables.
- `null`, to skip writing this source data row deletion to the **target** database. In other words, this row will not be deleted on the **target**.

{{site.data.alerts.callout_info}}
By default, a single returned `Row` will be routed to a table in the target database with the same name and casing as the source table. If the target table is named differently than the source table, you will need to use the mapping return value above, `{ [table: string]: Row[] }`, to reroute the row to the target table. This rerouting is only possible in the [`configureTargetSchema`](#configure-target-schema) handler, as the destination tables need to be defined prior to table-level handling. 

For more information, refer to the [Rename tables]({% link molt/userscript-cookbook.md %}#rename-tables) cookbook example.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If the source and target tables name the primary keys differently, you can't be certain that the `row` argument contains the target primary key names (it may contain only the source primary key names). 

This handler expects the **target** primary key names in the return value. Therefore, if you need to rename the primary keys between the source and the target, you'll need to check for the primary key values in the `row` argument using both the source and the target primary key names, and then make sure that the return value uses the **target** primary key names. Columns that are included in the return `Row` that are not in the target table will be ignored.

For more information, refer to the [Rename primary keys]({% link molt/userscript-cookbook.md %}#rename-primary-keys) cookbook example.
{{site.data.alerts.end}}

#### Example

The following example demonstrates how to use [`configureTargetSchema`](#configure-target-schema) with `onRowDelete` to transform and filter data during replication.

This function is called during deletions. It ensures that any row where `id < 100` is not deleted from the target. It passes upserts along unchanged. This is useful when you want to preserve critical reference data or system records in your target database based on their primary key or other columns, even if they're removed from the source.
 
 {% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

api.configureTargetSchema("defaultdb.public", {
  onRowUpsert: (row, metadata) => {
    // Pass through all upserts unchanged
    return row;
  },

  onRowDelete: (row, metadata) => {
    if (metadata.table === "items") {
      const id = Number(row.id);

      // Protect rows with id < 100 from deletion
      if (id < 100) {
        return null; // Filter out this delete
      }
    }

    // Allow delete to proceed if id >= 100 or table is not "items"
    return row;
  },
});
~~~

<a id="configure-target-tables"></a> 

## `configureTargetTables(tableNames, configuration)`

`configureTargetTables` registers table-level handlers that run [after rows are staged]({% link molt/userscript-overview.md %}#how-it-works) and ready to be written to the target database. You can use this function to define transformations, filters, or column-level behaviors that are specific to certain tables. 

Table-level configuration provides finer control than schema-level handlers. Specifically, the [`onWrite`](#configure-target-tables-on-write) handler function enables you to perform transactional logic on tables in the target database.

#### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function configureTargetTables(tables: string[], configuration: {
  onRowUpsert: onRowUpsertFn
  onRowDelete: onRowDeleteFn
  onWrite: onWriteFn
}): void

type onRowUpsertFn = (row: Row, meta: Metadata) => Row | null;
// onRowDeleteFn receives primary key values for a row, not the row itself
type onRowDeleteFn = (keyVals: string[], meta: Metadata) => string[] | null;
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

#### Arguments

- `tables`: A list of the (case-sensitive) names of the tables to write to in the **target** database. The handler functions will apply to all rows being routed to the tables in this list. Table names may be [fully qualified]({% link {{ site.current_cloud_version }}/sql-name-resolution.md %}) (for example, `defaultdb.public.table1`) or they may include only the name of the table (for example, `table1`).
- `configuration`: An object containing (optionally) an [`onRowUpsert`](#configure-target-tables-on-row-upsert), an [`onRowDelete`](#configure-target-tables-on-row-delete), and an [`onWrite`](#configure-target-tables-on-write) handler function.
    - If [`onRowUpsert`](#configure-target-tables-on-row-upsert) is defined, [`onRowDelete`](#configure-target-tables-on-row-delete) must also be defined, and vice versa.
    - If a handler function isn't defined, its `row` or `keys` argument is passed to the target without alteration.

You can include multiple `configureTargetTables` functions in your userscript, each with different tables included in the `tables` argument. This enables you to define different functionality for different tables within the same userscript.

<a id="configure-target-tables-on-row-upsert"></a> 

### `onRowUpsert(row, metadata)`

`onRowUpsert` is called when a row is inserted or updated on the source database. Because it's a handler for the [`configureTargetTables`](#configure-target-tables) function, it is called [after rows are staged]({% link molt/userscript-overview.md %}#how-it-works) and ready to be written to the target database. 

#### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowUpsert(row: Row, meta: Metadata) => Row | null
~~~

##### Arguments

- A [`Row`](#common-typescript-definitions) object containing all of the column names for the row in the **source** database, mapped to their values as supplied by the schema-level handlers.
- A [`Metadata`](#common-typescript-definitions) object containing the following (case-sensitive): 
  - The `schema` name for the row in the **target** database.
  - The `table` name for the row in the **target** database.

##### What to return

Return one of the following:

-  A modified `Row` to write to the target database, mapping all of the column names for the row in the **target** database to the values supplied by the schema-level handlers.
- `null`, to skip writing this source data row modification to the target database.

#### Example

The following example demonstrates how to use [`configureTargetTables`](#configure-target-tables) to transform data during upserts, on a per-table basis.

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

### `onRowDelete(keys, metadata)`

`onRowDelete` is called when a row is deleted on the source database. Because it's a handler for the [`configureTargetTables`](#configure-target-tables) function, it is called [after rows are staged]({% link molt/userscript-overview.md %}#how-it-works) and ready to be written to the target database. 

#### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ ts
declare function onRowDelete(keyVals: string[], meta: Metadata) => string[] | null;
~~~

##### Arguments

- A list of the [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) values that define the row to be deleted on the **target** database, as supplied by the schema-level handlers. This is only a list of the key values, not a mapping of key names to values.
- A [`Metadata`](#common-typescript-definitions) object containing the following (case-sensitive): 
  - The `schema` name for the row in the **target** database.
  - The `table` name for the row in the **target** database.

##### What to return

Return one of the following:

- A list of primary key values, defining the row on the **target** table to delete.
- `null`, to skip writing this data row deletion to the **target** database. In other words, this row will not be deleted on the **target**.

#### Example

The following example demonstrates how to use [`configureTargetTables`](#configure-target-tables) with `onRowDelete` to conditionally filter or transform delete operations.

This implementation skips deleting any row in the `EU` region, or whose `orderId` is greater than or equal to `1000`.

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

### `onWrite(rows)`

`onWrite` is called after [`onRowUpsert`](#configure-target-tables-on-row-upsert) and [`onRowDelete`](#configure-target-tables-on-row-delete) for each of the passed-in rows. The `onWrite` handler lets you override [MOLT Replicator's default behavior]({% link molt/molt-replicator.md %}#how-it-works) when rows are written to the target database. It is called right before the final commit, after all schema-level and table-level processing has completed. A [commit]({% link {{ site.current_cloud_version }}/commit-transaction.md %}) will be scheduled once `onWrite` returns.

Use `onWrite` when you want full control over how data is applied to the target. Typical use cases include:

- Adding custom validation, auditing, or logging before a write.
- Performing complex cross-table logic.
- Running [stored procedures]({% link {{ site.current_cloud_version }}/stored-procedures.md %}) or custom SQL statements.
- Handling [retries]({% link {{ site.current_cloud_version }}/transactions.md %}#transaction-retries) or [error]({% link {{ site.current_cloud_version }}/common-errors.md %}) conditions manually.
- Implementing custom dead-letter queues for failed row writes to the target.

{{site.data.alerts.callout_info}}
Any data written to the target database is not committed in `onWrite`. It will be scheduled to be committed after `onWrite` returns.
{{site.data.alerts.end}}

#### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ts
declare function onWrite(rows: RowOp[]) => Promise<any>

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

##### Arguments

- A list of `RowOp` objects. Together, these describe every upsert and deletion that is planned to be written to the target tables defined by the `tables` argument of [`configureTargetTables`](#configure-target-tables). Each `RowOp` object includes: 
    - The relevant `action` (`"upsert"` or `"delete"`)
    - The row's primary keys (`pk`)
    - The row's metadata (`meta`)
    - In the case of an upsert, the `Row` to be written to the target (`data`)
    - Depending on the configuration of the source database, the value of this `Row` on the source database before it was updated/deleted (`before`)

##### What to return

`onWrite` is asynchronous, so it must return a promise once processing is complete. This is typically the result of [`api.write(rows)`](#on-write-write), which returns a promise that will be resolved on successfully writing rows to the target database.

#### `onWrite` functions

[`onWrite`](#configure-target-tables-on-write) has a set of functions available to it that allows [transactional]({% link {{ site.current_cloud_version }}/transactions.md %}) logic to be performed on the target database:

- [`getTX()`](#on-write-get-tx)
    - [`getTX().query(sql, ...params)`](#on-write-get-tx-query)
    - [`getTX().exec(sql, ...params)`](#on-write-get-tx-exec)
    - [`getTX().columns()`](#on-write-get-tx-columns)
    - [`getTX().schema()`](#on-write-get-tx-schema)
    - [`getTX().table()`](#on-write-get-tx-table)
- [`write(rows)`](#on-write-write)

Use `api.getTX()` to run your own SQL statements within a single [transaction]({% link {{ site.current_cloud_version }}/transactions.md %}). Use `api.write(rows)` to write the rows to the target database. Mix both approaches by handling some operations manually and passing others to `api.write(rows)`. Read detailed descriptions of these functions below.

{{site.data.alerts.callout_danger}}
The preceding transactional logic helpers can **only** be used within [`onWrite`](#configure-target-tables-on-write) for the table-level handlers. They cannot be used within the schema-level handlers, or within the table-level [`onRowUpsert`](#configure-target-tables-on-row-upsert) or [`onRowDelete`](#configure-target-tables-on-row-delete) handlers. An error will be returned for [`api.write(rows)`](#on-write-write) or [`api.getTx()`](#on-write-get-tx) if they are used in a handler where transactional logic is not supported.
{{site.data.alerts.end}}

<a id="on-write-get-tx"></a> 

#### `getTX()`

The `getTX` function provides access to a managed [transaction]({% link {{ site.current_cloud_version }}/transactions.md %}) on the target database that you can use inside your userscript. It allows you to perform direct SQL operations, such as reads, writes, or schema checks, within a single transactional context. This is especially useful when you need to enforce additional constraints, perform cross-table validation, or implement custom transactional logic during replication.

When `getTX` is called, it returns a transaction object bound to the current replication operation. All operations executed through this object (exec, query, etc.) occur atomically within that transaction. Once your handler finishes execution, the transaction is automatically scheduled to be committed or rolled back depending on whether an error occurred. `getTX` is only available within [`onWrite`](#configure-target-tables-on-write).

<a id="on-write-get-tx-query"></a> 

#### `getTX().query(sql, ...params)`

This function executes a SQL query within the current replication [transaction]({% link {{ site.current_cloud_version }}/transactions.md %}). It returns an async iterable of result rows, allowing you to read data from the target database for validation or lookups.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ts
/**
* Execute a SQL query that returns some number of rows.
* @param query - A SQL command to execute in the target
* database. Substitution parameter syntax is target database-specific.
* @param params - Values for substitution parameters.
* @returns A promise that will resolve to an iterable over the
* column values.
*/
function query(query: string, ...params: any): Promise<Iterable<any[]>>;
~~~

<a id="on-write-get-tx-exec"></a> 

#### `getTX().exec(sql, ...params)`

This function runs a SQL statement (such as [`UPDATE`]({% link {{ site.current_cloud_version }}/update.md %}), [`INSERT`]({% link {{ site.current_cloud_version }}/insert.md %}), or [`DELETE`]({% link {{ site.current_cloud_version }}/delete.md %})) in the current [transaction]({% link {{ site.current_cloud_version }}/transactions.md %}). It does not return results. Use it to modify data or to apply additional logic atomically with replication. Changes will not be [committed]({% link {{ site.current_cloud_version }}/commit-transaction.md %}) until after [`onWrite`](#configure-target-tables-on-write) returns.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ ts
/**
* Execute a SQL command that returns no rows.
* @param query - A SQL command to execute in the target
* database. Substitution parameter syntax is target-specific.
* @param params - Values for substitution parameters.
* @returns A promise that resolves when the database command
* has completed.
*/
function exec(query: string, ...params: any): Promise<void>;
~~~

<a id="on-write-get-tx-columns"></a> 

#### `getTX().columns()`

This function returns an array of column metadata for the target table, including column name, type, primary key status and ignored status. Use this to inspect the schema and column details of the destination table during replication, and to apply logic dynamically based on target columns.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ts
/**
* Returns schema information about the target table.
* Columns are returned such that primary key columns will be
* sorted first and in their index order.
* @returns An array of TargetColumn objects describing the
* target table's schema.
*/
function columns(): TargetColumn[];

/**
* A TargetColumn provides a view of MOLT Replicator's schema introspection of a
* table column in the target database.
*/
type TargetColumn = {
  /**
  * The column's DEFAULT expression, if one exists.
  */
  defaultExpr?: string;
  /**
  * True if the column wouldn't normally be operated on by Replicator.
  */
  ignored: boolean;
  /**
  * A quoted, SQL-safe representation of the column name.
  */
  name: string;
  /**
  * True if the column is part of the primary key.
  */
  primary: boolean;
  /**
  * The type of the SQL column.
  */
  type: string;
};
~~~

##### Example

{% include_cached copy-clipboard.html %}
~~~ts
const tx = api.getTX();
const columns = await tx.columns();
console.log(columns);
// Output:
// [
//   { ignored: false, name: "pk1", primary: true, type: "INT4" },
//   { ignored: false, name: "pk2", primary: true, type: "INT4" },
//   { defaultExpr: "default_value", ignored: false, name: "text_column", primary: false, type: "TEXT" }
// ]
~~~

<a id="on-write-get-tx-schema"></a> 

#### `getTX().schema()`

This function returns the [fully-qualified]({% link {{ site.current_cloud_version }}/sql-name-resolution.md %}), quoted name of the target schema (for example, `db.public`). Use this to identify or reference the schema in SQL queries or metadata operations.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ts
/**
* Returns a quoted, SQL-safe representation of the target
* schema, that is suitable for usage in getTX() queries and commands.
* @returns A string containing the target schema name. (e.g. db.public)
*/
function schema(): string;
~~~

<a id="on-write-get-tx-table"></a> 

#### `getTX().table()`

This function returns the [fully-qualified]({% link {{ site.current_cloud_version }}/sql-name-resolution.md %}), quoted name of the target table (for example, `db.public.users`). Use this to reference the table in SQL queries or for metadata inspection.

##### TypeScript signature

{% include_cached copy-clipboard.html %}
~~~ts
/**
* Returns a quoted, fully-qualified, SQL-safe representation of
* the target table.
* @returns A string containing the fully-qualified target table name.
*   (e.g. db.public.users)
*/
function table(): string;
~~~

<a id="on-write-write"></a> 

#### `write(rows)`

This function writes the provided rows to the target database using the standard replication logic. Use this to apply inserts, updates, or deletes as part of your custom replication workflow.

{{site.data.alerts.callout_info}}
`write` does not commit the changes to the target database. Changes will be committed only after [`onWrite`](#configure-target-tables-on-write) returns.
{{site.data.alerts.end}}

##### TypeScript signature

~~~ts
function write(rows: RowOp[]): Promise<void>;
~~~

#### `onWrite` example

The following example demonstrates how to use the [`getTX()`](#on-write-get-tx) and [`write()`](#on-write-write) API functions within [`onWrite`](#configure-target-tables-on-write) to access the [transaction]({% link {{ site.current_cloud_version }}/transactions.md %}) context and execute custom SQL queries during replication. This is useful when you need to:

- Validate referential integrity before inserting data
- Query the target database to make replication decisions
- Maintain denormalized data or aggregate counts
- Execute custom SQL operations within the same transaction as the replication write

{% include_cached copy-clipboard.html %}
~~~ts
import * as api from "replicator@v2";

api.configureTargetTables(["orders"], {
  onWrite: async (rows) => {
    // Get the current transaction context to execute custom queries
    const tx = api.getTX();

    for (const row of rows) {
      // Handle delete operations separately - just pass them through
      if (row.action === "delete") {
        await api.write([row]);
        continue;
      }

      // Query the target database to verify the customer exists
      // tx.query() returns a Promise that resolves to an iterable of rows
      const resultRows = await tx.query(
        "SELECT id FROM target_db.target_schema.customers WHERE id = $1",
        row.data.customer_id
      );

      // Iterate over the query results to check if a customer was found
      let customer = null;
      for (const resultRow of resultRows) {
        customer = resultRow;
        break; // Only need the first row
      }

      // Skip this order if the customer doesn't exist
      if (!customer) {
        console.warn("Skipping order: missing customer_id", row.data.customer_id);
        continue;
      }

      // Write the order to the target database using the standard API
      await api.write([row]);

      // Use tx.exec() to update related data in the same transaction
      // Here we increment a counter to track the number of orders per customer
      await tx.exec(
        "UPDATE target_db.target_schema.customers SET num_orders = COALESCE(num_orders, 0) + 1 WHERE id = $1",
        row.data.customer_id
      );
    }
  },
});
~~~

<a id="console"></a> 

## `console`

Userscripts include a built-in global `console` object that provides standard logging functions for debugging and observability. Messages written through `console` are captured by `replicator` and forwarded to its [structured logging system]({% link molt/molt-replicator.md %}#logging), making them visible in logs, monitoring tools, or local output depending on your deployment.

Further observability can be accessed with the userscript [metrics]({% link molt/userscript-metrics.md %}).

{{site.data.alerts.callout_info}}
Avoid logging sensitive data, as `console` output is collected by `replicator`'s internal logging pipeline.
{{site.data.alerts.end}}

### Logging levels

`console`'s logging functions mirror standard JavaScript console functions:

| Level | Description |
|---|---|
| `console.log(...args)` | General-purpose logging. Use for informational messages. |
| `console.info(...args)` | General-purpose logging. Use for informational messages. |
| `console.debug(...args)` | Verbose debugging output. Typically filtered out unless debug logging is enabled with the [`-v`]({% link molt/replicator-flags.md %}#verbose) Replicator flag. |
| `console.trace(...args)` | Even more verbose trace output. Filtered out unless trace logging is enabled with the [`-v`]({% link molt/replicator-flags.md %}#verbose) Replicator flag. |
| `console.warn(...args)` | Warnings about non-fatal issues or unexpected data. |
| `console.error(...args)` | Errors or exceptions during script execution. |

#### Example

{% include_cached copy-clipboard.html %}
~~~ts
import * as api from "replicator@v2";

api.configureTargetSchema("target_db.target_schema", {
  onRowUpsert: (row, metadata) => {
    // Debug-level logging for detailed troubleshooting
    console.debug("upserting row for table:", metadata.table, "id:", row.id);
    return row;
  },
  onRowDelete: (row, metadata) => row
});
~~~

### Toggle logging

If you want to disable logging for a script entirely (for example, in production or high-throughput environments), but still keep the logging lines, call `console.disable()` at the beginning of your script. You can re-enable logging by removing the disable line or calling `console.enable()`.

#### Example

{% include_cached copy-clipboard.html %}
~~~ts
import * as api from "replicator@v2";

console.disable(); // disable logging temporarily for this userscript.

api.configureTargetSchema("target_db.target_schema", {
  onRowUpsert: (row, metadata) => {
    // Debug-level logging for detailed troubleshooting
    console.debug("upserting row for table:", metadata.table, "id:", row.id);
    return row;
  },
  onRowDelete: (row, metadata) => row
});
~~~

## Best practices

In general, consider the following when writing userscripts:

- Prefer built-in database capabilities over userscripts when available. For example, when migrating from PostgreSQL, use PostgreSQL publications to filter tables rather than implementing table filters in a userscript.
- Always remember to import the `replicator` API when creating a userscript: `import * as api from "replicator@v2";`.
- Prefer [`configureTargetSchema`](#configure-target-schema) for `onRowUpsert` and `onRowDelete`.
- Default to returning the row you received, unless you explicitly want to skip or reroute.
- Numerical columns will be represented as strings. Parse them when reading, convert back to a string after calculations and when returning the row.
- Be mindful of the letter casing for any table and schema names that you provide in a userscript. For example, an Oracle table may be named `EMPLOYEES` by default, while a PostgreSQL table may be named `employees`.
- Both the `onRowUpsert` and `onRowDelete` handlers must be provided, not just one. If you only want special handling logic for one, just return the original arguments that are passed in for the other. For instance, this could be as simple as `onRowDelete: (row, metadata) => row`.

## See also

- [Userscript Overview]({% link molt/userscript-overview.md %})
- [Userscript Quickstart]({% link molt/userscript-quickstart.md %})
- [Userscript Cookbook]({% link molt/userscript-cookbook.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [Migration Overview]({% link molt/migration-overview.md %})