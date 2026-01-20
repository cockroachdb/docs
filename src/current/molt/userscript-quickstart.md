---
title: Userscript Quickstart
summary: Get started writing and validating your first MOLT userscript.
toc: true
docs_area: migrate
---

This quickstart guides you through creating, validating, and deploying your first [userscript]({% link molt/userscript-overview.md %}) based on a [cookbook]({% link molt/userscript-cookbook.md %}) example.

## Before you begin

- [Install MOLT Replicator **v1.1.4 or later**]({% link molt/molt-replicator.md %}#installation) for full compatibility with the userscript API.
- Install a TypeScript-compatible IDE (for example, [VS Code](https://code.visualstudio.com/)).

## Step 1: Set up your environment

Create a new TypeScript file for your userscript in your IDE (for example, `userscript.ts`).

For IDE autocomplete and type-checking support, optionally add the Replicator TypeScript definitions. For details, refer to [Access this API]({% link molt/userscript-api.md %}#access-this-api).

## Step 2: Write a userscript

Use the [userscript cookbook]({% link molt/userscript-cookbook.md %}) as a starting point. The cookbook provides ready-to-use examples that you can copy and adapt.

Copy and adapt a cookbook example that matches your use case. For example, adapt the template to [filter a single table]({% link molt/userscript-cookbook.md %}#filter-a-single-table) to exclude the `audit_logs` table from the `public` schema during replication:

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v2";

const TARGET_SCHEMA_NAME = "defaultdb.public";
const TABLE_TO_SKIP = "audit_logs";

api.configureTargetSchema(SCHEMA_NAME, {
  onRowUpsert: (row, meta) => {
    if (meta.table === TABLE_TO_SKIP) {
      return null; // Skip this table
    }
    return row;
  },
  onRowDelete: (row, meta) => {
    if (meta.table === TABLE_TO_SKIP) {
      return null;
    }
    return row;
  }
});
~~~

For details on the userscript API and handler functions, refer to the [Userscript API]({% link molt/userscript-api.md %}).

{{site.data.alerts.callout_success}}
When writing userscripts, follow the [best practices]({% link molt/userscript-api.md %}#best-practices).
{{site.data.alerts.end}}

## Step 3: Use with Replicator

Include the [`--userscript`]({% link molt/replicator-flags.md %}#userscript) flag to have [MOLT Replicator]({% link molt/molt-replicator.md %}) apply the userscript. For example, to apply your userscript during PostgreSQL replication:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.public \
--slotName molt_slot \
--publicationName molt_fetch \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema \
--userscript userscript.ts
~~~

## See also

- [Userscript Overview]({% link molt/userscript-overview.md %})
- [Userscript API]({% link molt/userscript-api.md %})
- [Userscript Cookbook]({% link molt/userscript-cookbook.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})