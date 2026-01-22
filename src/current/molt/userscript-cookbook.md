---
title: Userscript Cookbook
summary: Learn how to use MOLT userscripts through detailed examples that you can copy and paste.
toc: true
docs_area: migrate
---

Userscripts allow you to define custom schema and table transformations. When specified with the [`--userscript` flag]({% link molt/replicator-flags.md %}#userscript), userscripts modify the data that [MOLT Replicator]({% link molt/molt-replicator.md %}) migrates from a source database to CockroachDB.

This cookbook provides ready-to-use examples that demonstrate real-world uses of the [userscript API]({% link molt/userscript-api.md %}). You can copy and paste them into your own code, and you can adapt them for your specific use cases. 

[MOLT Fetch]({% link molt/molt-fetch.md %}) does **not** support userscripts. Below each example, you will see the equivalent way of carrying out that transformation using MOLT Fetch, if it's possible to do so. When performing an [initial data load followed by live replication]({% link molt/migrate-load-replicate.md %}), **apply equivalent transformations in both the Fetch command and Replicator userscript** to ensure data consistency.

## Before you begin

- Make sure that you understand the [purpose and usage of userscripts]({% link molt/userscript-overview.md %}). Take a look at the [userscript API]({% link molt/userscript-api.md %}). Understand [what you cannot do]({% link molt/userscript-overview.md %}#unsupported-typescript-features) in a userscript.
- [Install MOLT Replicator]({% link molt/molt-replicator.md %}#installation). The userscript API is accessible via the `replicator` library, which is already included in MOLT Replicator.
- [Install TypeScript](https://www.typescriptlang.org/download/), and install a TypeScript-compatible IDE (for example, VS Code).
- Download the [userscript type definitions file](https://replicator.cockroachdb.com/userscripts/replicator@v2.d.ts) and the [tsconfig.json file](https://replicator.cockroachdb.com/userscripts/tsconfig.json). Place these files in your working directory to enable autocomplete, inline documentation, and real-time error detection directly in your IDE.

## Example userscripts

### Filter a single table

The following example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to exclude a specific table from replication, while still replicating everything else in the same schema. 

This could be useful when you have internal, staging, or audit tables that appear in the changefeed but shouldn't be written to the target.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLE_TO_SKIP` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================
const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLE_TO_SKIP = "YOUR_TABLE_HERE"; // e.g. "items"

// Filter out the table 'YOUR_TABLE_HERE' from replication in the 'YOUR_SCHEMA_HERE' schema. 
api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    // Skip replication for 'YOUR_TABLE_HERE' by returning null
    if (meta.table === TABLE_TO_SKIP) {
      return null;
    }
    // Return routing object for other tables
    return row;
  },
  onRowDelete: (row, meta) => {
    // Skip replication for 'YOUR_TABLE_HERE' by returning null
    if (meta.table === TABLE_TO_SKIP) {
      return null;
    }

    return row;
  }
});
~~~

#### MOLT Fetch equivalent

You can filter a single table using the MOLT Fetch [`--table-exclusion-filter`]({% link molt/molt-fetch.md %}#schema-and-table-selection) flag.

**Make sure to replace the `TABLE_TO_SKIP` placeholder with the name of the appropriate table, and make sure that the source and target connection strings have been exported to the environment.**

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--table-exclusion-filter 'TABLE_TO_SKIP'
~~~

### Filter multiple tables

The following example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to exclude multiple tables from the replication process. This extends the example shown in [Filter a single table](#filter-a-single-table) to allow for multiple tables to be filtered instead of just one.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLES_TO_SKIP` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================
const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLES_TO_SKIP = new Set(["YOUR_TABLE_HERE_1", "YOUR_TABLE_HERE_2"]); // e.g. ["items", "orders", "customers"]

// Set up a filter to exclude rows from the tables "YOUR_TABLE_HERE_1" and "YOUR_TABLE_HERE_2" from being replicated.

api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    // If the table is in our exclusion set, skip replication by returning null.
    if (TABLES_TO_SKIP.has(meta.table)) {
      return null;
    }

    // Otherwise, replicate the row to a table with the same name on the target.
    return row;
  },

  onRowDelete: (row, meta) => {
    // Apply the same exclusion logic for deletes.
    if (TABLES_TO_SKIP.has(meta.table)) {
      return null;
    }

    // For non-excluded tables, route deletes as usual.
    return row;
  }
});
~~~

#### MOLT Fetch equivalent

You can filter multiple tables using the MOLT Fetch [`--table-exclusion-filter`]({% link molt/molt-fetch.md %}#schema-and-table-selection) flag.

**Make sure to replace the `TABLE_TO_SKIP` placeholder regex with the appropiate regex to suit your use case, and make sure that the source and target connection strings have been exported to the environment.**

To capture multiple tables, use regex alternation:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--table-exclusion-filter 'TABLE_TO_SKIP_1|TABLE_TO_SKIP_2'
~~~

Or use a regex pattern:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--table-exclusion-filter 'TABLE_TO_SKIP_*'
~~~

### Select data to replicate

The following example demonstrates how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to conditionally replicate rows.

Many applications mark rows as deleted using an `is_deleted` column rather than actually deleting the row. The following example will demonstrate how to use a conditional to ignore "soft-deleted" rows during upsert replication. This implementation avoids writing these rows to the target, while still propograting explicit delete events.

**Make sure to set the `TARGET_SCHEMA_NAME` constant to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"

// Below is an example to conditionally exclude soft_deleted rows from the 
// replication process using userscripts.

api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    // Skip rows where is_deleted flag is true/1
    if (row.is_deleted !== undefined && Number(row.is_deleted) === 1) {
      return null; // Don't replicate soft-deleted rows
    }
    return row;
  },
  onRowDelete: (row, meta) => {
    // Ordinarily, handle row deletions similarly
    // Without specific conditions, default to processing the row normally
    return row;
  }
});
~~~

