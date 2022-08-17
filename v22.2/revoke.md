---
title: REVOKE
summary: The REVOKE statement revokes privileges from users and/or roles, or revokes privileges from users and/or roles.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `REVOKE` [statement](sql-statements.html) revokes [privileges](security-reference/authorization.html#managing-privileges) from [users and/or roles](security-reference/authorization.html#users-and-roles). For the list of privileges that can be granted to and revoked from users and roles, see [`GRANT`](grant.html).

You can use `REVOKE` to directly revoke privileges from a role or user, or you can revoke membership to an existing role, which effectively revokes that role's privileges.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/revoke.html %}
</div>

### Parameters

Parameter                   | Description
----------------------------|------------
`ALL`<br>`ALL PRIVILEGES`   | Revoke all [privileges](#supported-privileges).
`targets`                   | A comma-separated list of database or table names, preceded by the object type (e.g., `DATABASE mydatabase`).<br>{{site.data.alerts.callout_info}}To revoke privileges on all tables in a database or schema, you can use `REVOKE ... ON TABLE *`. For an example, see [Revoke privileges on all tables in a database or schema](#revoke-privileges-on-all-tables-in-a-database-or-schema).{{site.data.alerts.end}}
`name_list`                 | A comma-separated list of [users and roles](security-reference/authorization.html#users-and-roles).
`target_types`              | A comma-separated list of [user-defined types](create-type.html).
`schema_name_list`          | A comma-separated list of [schemas](create-schema.html).
`ALL TABLES IN SCHEMA`      |  Revoke privileges on all tables in a schema or list of schemas.
`privilege_list`            | A comma-separated list of [privileges](security-reference/authorization.html#managing-privileges) to revoke.
`WITH ADMIN OPTION`         | Designate the user as a role admin. Role admins can [grant](grant.html) or revoke membership for the specified role.

## Supported privileges

The following privileges can be revoked:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

- To revoke privileges, user revoking privileges must have the `GRANT` privilege on the target [database](create-database.html), [schema](create-schema.html), [table](create-table.html), or [user-defined type](enum.html). In addition to the `GRANT` privilege, the user revoking privileges must have the privilege being revoked on the target object. For example, a user revoking the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

- To revoke role membership, the user revoking role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role. To remove membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Considerations

- The `root` user cannot be revoked from the `admin` role.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Revoke privileges on databases

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH PASSWORD roach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE movr TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type
----------------+---------+-----------------
  movr          | admin   | ALL
  movr          | max     | CREATE
  movr          | root    | ALL
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE CREATE ON DATABASE movr FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type
----------------+---------+-----------------
  movr          | admin   | ALL
  movr          | root    | ALL
(2 rows)
~~~

{{site.data.alerts.callout_info}}
Any tables that previously inherited the database-level privileges retain the privileges.
{{site.data.alerts.end}}

### Revoke privileges on specific tables in a database

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT DELETE ON TABLE rides TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
----------------+-------------+------------+---------+-----------------
  movr          | public      | rides      | admin   | ALL
  movr          | public      | rides      | max     | DELETE
  movr          | public      | rides      | root    | ALL
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE DELETE ON TABLE rides FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
----------------+-------------+------------+---------+-----------------
  movr          | public      | rides      | admin   | ALL
  movr          | public      | rides      | root    | ALL
(2 rows)
~~~

### Revoke privileges on all tables in a database or schema

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE, SELECT, DELETE ON TABLE rides, users TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE movr.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type
----------------+-------------+----------------------------+---------+-----------------
  movr          | public      | promo_codes                | admin   | ALL
  movr          | public      | promo_codes                | root    | ALL
  movr          | public      | rides                      | admin   | ALL
  movr          | public      | rides                      | max     | CREATE
  movr          | public      | rides                      | max     | DELETE
  movr          | public      | rides                      | max     | SELECT
  movr          | public      | rides                      | root    | ALL
  movr          | public      | user_promo_codes           | admin   | ALL
  movr          | public      | user_promo_codes           | root    | ALL
  movr          | public      | users                      | admin   | ALL
  movr          | public      | users                      | max     | CREATE
  movr          | public      | users                      | max     | DELETE
  movr          | public      | users                      | max     | SELECT
  movr          | public      | users                      | root    | ALL
  movr          | public      | vehicle_location_histories | admin   | ALL
  movr          | public      | vehicle_location_histories | root    | ALL
  movr          | public      | vehicles                   | admin   | ALL
  movr          | public      | vehicles                   | root    | ALL
(18 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE DELETE ON movr.* FROM max;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type
----------------+-------------+----------------------------+---------+-----------------
  movr          | public      | promo_codes                | admin   | ALL
  movr          | public      | promo_codes                | root    | ALL
  movr          | public      | rides                      | admin   | ALL
  movr          | public      | rides                      | max     | CREATE
  movr          | public      | rides                      | max     | SELECT
  movr          | public      | rides                      | root    | ALL
  movr          | public      | user_promo_codes           | admin   | ALL
  movr          | public      | user_promo_codes           | root    | ALL
  movr          | public      | users                      | admin   | ALL
  movr          | public      | users                      | max     | CREATE
  movr          | public      | users                      | max     | SELECT
  movr          | public      | users                      | root    | ALL
  movr          | public      | vehicle_location_histories | admin   | ALL
  movr          | public      | vehicle_location_histories | root    | ALL
  movr          | public      | vehicles                   | admin   | ALL
  movr          | public      | vehicles                   | root    | ALL
(16 rows)
~~~


### Revoke privileges on schemas

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON SCHEMA cockroach_labs TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type
----------------+----------------+---------+-----------------
  movr          | cockroach_labs | admin   | ALL
  movr          | cockroach_labs | max     | ALL
  movr          | cockroach_labs | root    | ALL
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE CREATE ON SCHEMA cockroach_labs FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type
----------------+----------------+---------+-----------------
  movr          | cockroach_labs | admin   | ALL
  movr          | cockroach_labs | max     | GRANT
  movr          | cockroach_labs | max     | USAGE
  movr          | cockroach_labs | root    | ALL
(4 rows)
~~~

### Revoke privileges on user-defined types

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON TYPE status TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type
----------------+-------------+-----------+---------+-----------------
  movr          | public      | status    | admin   | ALL
  movr          | public      | status    | max     | ALL
  movr          | public      | status    | public  | USAGE
  movr          | public      | status    | root    | ALL
(4 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE GRANT ON TYPE status FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type
----------------+-------------+-----------+---------+-----------------
  movr          | public      | status    | admin   | ALL
  movr          | public      | status    | max     | USAGE
  movr          | public      | status    | public  | USAGE
  movr          | public      | status    | root    | ALL
(4 rows)
~~~

### Revoke role membership

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE developer WITH CREATEDB;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER abbey WITH PASSWORD lincoln;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT developer TO abbey;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |  false
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE developer FROM abbey;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
(0 rows)
~~~

### Revoke the admin option

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT developer TO abbey WITH ADMIN OPTION;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |   true
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE ADMIN OPTION FOR developer FROM abbey;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |  false
(1 row)
~~~



## See also

- [Authorization](authorization.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [SQL Statements](sql-statements.html)
