---
title: ALTER POLICY
summary: The ALTER POLICY statement changes an existing row-level security (RLS) policy on a table.
toc: true
keywords: security, row level security, RLS
docs_area: reference.sql
---

The `ALTER POLICY` statement changes an existing [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policy on a table.

Allowed changes to a policy using `ALTER POLICY` include:

- Rename the policy.
- Change the applicable [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles).
- Modify the [`USING` expression](#parameters).
- Modify the [`WITH CHECK` expression](#parameters).

{{site.data.alerts.callout_info}}
You cannot use `ALTER POLICY` to change the `PERMISSIVE` or `RESTRICTIVE` nature of the policy, nor its applicable `FOR` command (as defined by `CREATE POLICY ... ON ... { PERMISSIVE | RESTRICTIVE } ... FOR { ALL | SELECT | ... }`). If you want to make these changes, you must start over with [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %}) and [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}). For an example, see [Replace a policy]({% link {{ page.version.version }}/drop-policy.md %}#replace-a-policy).
{{site.data.alerts.end}}

## Syntax

<!--

NB. This is commented out while we wait for a fix to DOC-12125

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_policy_stmt.html %}
</div>

-->

{% include_cached copy-clipboard.html %}
~~~
ALTER POLICY policy_name ON table_name RENAME TO new_policy_name;

ALTER POLICY policy_name ON table_name
    [ TO { role_name | PUBLIC | CURRENT_USER | SESSION_USER } [, ...] ]
    [ USING ( using_expression ) ]
    [ WITH CHECK ( check_expression ) ];
~~~

## Parameters

Parameter | Description
----------|------------
`policy_name` | The identifier of the existing policy to be modified. Must be unique for the specified `table_name`.
`ON table_name` | The name of the table on which the policy `policy_name` is defined.
`RENAME TO { new_policy_name }` | The new identifier for the policy. The `new_policy_name` must be a unique name on `table_name`.
`TO { role_name | PUBLIC | CURRENT_USER | SESSION_USER } [, ...]` | Specifies the database [role(s)]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) to which the altered policy applies. These role(s) replace the existing set of roles for the policy (`PUBLIC` refers to all roles). `CURRENT_USER` and `SESSION_USER` refer to the current execution context's user (also available via [functions]({% link {{ page.version.version }}/functions-and-operators.md %}) `current_user()` and `session_user()`).
`USING ( using_expression )` | Replaces the previous value of this expression. For details about this expression, see [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}#parameters).
`WITH CHECK ( check_expression )` | Replaces the previous value of this expression. For details about this expression, see [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}#parameters).

## Examples

In this example, we start by only allowing users to see or modify their own rows in an `orders` table. Then, as the schema is updated due to business requirements, we must refine the policy to take into account the new requirements.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE orders (user_id TEXT PRIMARY KEY, order_details TEXT);
~~~

The original policy on the table was as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
    CREATE POLICY user_orders_policy ON orders
        FOR ALL
        TO PUBLIC
        USING ( user_id = current_user )
        WITH CHECK ( user_id = current_user );
~~~

However, the `orders` table schema has been updated to include an `is_archived` flag, and the initial policy needs refinement.

{% include_cached copy-clipboard.html %}
~~~ sql
-- Assume this change was made after the initial policy was created
ALTER TABLE orders ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL;
CREATE INDEX idx_orders_user_id_is_archived ON orders(user_id, is_archived); -- For performance
~~~

The policy requirements have changed as follows:

1. The policy should now only apply to users belonging to the `customer_service` role, not `PUBLIC`.
1. Users (in `customer_service`) should only be able to view and modify orders that are **not** archived (`is_archived = FALSE`). Archived orders should be invisible/immutable via this policy.

This assumes the `customer_service` role has been created:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE customer_service;
~~~

This leads to the following `ALTER POLICY` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER POLICY user_orders_policy ON orders
    -- 1. Change the applicable role(s)
    TO customer_service
    -- 2. Update the USING clause to filter out archived orders
    USING ( user_id = current_user AND is_archived = FALSE )
    -- 3. Update the WITH CHECK clause to prevent archiving/modifying archived orders via this policy
    WITH CHECK ( user_id = current_user AND is_archived = FALSE );
~~~

The changes to the `ALTER POLICY` statement can be explained as follows:

- `TO customer_service`: Restricts the policy's application from all users (`PUBLIC`) to only those who are members of the `customer_service` role. Other users will no longer be affected by this specific policy (they would need other applicable policies or RLS would deny access by default).
- `USING ( user_id = current_user AND is_archived = FALSE )`: Modifies the visibility rule. Now, `customer_service` users can only see rows matching their `user_id` *and* where `is_archived` is false.
- `WITH CHECK ( user_id = current_user AND is_archived = FALSE )`: Modifies the constraint for `INSERT`/`UPDATE`. Users attempting modifications must satisfy the `user_id` match, and the resulting row must have `is_archived = FALSE`. This prevents them from inserting archived orders or updating an order to set `is_archived = TRUE` via operations governed by this policy.

This `ALTER POLICY` statement reflects a typical evolution: refining role targeting and adapting the policy logic to accommodate schema changes and evolving access control requirements.

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %})
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