#### Source/target table schema

The source and target tables have the same schema:

~~~
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

You can selectively replicate data using the [`--filter-path`]({% link molt/molt-fetch.md %}#selective-data-movement) flag, which accepts a path to a JSON file that specifies row-level filter expressions.

**Make sure to replace the `/path/to/soft_delete_filter.json` placeholder with the path to your json file, and make sure that the source and target connection strings have been exported to the environment.**

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--filter-path /path/to/soft_delete_filter.json
~~~

{% include_cached copy-clipboard.html %}
~~~ json
// soft_delete_filter.json
{
    "filters": [
        {
            "resource_specifier": {
                "schema": "public",
                "table": ".*"
            },
            "expr": "is_deleted != 1"
        }
    ]
}
~~~

### Filter columns

The following example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to remove specific columns from replicated rows. For example, the source table may include internal metadata columns or values intended only for the source system. The following example removes a single column `qty` before writing the row to the target.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLE_TO_EDIT` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLE_TO_EDIT = "YOUR_TABLE_HERE"; // e.g. "items"

// Configure the target schema to filter out the qty column from the `YOUR_TABLE_HERE` table.
api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    if (meta.table === TABLE_TO_EDIT) {
      if ("qty" in row) delete row["qty"]; // Remove the qty column from being replicated
    }
    
    return row;
  },
  onRowDelete: (row, meta) => {
    // Pass through delete operations
    return row;
  }
});

~~~

#### Source/target table schema

The target schema of the preceding example uses the same columns as the source table, except the `qty` column is removed:

~~~
SOURCE
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING

TARGET
id STRING, name STRING, price STRING, 
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

Filter columns using the [`--transformations-file`]({% link molt/molt-fetch.md %}#transformations) flag, which accepts a path to a JSON file that specifies column exclusions.

**Make sure to replace the `/path/to/exclude_qty_column.json` placeholder with the path to your json file, and make sure that the source and target connection strings have been exported to the environment.**

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--transformations-file /path/to/exclude_qty_column.json
~~~

**Replace the `YOUR_TABLE_HERE` placeholder with the name of the table to edit.**

{% include_cached copy-clipboard.html %}
~~~ json
// exclude_qty_column.json
{
    "transforms": [
        {
            "id": 1,
            "resource_specifier": {
                "schema": "public",
                "table": "YOUR_TABLE_HERE"
            },
            "column_exclusion_opts": {
                "column": "qty"
            }
        }
    ]
}
~~~

### Rename columns

The following example shows how you can use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to rename a table's columns on the target database. It demonstrates how you might handle column renaming in the case of both upserts and deletes.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLE_TO_EDIT` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

// Make sure the letter casing matches your target table and schema names.
const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE" // e.g. "defaultdb.public"
const TABLE_TO_EDIT = "YOUR_TABLE_HERE"; // e.g. "orders"

/**
 * Use case: Source database uses "emp_id" and "emp_name" but target database
 * uses "employee_id" and "employee_name". The script maps the source column
 * names to the target column names during replication.
 */
api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, metadata) => {
    if (metadata.table === TABLE_TO_EDIT) {
      // Rename emp_id -> employee_id
      if (row.emp_id !== undefined) {
        row.employee_id = row.emp_id;
        delete row.emp_id;
      }

      // Rename emp_name -> employee_name
      if (row.emp_name !== undefined) {
        row.employee_name = row.emp_name;
        delete row.emp_name;
      }
    }

    return row;
  },

  onRowDelete: (row, metadata) => {
    // Deletes only need primary key columns to identify which row to remove.
    // If your primary key column is renamed, apply the same renaming here.
    //
    // Note: Some databases may send primary keys as positional values instead
    // of named columns - in that case, the source primary key columns will be
    // undefined, and replicator handles the mapping automatically so you can
    // just return the row unchanged.

    // Rename emp_id -> employee_id for the primary key
    if (row.emp_id !== undefined) {
      row.employee_id = row.emp_id;
      delete row.emp_id;
    }

    return row;
  },
});
~~~

