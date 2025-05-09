---
title: SHOW POLICIES
summary: The SHOW POLICIES statement lists the row-level security policies for a table
toc: true
keywords: security, row level security, RLS
docs_area: reference.sql
---

The `SHOW POLICIES` statement lists the [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policies for a [table]({% link {{ page.version.version }}/schema-design-table.md %}).

## Syntax

<!--

NB. This is commented out while we wait for a fix to DOC-12125

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_policies_stmt.html %}
</div>
-->

{% include_cached copy-clipboard.html %}
~~~
SHOW POLICIES FOR {table_name}
~~~

## Parameters

| Parameter    | Description                                        |
|--------------|----------------------------------------------------|
| `table_name` | The name of the table to which the policy applies. |

## Examples

In this example, we will create a table, a role, and some policies to view:

- The `user_orders_policy` is a permissive policy allowing any user to access their own orders.
- The `archived_orders_policy` is a restrictive policy ensuring that customer service roles can only view non-archived orders that are assigned to them.

First, create the table, enable RLS, and add a role and policies:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE orders (
    user_id TEXT PRIMARY KEY,
    order_details TEXT,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Add role
CREATE ROLE customer_service;

-- Example policies
CREATE POLICY user_orders_policy ON orders
    FOR ALL
    TO PUBLIC
    USING (user_id = current_user)
    WITH CHECK (user_id = current_user);

CREATE POLICY archived_orders_policy ON orders
    AS RESTRICTIVE
    FOR SELECT
    TO customer_service
    USING (user_id = current_user AND is_archived = FALSE);
~~~

To view the RLS policies applied to the `orders` table, use the `SHOW POLICIES` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW POLICIES FOR orders;
~~~

~~~
           name          |  cmd   |    type     |       roles        |                      using_expr                      |     with_check_expr
-------------------------+--------+-------------+--------------------+------------------------------------------------------+---------------------------
  user_orders_policy     | ALL    | permissive  | {public}           | user_id = current_user()                             | user_id = current_user()
  archived_orders_policy | SELECT | restrictive | {customer_service} | (user_id = current_user()) AND (is_archived = false) |
(2 rows)
~~~

### Use `pg_policies` to view all row-level security policies in the system

Use the following query to view all RLS policies. This example uses the schema and policies from the [Row-level security overview]({% link {{ page.version.version }}/row-level-security.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM pg_policies;
~~~

~~~
  schemaname | tablename |     policyname     | permissive |      roles      | cmd |               qual                |        with_check
-------------+-----------+--------------------+------------+-----------------+-----+-----------------------------------+---------------------------
  public     | orders    | user_orders_policy | permissive | {public}        | ALL | user_id = current_user()          | user_id = current_user()
  public     | employees | self_access        | permissive | {public}        | ALL | username = current_user()         | NULL
  public     | employees | manager_access     | permissive | {public}        | ALL | manager_username = current_user() | NULL
  public     | invoices  | tenant_isolation   | permissive | {public}        | ALL | NULL                              | NULL
  public     | employees | hr_access          | permissive | {hr_department} | ALL | NULL                              | NULL
(5 rows)
~~~

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %})
- [`ALTER TABLE {ENABLE, DISABLE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)

<!-- Sqlchecker test cleanup block. NB. This must always come last. Be sure to comment this out when finished writing the doc. -->

<!--

{% include_cached copy-clipboard.html %}
~~~ sql
DROP POLICY IF EXISTS user_orders_policy ON orders CASCADE;
DROP POLICY IF EXISTS archived_orders_policy ON orders CASCADE;
DROP ROLE IF EXISTS customer_service;
DROP TABLE IF EXISTS orders CASCADE;
~~~

-->
