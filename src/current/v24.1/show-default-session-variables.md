---
title: SHOW DEFAULT SESSION VARIABLES
summary: The SHOW DEFAULT SESSION VARIABLES statement lists the default values for session variables applied to a given user.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW DEFAULT SESSION VARIABLES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the values for [session variables]({% link {{ page.version.version }}/set-vars.md %}) applied to a given [user/role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles). 

[XXX](): ... in the current database?

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_default_session_variables_for_role.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`FOR {role_or_group_or_user} {role_spec}` | [XXX](): WRITE ME
`FOR ROLE_ALL ALL` | [XXX](): WRITE ME
`FOR USER_ALL ALL` | [XXX](): WRITE ME

## Required Privileges

The [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) issuing this statement must have one of the following [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges):

- `CREATEROLE`
- `MODIFYCLUSTERSETTING`
- `MODIFYSQLCLUSTERSETTING`

## Examples

## See also

- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Default Privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges)
