---
title: GRANT &lt;privileges&gt;
summary: The GRANT statement grants user privileges for interacting with specific database objects
toc: true
---

The `GRANT <privileges>` [statement](sql-statements.html) lets you control each [role](authorization.html#create-and-manage-roles) or [user's](authorization.html#create-and-manage-users) SQL [privileges](authorization.html#assign-privileges) for interacting with specific [databases](create-database.html), [schemas](create-schema.html), [tables](create-table.html), or [user-defined types](enum.html).

For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

## Syntax

~~~
GRANT {ALL | <privileges...>} ON {DATABASE | SCHEMA | TABLE | TYPE} <targets...> TO <users...>
~~~

## Parameters

Parameter       | Description
----------------|------------
`ALL`           | Grant all [privileges](#supported-privileges).
`privileges`    | A comma-separated list of privileges to grant. For a list of supported privileges, see [Supported privileges](#supported-privileges).
`targets`       | A comma-separated list of database, schema, table, or user-defined type names.<br><br>{{site.data.alerts.callout_info}}To grant privileges on all tables in a database or schema, you can use `GRANT ... ON TABLE *`. For an example, see [Grant privileges on all tables in a database or schema](#grant-privileges-on-all-tables-in-a-database-or-schema).{{site.data.alerts.end}}
`users`         | A comma-separated list of [users](authorization.html#create-and-manage-users) and/or [roles](authorization.html#create-and-manage-roles) to whom you want to grant privileges.

## Supported privileges

Roles and users can be granted the following privileges:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

The user granting privileges must also have the privilege being granted on the target database or tables. For example, a user granting the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

## Details

- When a role or user is granted privileges for a database, new tables created in the database will inherit the privileges, but the privileges can then be changed.

    {{site.data.alerts.callout_info}}
    The user does not get privileges to existing tables in the database. To grant privileges to a user on all existing tables in a database, see [Grant privileges on all tables in a database](#grant-privileges-on-all-tables-in-a-database-or-schema)
    {{site.data.alerts.end}}

- When a role or user is granted privileges for a table, the privileges are limited to the table.
- The `root` user automatically belongs to the `admin` role and has the `ALL` privilege for new databases.
- For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Grant privileges on databases

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH PASSWORD roach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE movr TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name |    schema_name     | grantee | privilege_type
----------------+--------------------+---------+-----------------
  movr          | cockroach_labs     | admin   | ALL
  movr          | cockroach_labs     | max     | ALL
  movr          | cockroach_labs     | root    | ALL
  movr          | crdb_internal      | admin   | ALL
  movr          | crdb_internal      | max     | ALL
  movr          | crdb_internal      | root    | ALL
  movr          | information_schema | admin   | ALL
  movr          | information_schema | max     | ALL
  movr          | information_schema | root    | ALL
  movr          | pg_catalog         | admin   | ALL
  movr          | pg_catalog         | max     | ALL
  movr          | pg_catalog         | root    | ALL
  movr          | pg_extension       | admin   | ALL
  movr          | pg_extension       | max     | ALL
  movr          | pg_extension       | root    | ALL
  movr          | public             | admin   | ALL
  movr          | public             | max     | ALL
  movr          | public             | root    | ALL
(18 rows)
~~~

### Grant privileges on specific tables in a database

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

### Grant privileges on all tables in a database or schema

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON TABLE movr.public.* TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE movr.public.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type
----------------+-------------+----------------------------+---------+-----------------
  movr          | public      | promo_codes                | admin   | ALL
  movr          | public      | promo_codes                | max     | SELECT
  movr          | public      | promo_codes                | root    | ALL
  movr          | public      | rides                      | admin   | ALL
  movr          | public      | rides                      | max     | DELETE
  movr          | public      | rides                      | max     | SELECT
  movr          | public      | rides                      | root    | ALL
  movr          | public      | user_promo_codes           | admin   | ALL
  movr          | public      | user_promo_codes           | max     | SELECT
  movr          | public      | user_promo_codes           | root    | ALL
  movr          | public      | users                      | admin   | ALL
  movr          | public      | users                      | max     | ALL
  movr          | public      | users                      | root    | ALL
  movr          | public      | vehicle_location_histories | admin   | ALL
  movr          | public      | vehicle_location_histories | max     | SELECT
  movr          | public      | vehicle_location_histories | root    | ALL
  movr          | public      | vehicles                   | admin   | ALL
  movr          | public      | vehicles                   | max     | SELECT
  movr          | public      | vehicles                   | root    | ALL
(19 rows)
~~~

### Make a table readable to every user in the system

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON TABLE vehicles TO public;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE vehicles;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
----------------+-------------+------------+---------+-----------------
  movr          | public      | vehicles   | admin   | ALL
  movr          | public      | vehicles   | max     | SELECT
  movr          | public      | vehicles   | public  | SELECT
  movr          | public      | vehicles   | root    | ALL
(4 rows)
~~~

### Grant privileges on schemas

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

### Grant privileges on user-defined types

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

### Grant the privilege to manage the replication zones for a database or table

{% include copy-clipboard.html %}
~~~ sql
> GRANT ZONECONFIG ON TABLE rides TO max;
~~~

The user `max` can then use the [`CONFIGURE ZONE`](configure-zone.html) statement to to add, modify, reset, or remove replication zones for the table `rides`.

## See also

- [Authorization](authorization.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [Manage Users](authorization.html#create-and-manage-users)
