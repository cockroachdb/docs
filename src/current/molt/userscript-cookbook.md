---
title: Userscript Cookbook
summary: Learn how to use MOLT userscripts through detailed examples that you can copy and paste.
toc: true
docs_area: migrate
---

This cookbook provides ready-to-use examples that demonstrate real-world uses of the [Userscript API]({% link molt/userscript-api.md %}). You can copy and paste them into your own code, or you can adapt them for your specific use cases. 

Below each example, you will see the equivalent way of carrying out that transformation using [MOLT Fetch]({% link molt/molt-fetch.md %}), if it's possible to do so. MOLT Fetch does not support userscripts.


## Filter a single table

This example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to exclude a specific table from replication, while still replicating everything else in the same schema. 

This could be useful when you have internal, staging, or audit tables that appear in the changefeed but shouldn’t be written to the target.

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================
const SCHEMA_NAME = "YOUR_SCHEMA_HERE";
const TABLE_TO_SKIP = "YOUR_TABLE_HERE";

// Filter out the table 'YOUR_TABLE_HERE' from replication in the 'YOUR_SCHEMA_HERE' schema. 
api.configureTargetSchema(SCHEMA_NAME, {
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

#### Target schema

The target schema of the example above uses the same columns as the source table:

~~~
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

You can filter a single table using the MOLT Fetch [“table-filter” flag]({% link molt/molt-fetch.md %}#schema-and-table-selection):

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source <source-conn-string> \
--target <target-conn-string> \
--table-filter 'YOUR_TABLE_HERE'
~~~

## Filter multiple tables

This example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to exclude multiple tables from the replication process. This is an extended version of the example shown in [Filter a single table](#filter-a-single-table), but it allows for multiple tables to be filtered instead of just one.

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================
const TABLES_TO_SKIP = new Set(["YOUR_TABLE_HERE_1", "YOUR_TABLE_HERE_2"]);
const SCHEMA_NAME = "YOUR_SCHEMA_HERE";

// Set up a filter to exclude rows from the tables "YOUR_TABLE_HERE_1" and "YOUR_TABLE_HERE_2" from being replicated.

api.configureTargetSchema(SCHEMA_NAME, {
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

#### Target schema

The target schema of the example above uses the same columns as the source table:

~~~
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

You can filter multiple tables using the MOLT Fetch [“table-filter” flag]({% link molt/molt-fetch.md %}#schema-and-table-selection).

To capture multiple tables, use regex alternation:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source <source-conn-string> \
--target <target-conn-string> \
--table-filter 'YOUR_TABLE_HERE_1|YOUR_TABLE_HERE_2'
~~~

Or use a regex pattern:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source <source-conn-string> \
--target <target-conn-string> \
--table-filter 'YOUR_TABLE_HERE_*'
~~~

## Select data to replicate

This example demonstrates how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to conditionally replicate rows.

Many applications mark rows as deleted using an `is_deleted` flag rather than actually deleting the row. This example will demonstrate how to use a conditional to ignore "soft-deleted" rows during upsert replication. This implementation avoids writing these rows to the target, while still propograting explicit delete events.

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const SCHEMA_NAME = "YOUR_SCHEMA_HERE";

// Below is an example to conditionally exclude soft_deleted rows from the 
// replication process using userscripts.

api.configureTargetSchema(SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    // Skip rows where is_deleted flag is true/1
    if (Number(row.is_deleted as string) === 1) {
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

#### Target schema

The target schema of the example above uses the same columns as the source table:

~~~
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

You can selectively replicate data using the [`--filter-path` flag]({% link molt/molt-fetch.md %}#selective-data-movement), which accepts a path to a JSON file that specifies row-level filter expressions:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source <source-conn-string> \
--target <target-conn-string> \
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

## Filter columns

This example shows how to use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to remove specific fields from replicated rows. For example, the source table may include internal metadata fields or values intended only for the source system. This example removes a single column `qty` before writing the row to the target.

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ============================================================================

const SCHEMA_NAME = "YOUR_SCHEMA_HERE";
const TABLE_TO_EDIT = "YOUR_TABLE_HERE"

// Configure the target schema to filter out the qty column from the `YOUR_TABLE_HERE` table.
api.configureTargetSchema(SCHEMA_NAME, {
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

#### Target schema

The target schema of the example above uses the same columns as the source table, except `qty` is removed:

~~~
id STRING, name STRING, price STRING, is_deleted STRING, 
ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

Filter columns using the [`--transformations-file` flag]({% link molt/molt-fetch.md %}#transformations), which accepts a path to a JSON file that specifies column exclusions:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source <source-conn-string> \
--target <target-conn-string> \
--transformations-file /path/to/exclude_qty_column.json
~~~

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

## Route table partitions

This example demonstrates how you can use [`configureTargetSchema`]({% link molt/userscript-api.md %}#configure-target-schema) to distribute the rows of a single source table across multiple target tables based on partitioning rules.

<!-- This can help support table sharding. -->

~~~ ts
import * as api from "replicator@v2";

// ============================================================================
// Configuration - Update these values for your environment
// ==========================================================================

const TABLE_TO_PARTITION = "YOUR_TABLE_HERE"
const SCHEMA_NAME = "YOUR_SCHEMA_HERE";

function partition(row, meta) {
  const id = Number(row.id as string); 
  if (meta.table === TABLE_TO_PARTITION) {
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

api.configureTargetSchema(SCHEMA_NAME, {
  onRowUpsert: partition,
  onRowDelete: partition
});
~~~

#### Target schema

The target schema of the example above uses the same columns as the source table:

~~~
id STRING, name STRING, price STRING, qty STRING,
is_deleted STRING, ssn STRING, credit_card_number STRING
~~~

#### MOLT Fetch equivalent

1-to-n table transformations aren’t supported by MOLT Fetch transforms.

## See also