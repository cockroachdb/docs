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
You cannot use `ALTER POLICY` to change the `PERMISSIVE`, `RESTRICTIVE`, or `FOR` clauses of a policy, as defined in `CREATE POLICY ... ON ... ( PERMISSIVE | RESTRICTIVE ) ... FOR ( ALL | SELECT | ... )`. To make these changes, drop the policy with [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %}) and issue a new [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}) statement.
{{site.data.alerts.end}}

## Syntax

<!--

NB. This was waiting on a fix to DOC-12125 when this doc was being
written. Now there is additional followup work (tracked in DOC-13653)
to update the parameters and potentially the diagram.

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_policy.html %}
</div>

-->

{% include_cached copy-clipboard.html %}
~~~
ALTER POLICY policy_name ON table_name RENAME TO new_policy_name;

ALTER POLICY policy_name ON table_name
    [ TO ( role_name | PUBLIC | CURRENT_USER | SESSION_USER ) [, ...] ]
    [ USING ( using_expression ) ]
    [ WITH CHECK ( check_expression ) ];
~~~

## Parameters

Parameter | Description
----------|------------
`policy_name` | The identifier of the existing policy to be modified. Must be unique for the specified `table_name`.
`ON table_name` | The name of the table on which the policy `policy_name` is defined.
`new_policy_name` | The new identifier for the policy. The `new_policy_name` must be a unique name on `table_name`.
`TO (role_name | PUBLIC | CURRENT_USER | SESSION_USER) [, ...]` | Specifies the database [role(s)]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) to which the altered policy applies. These role(s) replace the existing set of roles for the policy. `PUBLIC` refers to all roles. `CURRENT_USER` and `SESSION_USER` refer to the current execution context's user (also available via [functions]({% link {{ page.version.version }}/functions-and-operators.md %}) `current_user()` and `session_user()`).
`USING ( using_expression )` | Replaces the previous value of this expression. For details about this expression, refer to [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}#parameters).
`WITH CHECK ( check_expression )` | Replaces the previous value of this expression. For details about this expression, refer to [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}#parameters).

## Example

In this example, you will start by only allowing users to see or modify their own rows in an `orders` table. Then, as the schema is updated due to business requirements, you will refine the policy to take into account the new requirements.

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
    USING ( user_id = CURRENT_USER )
    WITH CHECK ( user_id = CURRENT_USER );
~~~

However, the `orders` table schema will be updated to include an `is_archived` flag, and the initial policy will need refinement.

{% include_cached copy-clipboard.html %}
~~~ sql
-- Assume this change was made after the initial policy was created
ALTER TABLE orders ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL;
CREATE INDEX idx_orders_user_id_is_archived ON orders(user_id, is_archived); -- For performance
~~~

The policy requirements have changed as follows:

1. The policy should now only apply to users belonging to the `customer_service` role, not `PUBLIC`.
1. Users in `customer_service` should only be able to view and modify orders that are **not** archived (`is_archived = FALSE`). Archived orders should be invisible/immutable via this policy.

This assumes the `customer_service` role has been created:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE customer_service;
~~~

This leads to the following `ALTER POLICY` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER POLICY user_orders_policy ON orders
    TO customer_service
    USING ( user_id = CURRENT_USER AND is_archived = FALSE )
    WITH CHECK ( user_id = CURRENT_USER AND is_archived = FALSE );
~~~

The changes to the `ALTER POLICY` statement can be explained as follows:

- `TO customer_service`: Restricts the policy's application from all users (`PUBLIC`) to only those who are members of the `customer_service` role. Other users will no longer be affected by this specific policy (they would need other applicable policies or RLS would deny access by default).
- `USING ( user_id = CURRENT_USER AND is_archived = FALSE )`: Modifies the visibility rule. Now, `customer_service` users can only see rows that match their `user_id` *and* are not archived.
- `WITH CHECK ( user_id = CURRENT_USER AND is_archived = FALSE )`: Modifies the constraint for `INSERT`/`UPDATE`. Users attempting modifications must match the `user_id`, and the resulting row must not be archived. This prevents the user from inserting archived orders or updating an order to set `is_archived = TRUE` via operations governed by this policy.

The preceding `ALTER POLICY` statement represents a typical use case: it refines role targeting and adapts the policy logic to accommodate schema changes and evolving access control requirements.

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %})
- [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)