#### Source/target table schema

The column names in the preceding target table are longer versions of those in the source table:

~~~
SOURCE
emp_id STRING, emp_name STRING, department STRING

TARGET
employee_id STRING, employee_name STRING, department STRING
~~~

#### MOLT Fetch equivalent

MOLT Fetch does not have direct support for column renaming. You may need to rename the column on the target database after the [initial data load from MOLT Fetch]({% link molt/migrate-load-replicate.md %}#start-fetch).

### Rename primary keys

This example shows how you can use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to rename a table's primary keys. Because of how the `onRowDelete` handler uses primary keys to identify rows, this scenario requires a different implementation than the [Rename columns](#rename-columns) example.

This example maps source primary key columns `(pk1, pk2)` to target primary key columns `(id1, id2)`. Note how the `onRowDelete` handler includes conditionals to see if the primary keys are defined using the source or the target key names.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLES_TO_EDIT` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLE_TO_EDIT = "YOUR_TABLE_HERE"; // e.g. "items"

/**
 * This example demonstrates how to use onRowDelete to transform delete operations
 * during replication, including mapping primary key columns.
 *
 * What it does:
 * - Rename primary key columns between source and target
 * - Handle schema differences between databases
 * Map source PK columns (pk1, pk2) to target PK columns (id1, id2)
 */
api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, metadata) => {
    // Map source PK columns (pk1, pk2) to target PK columns (id1, id2)
    if (metadata.table === TABLE_TO_EDIT) {
      row.id1 = row.pk1;
      row.id2 = row.pk2;

      // Need to remove the old PK columns to avoid conflicts between source and target
      // table schemas for onRowUpsert.
      delete row.pk1;
      delete row.pk2;
    }

    // All other tables/rows are passed through unchanged
    return row;
  },

  onRowDelete: (row, metadata) => {
    // Apply the same transformation to delete operations
    // Map primary keys for proper delete matching 
    if (metadata.table === TABLE_TO_EDIT) {
      // Rename pk1 -> id1 for the primary key if necessary.
      // We need to check if it exists for onRowDelete, unlike onRowUpsert.
      if (row.pk1 !== undefined) {
        row.id1 = row.pk1;
        // We don't delete pk1 here unlike onRowUpsert, because onRowDelete will
        // ignore extra columns.
      }

      // Rename pk2 -> id2 for the primary key if necessary
      if (row.pk2 !== undefined) {
        row.id2 = row.pk2;
      }
    }

    // All other tables/rows are passed through unchanged
    return row;
  },
});
~~~

#### Source/target table schema

~~~
SOURCE
pk1 STRING, pk2 STRING, name STRING

TARGET
id1 STRING, id2 STRING, name STRING
~~~

#### MOLT Fetch equivalent

MOLT Fetch does not have direct support for primary key renaming. You may need to reconfigure the primary keys on the target database after the [initial data load from MOLT Fetch]({% link molt/migrate-load-replicate.md %}#start-fetch).

### Route table partitions

The following example demonstrates how you can use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to distribute the rows of a single source table across multiple target tables based on partitioning rules.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLES_TO_PARTITION` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ==========================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLE_TO_PARTITION = "YOUR_TABLE_HERE"; // e.g. "items"

function partition(row, meta) {
  if (meta.table === TABLE_TO_PARTITION) {
    const id = Number(row.id as string);
    if (id <= 10000) {
      // Route row to target table "tbl1", which can be replaced with your target partition table
      return {"tbl1": [row]};
    } else if (id <= 20000) {
      // Route row to target table "tbl2"
      return {"tbl2": [row]};
    } else {
      // Route row to target table "tbl3"
      return {"tbl3": [row]};
    }
  }
  return row;
}

api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: partition,
  onRowDelete: partition
});
~~~

