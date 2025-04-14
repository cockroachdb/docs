---
title: DROP POLICY
summary: The DROP POLICY statement removes an existing row-level security (RLS) policy from a table.
toc: true
keywords: security, row level security, RLS
docs_area: reference.sql
---

The `DROP POLICY` statement removes an existing [row-level security (RLS)]({% link {{ page.version.version }}/enum.md %}) policy from a [table]({% link {{ page.version.version }}/schema-design-table.md %}).

## Syntax

<!--

NB. This is commented out while we wait for a fix to DOC-12125

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_policy_stmt.html %}
</div>
-->

{% include_cached copy-clipboard.html %}
~~~
DROP POLICY [ IF EXISTS ] policy_name ON table_name [ CASCADE | RESTRICT ];
~~~

## Parameters

| Parameter           | Description                                                                                            |
|---------------------|--------------------------------------------------------------------------------------------------------|
| `policy_name`       | Unique identifier for the policy on the table.                                                         |
| `table_name`        | The [table]({% link {{ page.version.version }}/schema-design-table.md %}) to which the policy applies. |
| `IF EXISTS`         | Suppresses an error if the policy doesn't exist.                                                       |
| `CASCADE, RESTRICT` | Standard dependency handling (usually not relevant for policies themselves).                           |

## Examples

### Replace a Policy

This example demonstrates dropping an existing policy before replacing it with a new one that has a different fundamental behavior (e.g., changing from `PERMISSIVE` to `RESTRICTIVE`), which cannot be done using [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %}).

Given an `orders` table that has [row-level security]({% link {{ page.version.version }}/row-level-security.md %}#enable-or-disable-row-level-security) enabled:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE orders (
    user_id TEXT PRIMARY KEY,
    order_details TEXT,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL
);
~~~


{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
~~~

And further given that an initial `PERMISSIVE` policy was created to grant access to non-archived orders for users in a `customer_service` role:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE customer_service;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE POLICY user_orders_policy ON orders
    AS PERMISSIVE -- This is the key aspect we want to change
    FOR ALL
    TO customer_service
    USING ( user_id = current_user AND is_archived = FALSE )
    WITH CHECK ( user_id = current_user AND is_archived = FALSE );
~~~

Next, we learn that changing security requirements will mandate a stricter approach going forward. We want to change this policy to act as a fundamental restriction that **must** be met; this cannot be accomplished with a `PERMISSIVE` policy. Since [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %}) cannot change `AS PERMISSIVE` to `AS RESTRICTIVE`, we must drop the old policy and create a new one.

Next, drop the existing policy:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP POLICY IF EXISTS user_orders_policy ON orders;
~~~

After dropping the old policy, you can create the new, stricter policy:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE POLICY user_orders_policy ON orders
    AS RESTRICTIVE -- Changed from PERMISSIVE
    FOR ALL
    TO customer_service
    USING ( user_id = current_user AND is_archived = FALSE )
    WITH CHECK ( user_id = current_user AND is_archived = FALSE );
~~~

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`ALTER TABLE {ENABLE, DISABLE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)

<!-- Sqlchecker test cleanup block. NB. This must always come last. Be sure to comment this out when finished writing the doc. -->

<!--

{% include_cached copy-clipboard.html %}
~~~ sql
DROP POLICY IF EXISTS user_orders_policy ON orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP USER customer_service;
~~~

-->
