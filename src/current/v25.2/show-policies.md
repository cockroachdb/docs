---
title: SHOW POLICIES
summary: The SHOW POLICIES statement lists ... XXX
toc: true
docs_area: reference.sql
---

The `SHOW POLICIES` statement lists the [row-level security (RLS)]({% link {{ page.version.version }}/enum.md %}) policies for ... [XXX](XXX): XXX

## Syntax

[xxx](): this diagram not getting built/added to https://github.com/cockroachdb/generated-diagrams/tree/master/grammar_svg for some reason

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_policies_stmt.html %}
</div>

## Parameters

Parameter | Description
----------|------------
[XXX](XXX): XXX      | [XXX](XXX): XXX

## Examples

[XXX](XXX): XXX

### Use `pg_policies` to view all row-level security policies in the system

If you are the `root` user, you can view all RLS policies. This example uses the schema and policies from the [Row-level security overview]({% link {{ page.version.version }}/row-level-security.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT current_user();
~~~

~~~
  current_user
----------------
  root
(1 row)
~~~

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