#### MOLT Fetch equivalent

1-to-n table transformations are not supported by MOLT Fetch transforms.

### Rename tables

This example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to route data from a source table to a target table of a different name. This must be implemented in the schema-level handlers, as the row will need to be routed to the correct table-level handler using the correct target table name.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLE_MAPPINGS` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

// Make sure the letter casing matches your target table and schema names.
const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE" // e.g. "defaultdb.public"

// Define table name mappings: source table -> target table.
// Update with your source table names -> renamed tables.
const TABLE_MAPPINGS = {
  "YOUR_FIRST_SOURCE_TABLE_NAME_HERE": "FIRST_RENAMED_TARGET_TABLE_HERE",
  "YOUR_SECOND_SOURCE_TABLE_NAME_HERE": "SECOND_RENAMED_TARGET_TABLE_HERE",
  // Add more tables as needed here
}; // e.g. { "customer_table": "CUSTOMERS", "order_table": "ORDERS" }

/**
 * This example demonstrates how to rename tables from source to target
 * using table routing with onRowUpsert and onRowDelete callbacks.
 *
 * Use case: The script routes rows from source tables to their
 * renamed target tables during replication, using the TABLE_MAPPINGS above.
 */
api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, metadata) => {
    const sourceTable = metadata.table;

    // Check if this table needs to be renamed
    if (sourceTable in TABLE_MAPPINGS) {
      const targetTable = TABLE_MAPPINGS[sourceTable];

      // Return object with target table name as key and array of rows as value
      return { [targetTable]: [row] };
    }

    // If no mapping exists, pass through unchanged
    return row;
  },

  onRowDelete: (row, metadata) => {
    const sourceTable = metadata.table;

    // Check if this table needs to be renamed
    if (sourceTable in TABLE_MAPPINGS) {
      const targetTable = TABLE_MAPPINGS[sourceTable];

      // Return object with target table name as key and array of key values as value
      return { [targetTable]: [row] };
    }

    // If no mapping exists, pass through unchanged
    return row;
  },
});
~~~

#### MOLT Fetch equivalent

Rename tables using the [`--transformations-file`]({% link molt/molt-fetch.md %}#transformations) flag, which accepts a path to a JSON file that specifies table mappings.

**Make sure to replace the `/path/to/rename_tables.json` placeholder with the path to your json file, and make sure that the source and target connection strings have been exported to the environment.**

~~~shell
molt fetch \
  --source $SOURCE \
  --target $TARGET \
  --transformations-file /path/to/rename_tables.json
~~~

**Replace the `YOUR_*_TABLE_NAME_HERE` placeholders with the names of your source and target tables.**

~~~json
// rename_tables.json
{
    "transforms": [
        {
            "id": 1,
            "resource_specifier": {
                "schema": "public",
                "table": "YOUR_FIRST_SOURCE_TABLE_NAME_HERE"
            },
            "table_rename_opts": {
                "value": "FIRST_RENAMED_TARGET_TABLE_HERE"
            }
        },
        {
            "id": 2,
            "resource_specifier": {
                "schema": "public",
                "table": "YOUR_SECOND_SOURCE_TABLE_NAME_HERE"
            },
            "table_rename_opts": {
                "value": "SECOND_RENAMED_TARGET_TABLE_HERE"
            }
        }
    ]
}
~~~

### Compute new columns

The following example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to create computed columns on the target that do not exist on the source. In this example, we derive a `total` column, and add it to each replicated row on the target.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLE_TO_COMPUTE` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLE_TO_COMPUTE = "YOUR_TABLE_HERE"; // e.g. "orders"

