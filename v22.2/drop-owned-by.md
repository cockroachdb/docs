---
title: DROP OWNED BY
summary: The DROP OWNED BY statement drops all objects owned by and any grants on objects not owned by a role.
toc: true
docs_area: reference.sql
---

The `DROP OWNED BY` [statement](sql-statements.html) drops all objects owned by and any grants on objects not owned by a role.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The role must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the specified objects. `DROP OWNED BY` cannot be performed if the
user has synthetic privileges.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_owned_by.html %}</div>

## Parameters

 Parameter | Description
-----------|------------
`role_spec_list` | The source role, or a comma-separated list of source roles.
`RESTRICT` | _(Default)_ Do not drop ownership if any objects (such as [constraints](constraints.html) and tables) use it.
`CASCADE` | Drop other objects that depend on the objects being dropped.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.


## Known limitations

- [Enum](enum.html) types are not dropped.

## See also
- [`REASSIGN OWNED`](reassign-owned.html)
- [`DROP ROLE`](drop-role.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
