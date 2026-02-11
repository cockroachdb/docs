---
title: SHOW DEFAULT SESSION VARIABLES FOR ROLE
summary: The SHOW DEFAULT SESSION VARIABLES FOR ROLE statement lists the default values for session variables applied to a given user.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW DEFAULT SESSION VARIABLES FOR ROLE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the values for updated [session variables]({% link {{ page.version.version }}/set-vars.md %}) that are applied to a given [user or role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles).

The results returned only include the values of session variables that are changed from the defaults. When no session variables have been changed from the defaults for a given role, the statement [returns no values](#output-when-no-session-variables-have-been-changed).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_default_session_variables_for_role.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`FOR {role_or_group_or_user}` | The [user, group, or role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) whose updated [session variables]({% link {{ page.version.version }}/session-variables.md %}) should be displayed.
`FOR ROLE ALL` | Denotes that changes to default [session variables]({% link {{ page.version.version }}/session-variables.md %}) across all [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) should be displayed.
`FOR USER ALL` | Alias for `FOR ROLE ALL`.

## Response

Column | Description
------|------------
`session_variables` | The name of the [session variable]({% link {{ page.version.version }}/session-variables.md %}) that has had its default value changed.
`default_values` | The updated value of the [session variable]({% link {{ page.version.version }}/session-variables.md %}).
`database` | The [database]({% link {{ page.version.version }}/show-databases.md %}) where the change to the session variable will be applied.
`inherited_globally` | Whether the change to the variable's value is applied to all users. For more information, see [`ALTER ROLE ALL`]({% link {{page.version.version}}/alter-role.md%}#set-default-session-variable-values-for-all-users).

## Required Privileges

The [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users) issuing this statement must have at least one of the following [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges):

- `CREATEROLE`
- `MODIFYCLUSTERSETTING`
- `MODIFYSQLCLUSTERSETTING`

## Examples

### Output when no session variables have been changed

When no session variables have been changed from the defaults for a given role, the statement returns no values:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DEFAULT SESSION VARIABLES FOR ROLE public;
~~~

~~~
SHOW DEFAULT SESSION VARIABLES FOR ROLE 0
~~~

Another way of confirming zero rows of output:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW DEFAULT SESSION VARIABLES FOR ROLE public];
~~~

~~~
  session_variables | default_values | database | inherited_globally
--------------------+----------------+----------+---------------------
(0 rows)
~~~

### Show changed session variables that apply to a user

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER movr_auditor;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE ALL SET application_name = 'movr';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DEFAULT SESSION VARIABLES FOR ROLE movr_auditor;
~~~

~~~
  session_variables | default_values | database | inherited_globally
--------------------+----------------+----------+---------------------
  application_name  | movr           | NULL     |         t
(1 row)
~~~

### Show changed session variables that apply to a user in different databases

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE movr_audit;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE ALL IN DATABASE movr_audit SET application_name = 'movr_audit';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DEFAULT SESSION VARIABLES FOR ROLE movr_auditor;
~~~

~~~
  session_variables | default_values |  database  | inherited_globally
--------------------+----------------+------------+---------------------
  application_name  | movr_audit     | movr_audit |         t
  application_name  | movr           | NULL       |         t
(2 rows)
~~~

### Show updated default session variables that apply to all users

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DEFAULT SESSION VARIABLES FOR ROLE ALL;
~~~

~~~
  session_variables | default_values |  database
--------------------+----------------+-------------
  application_name  | movr_audit     | movr_audit
  application_name  | movr           | NULL
(2 rows)
~~~

### Get inline help in the SQL shell

{% include_cached copy-clipboard.html %}
~~~ sql
\h SHOW DEFAULT SESSION VARIABLES FOR ROLE
~~~

~~~
Command:     SHOW DEFAULT SESSION VARIABLES FOR ROLE
Description: list default session variables for role
Category:    privileges and security
Syntax:
SHOW DEFAULT SESSION VARIABLES FOR ROLE <name>
~~~

## See also

- [`ALTER ROLE ALL`]({% link {{page.version.version}}/alter-role.md%}#set-default-session-variable-values-for-all-users)
- [Session Variables]({% link {{ page.version.version }}/session-variables.md %})
- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Default Privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges)