api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    if (meta.table === TABLE_TO_COMPUTE) {
      const price = Number(row.price as string) || 0;
      const qty = Number(row.qty as string) || 0;
      const total = price * qty;
      row.total = total.toFixed(2); // Add computed column 'total', formatted as a string with two decimal places
    }
    return row;
  },
  onRowDelete: (row, meta) => {
    // Pass through the delete keys unchanged; onRowDelete only cares about
    // primary keys and isn't guaranteed to contain data columns like price and qty.
    return row;
  }
});
~~~

#### Source/target table schema

The target schema of the preceding example uses the same columns as the source table, plus an additional `total` column:

~~~
SOURCE
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING

TARGET
id STRING, name STRING, price STRING, qty STRING, total STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

Creating computed columns is not supported by MOLT Fetch transforms. MOLT Fetch can only preserve computed columns that exist on the source. You may need to calculate this column for the target database table after the [initial data load from MOLT Fetch]({% link molt/migrate-load-replicate.md %}#start-fetch).

### Combine multiple transforms

You can combine multiple transformations into a single userscript. The following userscript first filters for a certain table, then it [filters out "soft-deleted" rows](#select-data-to-replicate) and [removes sensitive columns](#filter-columns) from the table on the replication target.

**Make sure to set the `TARGET_SCHEMA_NAME` and `TABLE_TO_EDIT` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // e.g. "defaultdb.public"
const TABLE_TO_EDIT = "YOUR_TABLE_HERE"; // e.g. "customers"

/**
 * Example:
 * - Operate on the `YOUR_TABLE_HERE` table in `YOUR_SCHEMA_HERE`
 * - Skip soft-deleted rows (is_deleted = "1")
 * - Remove sensitive columns: ssn, credit_card_number
 */

api.configureTargetSchema(TARGET_SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    const table = meta.table;

    // 1) Only apply this logic to the `YOUR_TABLE_HERE` table.
    if (table !== TABLE_TO_EDIT) {
      // Pass through all other tables unchanged
      return row;
    }

    // 2) Skip soft-deleted rows
    if (Number(row.is_deleted as string) === 1) {
      return null;
    }

    // 3) Scrub PII from replicated rows
    const cleaned = { ...row };
    delete cleaned["ssn"];
    delete cleaned["credit_card_number"];

    // Replicate the cleaned row to the same table name on the target
    return cleaned;
  },

  onRowDelete: (row, meta) => {
    // For deletes, just pass through the keys unchanged
    return row;
  }
});
~~~

#### Source/target table schema

The target schema of the preceding example uses the same columns as the source table, except the `ssn` and `credit_card_number` columns are removed:

~~~
SOURCE
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING

TARGET
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING
~~~

#### MOLT Fetch equivalent

To implement this transformation with MOLT Fetch, create:

