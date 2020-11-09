---
title: REVOKE &lt;privileges&gt;
summary: The REVOKE statement revokes privileges from users and/or roles.
toc: true
---

The `REVOKE <privileges>` [statement](sql-statements.html) revokes [privileges](authorization.html#assign-privileges) from [users](authorization.html#create-and-manage-users) and/or [roles](authorization.html#create-and-manage-roles).

For the list of privileges that can be granted to and revoked from users and roles, see [`GRANT`](grant.html).

## Syntax

### Revoke privileges

To revoke privileges from a user or role, use the following syntax:

~~~
REVOKE {ALL | <privileges...> } ON {DATABASE | SCHEMA | TABLE | TYPE} <targets...> FROM <grantees...>
~~~

### Revoke `admin`

To revoke the [`admin`](authorization.html#role-admin) privileges from a role, use the following syntax:

~~~
REVOKE [ADMIN OPTION FOR] <roles...> FROM <grantees...>
~~~

## Parameters

Parameter       | Description
----------------|------------
`ALL`           | Revoke all [privileges](#supported-privileges).
`privileges`    | A comma-separated list of privileges to revoke. For a list of supported privileges, see [Supported privileges](#supported-privileges).
`targets`       | A comma-separated list of database, schema, table, or user-defined type names.<br><br>{{site.data.alerts.callout_info}}To revoke privileges from all tables in a database or schema, you can use `REVOKE ... ON TABLE *`. For an example, see [Revoke privileges on all tables in a database or schema](#revoke-privileges-on-all-tables-in-a-database-or-schema).{{site.data.alerts.end}}
`grantees`         | A comma-separated list of [users](authorization.html#create-and-manage-users) and/or [roles](authorization.html#create-and-manage-roles) from whom to revoke privileges.

## Supported privileges

The following privileges can be revoked:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

The user revoking privileges must have the `GRANT` privilege on the target [database](create-database.html), [schema](create-schema.html), [table](create-table.html), or [user-defined type](enum.html).

In addition to the `GRANT` privilege, the user revoking privileges must have the privilege being revoked on the target object. For example, a user revoking the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Revoke privileges on databases

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH PASSWORD roach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE movr TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name |    schema_name     | grantee | privilege_type
----------------+--------------------+---------+-----------------
  movr          | crdb_internal      | admin   | ALL
  movr          | crdb_internal      | max     | CREATE
  movr          | crdb_internal      | root    | ALL
  movr          | information_schema | admin   | ALL
  movr          | information_schema | max     | CREATE
  movr          | information_schema | root    | ALL
  movr          | pg_catalog         | admin   | ALL
  movr          | pg_catalog         | max     | CREATE
  movr          | pg_catalog         | root    | ALL
  movr          | pg_extension       | admin   | ALL
  movr          | pg_extension       | max     | CREATE
  movr          | pg_extension       | root    | ALL
  movr          | public             | admin   | ALL
  movr          | public             | max     | CREATE
  movr          | public             | root    | ALL
(15 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> REVOKE CREATE ON DATABASE movr FROM max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name |    schema_name     | grantee | privilege_type
----------------+--------------------+---------+-----------------
  movr          | crdb_internal      | admin   | ALL
  movr          | crdb_internal      | root    | ALL
  movr          | information_schema | admin   | ALL
  movr          | information_schema | root    | ALL
  movr          | pg_catalog         | admin   | ALL
  movr          | pg_catalog         | root    | ALL
  movr          | pg_extension       | admin   | ALL
  movr          | pg_extension       | root    | ALL
  movr          | public             | admin   | ALL
  movr          | public             | root    | ALL
(10 rows)
~~~

{{site.data.alerts.callout_info}}
Any tables that previously inherited the database-level privileges retain the privileges.
{{site.data.alerts.end}}

### Revoke privileges on specific tables in a database

{% include copy-clipboard.html %}
~~~ sql
> GRANT DELETE ON TABLE rides TO max;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> REVOKE DELETE ON TABLE rides FROM max;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> GRANT CREATE, SELECT, DELETE ON TABLE rides, users TO max;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON SCHEMA cockroach_labs TO max;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> REVOKE CREATE ON SCHEMA cockroach_labs FROM max;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON TYPE status TO max;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> REVOKE GRANT ON TYPE status FROM max;
~~~

{% include copy-clipboard.html %}
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

## See also

- [Authorization](authorization.html)
- [`GRANT <privileges>`](grant.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [Other SQL Statements](sql-statements.html)
