---
title: ALTER DEFAULT PRIVILEGES
summary: The ALTER DEFAULT PRIVILEGES statement alters the default privileges for roles in the current database.
keywords: reflection
toc: true
docs_area: reference.sql
---

 The `ALTER DEFAULT PRIVILEGES` [statement](sql-statements.html) changes the [default privileges](security-reference/authorization.html#default-privileges) on objects created by [users/roles](security-reference/authorization.html#roles) in the current database.

{{site.data.alerts.callout_info}}
The creator of an object is also the object's [owner](security-reference/authorization.html#object-ownership). Any roles that are members of the owner role have `ALL` privileges on the object. Altering the default privileges of objects created by a role does not affect that role's privileges as the object's owner. The default privileges granted to other users/roles are always in addition to the ownership (i.e., `ALL`) privileges given to the creator of the object.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If you grant a default privilege to a user/role for all objects created by a specific user/role, neither of the users/roles can be dropped until the default privilege is revoked.

For an example, see [Grant default privileges to a specific role](#grant-default-privileges-to-a-specific-role).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ page.version.version | replace: "v", "" }}/grammar_svg/alter_default_privileges.html %}
</div>

### Parameters

Parameter | Description
----------|------------
`FOR ROLE name`/`FOR USER name` | Alter the default privileges on objects created by a specific role/user, or a list of roles/users.
`FOR ALL ROLES` | Alter the default privileges on objects created by all users/roles.
`GRANT ...` | Grant a default privilege or list of privileges on all objects of the specified type to a role/user, or a list of roles/users.
`REVOKE ...` | Revoke a default privilege or list of privileges on all objects of the specified type from a role/user, or a list of roles/users.
`IN SCHEMA qualifiable_schema_name` | **New in v22.1:** If specified, the default privileges are altered for objects created in that schema. If an object has default privileges specified at
the database and at the schema level, the union of the default privileges are taken.

{{site.data.alerts.callout_info}}
If you do not specify a `FOR ...` clause, CockroachDB alters the default privileges on objects created by the current user.
{{site.data.alerts.end}}

## Required privileges

- To run `ALTER DEFAULT PRIVILEGES FOR ALL ROLES`, the user must be a member of the [`admin`](security-reference/authorization.html#admin-role) role.
- To alter the default privileges on objects created by a specific role, the user must be a member of that role.

## Examples

### Grant default privileges to a specific role

Run the following statements as a member of the `admin` role, with `ALL` privileges:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE cockroachlabs WITH LOGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE defaultdb TO cockroachlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH LOGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DEFAULT PRIVILEGES FOR ROLE cockroachlabs;
~~~

~~~
      role      | for_all_roles | object_type |    grantee    | privilege_type
----------------+---------------+-------------+---------------+-----------------
  cockroachlabs |     false     | schemas     | cockroachlabs | ALL
  cockroachlabs |     false     | sequences   | cockroachlabs | ALL
  cockroachlabs |     false     | tables      | cockroachlabs | ALL
  cockroachlabs |     false     | types       | cockroachlabs | ALL
  cockroachlabs |     false     | types       | public        | USAGE
(5 rows)
~~~

In the same database, run the following statements as the `cockroachlabs` user:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DEFAULT PRIVILEGES FOR ROLE cockroachlabs GRANT SELECT ON TABLES TO max;
~~~

{{site.data.alerts.callout_info}}
Because `cockroachlabs` is the current user, the previous statement is equivalent to `ALTER DEFAULT PRIVILEGES GRANT SELECT ON TABLES TO max;`.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DEFAULT PRIVILEGES;
~~~

~~~
      role      | for_all_roles | object_type |    grantee    | privilege_type
----------------+---------------+-------------+---------------+-----------------
  cockroachlabs |     false     | schemas     | cockroachlabs | ALL
  cockroachlabs |     false     | sequences   | cockroachlabs | ALL
  cockroachlabs |     false     | tables      | cockroachlabs | ALL
  cockroachlabs |     false     | tables      | max           | SELECT
  cockroachlabs |     false     | types       | cockroachlabs | ALL
  cockroachlabs |     false     | types       | public        | USAGE
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE albums (
        id UUID PRIMARY KEY,
        title STRING,
        length DECIMAL,
        tracklist JSONB
);
~~~

In the same database, run the following statements as the `max` user:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE albums;
~~~

~~~
ERROR: user max does not have DROP privilege on relation albums
SQLSTATE: 42501
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM albums;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  title       | STRING    |    true     | NULL           |                       | {primary} |   false
  length      | DECIMAL   |    true     | NULL           |                       | {primary} |   false
  tracklist   | JSONB     |    true     | NULL           |                       | {primary} |   false
(4 rows)
~~~

Because `max` has default `SELECT` privileges on all tables created by `cockroachlabs`, neither user/role can be dropped until all privileges are revoked.

To see this, run the following statements as a member of the `admin` role, with `ALL` privileges:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER max;
~~~

~~~
ERROR: cannot drop role/user max: grants still exist on defaultdb.public.albums
SQLSTATE: 2BP01
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER cockroachlabs;
~~~

~~~
ERROR: cannot drop role/user cockroachlabs: grants still exist on defaultdb, defaultdb.public.albums
SQLSTATE: 2BP01
~~~

### Revoke default privileges from a specific role

Run the following statements as the `cockroachlabs` user:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DEFAULT PRIVILEGES;
~~~

~~~
      role      | for_all_roles | object_type |    grantee    | privilege_type
----------------+---------------+-------------+---------------+-----------------
  cockroachlabs |     false     | schemas     | cockroachlabs | ALL
  cockroachlabs |     false     | sequences   | cockroachlabs | ALL
  cockroachlabs |     false     | tables      | cockroachlabs | ALL
  cockroachlabs |     false     | tables      | max           | SELECT
  cockroachlabs |     false     | types       | cockroachlabs | ALL
  cockroachlabs |     false     | types       | public        | USAGE
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DEFAULT PRIVILEGES FOR ROLE cockroachlabs REVOKE SELECT ON TABLES FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DEFAULT PRIVILEGES;
~~~

~~~
      role      | for_all_roles | object_type |    grantee    | privilege_type
----------------+---------------+-------------+---------------+-----------------
  cockroachlabs |     false     | schemas     | cockroachlabs | ALL
  cockroachlabs |     false     | sequences   | cockroachlabs | ALL
  cockroachlabs |     false     | tables      | cockroachlabs | ALL
  cockroachlabs |     false     | types       | cockroachlabs | ALL
  cockroachlabs |     false     | types       | public        | USAGE
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE tracks (
        id UUID PRIMARY KEY,
        album_id UUID,
        title STRING,
        length DECIMAL
);
~~~

In the same database, run the following statements as the `max` user:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE albums;
~~~

~~~
ERROR: user max does not have DROP privilege on relation albums
SQLSTATE: 42501
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM albums;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  title       | STRING    |    true     | NULL           |                       | {primary} |   false
  length      | DECIMAL   |    true     | NULL           |                       | {primary} |   false
  tracklist   | JSONB     |    true     | NULL           |                       | {primary} |   false
(4 rows)
~~~

`max` still has `SELECT` privileges on `albums` because when `cockroachlabs` created `albums`, `max` was granted default `SELECT` privileges on all tables created by `cockroachlabs`.

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE SELECT ON TABLE albums FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE tracks;
~~~

~~~
ERROR: user max does not have DROP privilege on relation tracks
SQLSTATE: 42501
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM tracks;
~~~

~~~
ERROR: user max has no privileges on relation tracks
SQLSTATE: 42501
~~~

`cockroachlabs` created the `tracks` table after revoking default `SELECT` privileges from `max`. As a result, `max` never had `SELECT` privileges on `tracks`.

Because `max` has no default privileges, the user can now be dropped:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
    username    | options | member_of
----------------+---------+------------
  admin         |         | {}
  cockroachlabs |         | {}
  root          |         | {admin}
(3 rows)
~~~

### Grant default privileges for all roles

Run the following statements as a member of the `admin` role, with `ALL` privileges:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DEFAULT PRIVILEGES FOR ALL ROLES GRANT SELECT ON TABLES TO public;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DEFAULT PRIVILEGES FOR ALL ROLES;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type
-------+---------------+-------------+---------+-----------------
  NULL |     true      | tables      | public  | SELECT
  NULL |     true      | types       | public  | USAGE
(2 rows)
~~~

In the same database, run the following statements as any two different users:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE discographies (
        id UUID PRIMARY KEY,
        artist STRING,
        total_length DECIMAL
);
~~~

{{site.data.alerts.callout_info}}
[`CREATE TABLE`](create-table.html) requires the `CREATE` privilege on the database.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM discographies;
~~~

~~~
  column_name  | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
---------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id           | UUID      |    false    | NULL           |                       | {primary} |   false
  artist       | STRING    |    true     | NULL           |                       | {primary} |   false
  total_length | DECIMAL   |    true     | NULL           |                       | {primary} |   false
(3 rows)
~~~

## See also

- [`SHOW DEFAULT PRIVILEGES`](show-default-privileges.html)
- [SQL Statements](sql-statements.html)
- [Default Privileges](security-reference/authorization.html#default-privileges)