- A `soft_delete_filter.json` file (to be included via the [`--filter-path`]({% link molt/molt-fetch.md %}#selective-data-movement) flag).
- A `pii_removal_transform.json` file (to be included via the [`--transformations-file`]({% link molt/molt-fetch.md %}#transformations) flag).

Run MOLT Fetch with both the `--filter-path` and `--transformations-file` flags.

**Make sure to replace the `/path/to/soft_delete_filter.json` and `/path/to/pii_removal_transform.json` placeholders, and make sure that the source and target connection strings have been exported to the environment.**

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--filter-path /path/to/soft_delete_filter.json \
--transformations-file /path/to/pii_removal_transform.json
~~~

**Replace the `YOUR_TABLE_HERE` placeholder with the name of the table to clean up.**

{% include_cached copy-clipboard.html %}
~~~ json
// soft_delete_filter.json
{
    "filters": [
        {
            "resource_specifier": {
                "schema": "public",
                "table": "YOUR_TABLE_HERE"
            },
            "expr": "is_deleted != 1"
        }
    ]
}
~~~

**Replace the `YOUR_TABLE_HERE` placeholder with the name of the table to clean up.**

{% include_cached copy-clipboard.html %}
~~~ json
// pii_removal_transform.json
{
    "transforms": [
        {
            "id": 1,
            "resource_specifier": { "schema": "public", "table": "YOUR_TABLE_HERE" },
            "column_exclusion_opts": { "add_computed_def": false, "column": "ssn" }
        },
        {
            "id": 2,
            "resource_specifier": { "schema": "public", "table": "YOUR_TABLE_HERE" },
            "column_exclusion_opts": { "add_computed_def": false, "column": "credit_card_number" }
        }
    ]
}
~~~

### Implement a dead-letter queue

The following example demonstrates how you can use the userscript API to implement a dead-letter queue (DLQ) strategy for `NOT NULL` errors by retrying the batch at row-level granularity and recording failures. Failed writes go to a dead-letter queue table.

**Make sure to set the `TARGET_SCHEMA_NAME` and `DLQ_TABLE`, and `TABLES_WITH_DLQ` constants to match your environment.**

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const TARGET_SCHEMA_NAME = "YOUR_SCHEMA_HERE"; // Target schema, e.g. "defaultdb.public"
const DLQ_TABLE = "YOUR_DLQ_TABLE_HERE"; // DLQ table for failed operations, e.g. "migration_dlq"
const TABLES_WITH_DLQ = [
    "YOUR_TABLE_HERE",
    // Add more tables as needed
]; // Tables to apply DLQ handling to, e.g. [ "orders", "items", "customers" ]

/**
 * Dead-Letter Queue (DLQ) Handler Example
 * 
 * Handles constraint violations and other errors by isolating failing operations
 * and writing them to a DLQ table instead of failing the entire replication batch.
 * 
 * The following example handles NOT NULL violations, but you can extend it to handle other
 * error types (e.g., unique constraint violations) by adding more SQLSTATE codes.
 */

async function handle_dlq_errors(rows: api.RowOp[]): Promise<any> {
    console.debug("Processing batch of", rows.length, "operations");
    let tx = api.getTX();
    
    await tx.exec("SAVEPOINT dlq_checkpoint");
    
    try {
        // Try to write the entire batch
        await api.write(rows);
        console.debug("Batch write succeeded");
        return;
    } catch (err) {
        const errorStr = err.toString();
        console.warn("Batch write failed:", errorStr);
        
        // Check for constraint violations that should go to DLQ
        // SQLSTATE 23502 = NOT NULL violation
        // Add more SQLSTATE codes as needed (e.g., 23505 for unique constraint violations)
        const isDlqError = errorStr.includes("SQLSTATE 23502");
        
        if (!isDlqError) {
            // Not a DLQ-handled error, re-throw to fail fast
            throw err;
        }
        
        console.warn("DLQ-handled error detected, retrying operations individually");
        
        // Rollback to savepoint to get out of error state
        try {
            await tx.exec("ROLLBACK TO SAVEPOINT dlq_checkpoint");
        } catch {
            await tx.exec("SAVEPOINT dlq_checkpoint");
        }
    }
    
    // Retry each operation individually
    console.debug("Retrying operations individually...");
    for (let row of rows) {
        await tx.exec("SAVEPOINT dlq_checkpoint");
        try {
            await api.write([row]);
            console.debug("Operation succeeded");
            continue;
        } catch (err) {
            const errorStr = err.toString();
            const isDlqError = errorStr.includes("SQLSTATE 23502");
            
            if (!isDlqError) {
                // Not a DLQ-handled error, fail immediately
                throw err;
            }
            
            console.warn("Operation failed, writing to DLQ");
            
            // Rollback to savepoint before writing to DLQ
            try {
                await tx.exec("ROLLBACK TO SAVEPOINT dlq_checkpoint");
            } catch {}
            
            // Write failed operation to DLQ table
            const dlqTableQuoted = "\"" + DLQ_TABLE.replace(/\./g, "\".\"") + "\"";
            await tx.exec(
                "INSERT INTO " + dlqTableQuoted + " (stmt, err) VALUES ($1, $2)",
                JSON.stringify(row),
                errorStr
            );
        }
    }
}

// Pass through all rows unchanged at the schema level
api.configureTargetSchema(TARGET_SCHEMA_NAME, {
    onRowUpsert: (row, meta) => {
        return row;
    },
    onRowDelete: (row, meta) => {
        return row;
    }
});

// Apply DLQ handling to specified tables
api.configureTargetTables(TABLES_WITH_DLQ, {
    onWrite: async (rows: api.RowOp[]): Promise<any> => {
        await handle_dlq_errors(rows);
    }
});
~~~

#### MOLT Fetch equivalent

There is no MOLT Fetch equivalent for DLQ. DLQ handling is part of a live replication, not an initial data load. 

## See also

- [Userscript Overview]({% link molt/userscript-overview.md %})
- [Userscript Quickstart]({% link molt/userscript-quickstart.md %})
- [Userscript API]({% link molt/userscript-api.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
