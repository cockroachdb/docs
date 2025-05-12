---
title: CREATE POLICY
summary: The CREATE POLICY statement defines a new row-level security policy on a table.
toc: true
keywords: security, row level security, RLS
docs_area: reference.sql
---

The `CREATE POLICY` statement defines a new [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policy on a [table]({% link {{ page.version.version }}/schema-design-table.md %}).

## Syntax

<!--

NB. This is commented out while we wait for a fix to DOC-12125

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_policy_stmt.html %}
</div>

-->

{% include_cached copy-clipboard.html %}
~~~
CREATE POLICY [ IF NOT EXISTS ] policy_name ON table_name
    [ AS { PERMISSIVE | RESTRICTIVE } ]
    [ FOR { ALL | SELECT | INSERT | UPDATE | DELETE } ]
    [ TO { role_name | PUBLIC | CURRENT_USER | SESSION_USER } [, ...] ]
    [ USING ( using_expression ) ]
    [ WITH CHECK ( check_expression ) ];
~~~

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Used to specify that the policy will only be created if one with the same `policy_name` does not already exist on `table_name`. If a policy with that name does already exist, the statement will not return an error if this parameter is used.
`policy_name` | Unique identifier for the policy on the table.
`table_name` | The [table]({% link {{ page.version.version }}/schema-design-table.md %}) to which the policy applies.
`AS { PERMISSIVE, RESTRICTIVE }` | (**Default**: `PERMISSIVE`.) For `PERMISSIVE`, policies are combined using `OR`. A row is accessible if *any* permissive policy grants access. For `RESTRICTIVE`, policies are combined using `AND`.  The overall policy enforcement is determined by evaluating a logical expression of the form: `(permissive policies) AND (restrictive policies)`. This means that all restrictive policies must grant access for a row to be accessible, and restrictive policies are evaluated *after* permissive policies. This means that you need to have at least one `PERMISSIVE` policy in place before applying `RESTRICTIVE` policies. If any restrictive policy denies access, the row is inaccessible, regardless of the permissive policies.
`FOR { ALL, SELECT, INSERT, UPDATE, DELETE } ` | (**Default**: `ALL`.) Specifies the SQL statement(s) the policy applies to ([`SELECT`]({% link {{ page.version.version }}/select-clause.md %}), [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), [`DELETE`]({% link {{ page.version.version }}/delete.md %})). For details, see [Policies by statement type](#policies-by-statement-type).
`TO { role_name, ...}`  | (**Default**: `PUBLIC`, which means the policy applies to all roles.) Specifies the database [role(s)]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) to which the policy applies.
`USING ( using_expression )` | Defines the filter condition such that only rows for which the `using_expression` evaluates to `TRUE` are visible or available for modification. Rows evaluating to `FALSE` or `NULL` are silently excluded. Note this the expression is evaluated **before** any data modifications are attempted. The filter condition applies to [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), [`DELETE`]({% link {{ page.version.version }}/delete.md %}), and [`INSERT`]({% link {{ page.version.version }}/insert.md %}) (for `INSERT ... ON CONFLICT DO UPDATE`).
`WITH CHECK ( check_expression )` | Defines a constraint condition such that rows being inserted or updated must satisfy `check_expression` (i.e., must evaluate to `TRUE`). This expression is evaluated **after** the row data is prepared but **before** it is written. If the expression evaluates to `FALSE` or `NULL`, the operation fails with an RLS policy violation error. Applies to [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}). If this expression is omitted, it will default to the `USING` expression for new rows in an `UPDATE` or `INSERT`.

{{site.data.alerts.callout_info}}
The `USING` and `WITH CHECK` expressions can reference table columns and use session-specific [functions]({% link {{ page.version.version }}/functions-and-operators.md %}) (e.g., `current_user()`, `session_user()`) and [variables]({% link {{ page.version.version }}/session-variables.md %}). However, these expressions cannot contain a subexpression.
{{site.data.alerts.end}}

### Policies by statement type

The following table shows which policies are applied to which statement types, with additional considerations listed after the table.

| Command / clause pattern            | `SELECT` policy - `USING` (row that already exists) | `INSERT` policy - `WITH CHECK` (row being added) | `UPDATE` policy - `USING` (row before the change) | `UPDATE` policy - `WITH CHECK` (row after the change) | `DELETE` policy - `USING` (row to be removed) |
|-------------------------------------|-----------------------------------------------------|--------------------------------------------------|---------------------------------------------------|-------------------------------------------------------|-----------------------------------------------|
| `SELECT`                            | ✓                                                   | —                                                | —                                                 | —                                                     | —                                             |
| `SELECT ... FOR UPDATE / FOR SHARE` | ✓                                                   | —                                                | ✓                                                 | —                                                     | —                                             |
| `INSERT`                            | —                                                   | ✓                                                | —                                                 | —                                                     | —                                             |
| `INSERT ... RETURNING`              | ✓                                                   | ✓                                                | —                                                 | —                                                     | —                                             |
| `UPDATE`                            | ✓                                                   | —                                                | ✓                                                 | ✓                                                     | —                                             |
| `DELETE`                            | ✓                                                   | —                                                | —                                                 | —                                                     | ✓                                             |
| `INSERT ... ON CONFLICT DO UPDATE`  | ✓                                                   | —                                                | ✓                                                 | ✓                                                     | —                                             |
| `UPSERT`                            | ✓                                                   | —                                                | ✓                                                 | ✓                                                     | —                                             |

Additional considerations include:

- `SELECT` evaluation: CockroachDB always evaluates `SELECT` (`USING`) policies for `INSERT`, `UPDATE`, and `DELETE`, even when the statement doesn't reference table columns.
- `ON CONFLICT ... DO NOTHING`: CockroachDB does not run the constraint and row-level policy checks on the `VALUES` clause if the candidate row has a conflict. This is a known limitation described in [cockroachdb/cockroach#35370](https://github.com/cockroachdb/cockroach/issues/35370).

## Examples

In this example, we only allow users to see or modify their own rows in an `orders` table.

{% include_cached copy-clipboard.html %}
~~~ sql
-- Minimal schema for the 'orders' table example.
CREATE TABLE orders (user_id TEXT PRIMARY KEY, order_details TEXT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Assume 'orders' table has a 'user_id' column matching logged-in user names.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_orders_policy ON orders
    FOR ALL
    TO PUBLIC -- Applies to all roles
    USING ( user_id = current_user )
    WITH CHECK ( user_id = current_user );
~~~

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %})
- [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`ALTER TABLE {ENABLE, DISABLE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security)
- [`ALTER TABLE {FORCE, NO FORCE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#force-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)

<!-- Sqlchecker test cleanup block. NB. This must always come last. Be sure to comment this out when finished writing the doc. -->

<!--

{% include_cached copy-clipboard.html %}
~~~ sql
DROP POLICY IF EXISTS user_orders_policy ON orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
~~~

-->
