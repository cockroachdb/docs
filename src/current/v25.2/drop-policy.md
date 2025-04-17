---
title: DROP POLICY
summary: The DROP POLICY statement ... XXX
toc: true
docs_area: reference.sql
---

The `DROP POLICY` statement changes the [row-level security (RLS)]({% link {{ page.version.version }}/enum.md %}) policies for ... [XXX](XXX): XXX

## Syntax

[xxx](): this diagram not getting built/added to https://github.com/cockroachdb/generated-diagrams/tree/master/grammar_svg for some reason

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_policy_stmt.html %}
</div>

## Parameters

Parameter | Description
----------|------------
[XXX](XXX): XXX       | [XXX](XXX): XXX

## Examples

[XXX](XXX): XXX

## See also

- [Row-level security (RLS) overview]({% link {{ page.version.version }}/row-level-security.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`ALTER TABLE {ENABLE, DISABLE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)
