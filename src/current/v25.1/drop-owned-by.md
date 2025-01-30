---
title: DROP OWNED BY
summary: The DROP OWNED BY statement drops all objects owned by and any grants on objects not owned by a role.
toc: true
docs_area: reference.sql
---

The `DROP OWNED BY` [statement]({{ page.version.version }}/sql-statements.md) drops all objects owned by and any [grants]({{ page.version.version }}/grant.md) on objects not owned by a [role]({{ page.version.version }}/security-reference/authorization.md#roles).


## Required privileges

The [role]({{ page.version.version }}/security-reference/authorization.md#roles) must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the specified objects.

`DROP OWNED BY` will result in an error if the user was granted a [system-level privilege]({{ page.version.version }}/security-reference/authorization.md#supported-privileges) (i.e., using the [`GRANT SYSTEM ...`]({{ page.version.version }}/grant.md#grant-system-level-privileges-on-the-entire-cluster) statement). To work around this, use [`SHOW SYSTEM GRANTS FOR <role>`]({{ page.version.version }}/show-system-grants.md) and then use [`REVOKE SYSTEM ...`]({{ page.version.version }}/revoke.md#revoke-system-level-privileges-on-the-entire-cluster) for each system-level privilege in the result.

## Synopsis


## Parameters

 Parameter | Description
-----------|------------
`role_spec_list` | The source [role]({{ page.version.version }}/security-reference/authorization.md#roles), or a comma-separated list of source roles.
`RESTRICT` | _(Default)_ Do not drop ownership if any objects (such as [constraints]({{ page.version.version }}/constraints.md) and tables) use it.
`CASCADE` | Not implemented.

## Known limitations


## Examples

The following examples assume a [local cluster is running]({{ page.version.version }}/start-a-local-cluster.md). They involve a user we will create called `maxroach` and several tables. The setup is shown below.

From a Terminal window, open a SQL shell as the `root` user:

~~~ shell
cockroach sql --insecure --host localhost --port 26257
~~~

Next, create the user `maxroach`:

~~~ sql
CREATE USER IF NOT EXISTS maxroach;
~~~

From a second Terminal window, open a SQL shell as the newly created user `maxroach`.

~~~ shell
cockroach sql --insecure --host localhost --port 26257 --user maxroach
~~~

### Drop all objects owned by a user/role

From the `maxroach` user's SQL shell, create a table called `max_kv`:

~~~ sql
CREATE TABLE IF NOT EXISTS max_kv (k INT, v INT);
~~~

To verify that this table is owned by `maxroach`, use [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md):

~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
  database_name | schema_name | object_name   | grantee  | privilege_type | is_grantable
----------------+-------------+---------------+----------+----------------+---------------
  defaultdb     | public      | max_kv        | maxroach | ALL            |      t
(1 row)
~~~

To drop all of the objects owned by the user `maxroach`, switch to the `root` user's SQL shell and use `DROP OWNED BY`:

~~~ sql
DROP OWNED BY maxroach;
~~~

In this case, `maxroach` only owns the `max_kv` table, so this will drop that table from the database completely. To confirm that the table has been dropped, run [`SHOW TABLES`]({{ page.version.version }}/show-tables.md):

~~~ sql
SHOW TABLES;
~~~

~~~
SHOW TABLES 0
~~~

From the `root` user's SQL shell, use [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md) to further confirm that the `maxroach` user has no remaining object grants:

~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
SHOW GRANTS 0
~~~

### Drop all grants on objects for a user/role

From the `root` user's SQL shell, create a table called `root_kv`:

~~~ sql
CREATE TABLE IF NOT EXISTS root_kv (k INT, v INT);
~~~

Next, grant all privileges on that table to user `maxroach` using [`GRANT ALL`]({{ page.version.version }}/grant.md):

~~~ sql
GRANT ALL on root_kv TO maxroach;
~~~

Next, confirm that the user `maxroach` has all privileges on the table using [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md):

~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
  database_name | schema_name | object_name   | grantee  | privilege_type | is_grantable
----------------+-------------+---------------+----------+----------------+---------------
  defaultdb     | public      | root_kv       | maxroach | ALL            |      f
(1 row)
~~~

Next, switch to the `maxroach` user's SQL shell, and insert some data into the table. It should succeed:

~~~ sql
INSERT INTO root_kv(k) select i from generate_series(1,10) as i;
~~~

~~~
INSERT 0 10
~~~

Next, switch to the `root` user's SQL shell and use `DROP OWNED BY` to remove all grants on objects to the user `maxroach`:

~~~ sql
DROP OWNED BY maxroach;
~~~

Next, confirm that the user `maxroach` has no grants on any objects using [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md):

~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
SHOW GRANTS 0
~~~

Finally, switch back to the `maxroach` user's SQL shell and try to insert data into the `root_kv` table. This should signal an error:

~~~ sql
INSERT INTO root_kv(k) select i from generate_series(1,10) as i;
~~~

~~~
ERROR: user maxroach does not have INSERT privilege on relation root_kv
SQLSTATE: 42501
~~~

## See also

- [Authorization in CockroachDB]({{ page.version.version }}/security-reference/authorization.md)
- [`GRANT`]({{ page.version.version }}/grant.md)
- [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md)
- [`REVOKE`]({{ page.version.version }}/revoke.md)
- [`REASSIGN OWNED`]({{ page.version.version }}/reassign-owned.md)
- [`DROP ROLE`]({{ page.version.version }}/drop-role.md)
- [`SHOW TABLES`]({{ page.version.version }}/show-tables.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)