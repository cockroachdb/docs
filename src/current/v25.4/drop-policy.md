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

NB. This was waiting on a fix to DOC-12125 when this doc was being
written. Now there is additional followup work (tracked in DOC-13653)
to update the parameters and potentially the diagram.

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
| `CASCADE, RESTRICT` | Standard dependency handling (not relevant for policies themselves).                                   |

## Examples

### Drop a policy

To drop an existing policy, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP POLICY IF EXISTS your_policy ON orders;
~~~

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)
