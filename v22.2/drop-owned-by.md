---
title: DROP OWNED BY
summary: The DROP OWNED BY statement drops all objects owned by and any grants on objects not owned by a role.
toc: true
docs_area: reference.sql
---

The `DROP OWNED BY` [statement](sql-statements.html) drops all objects owned by and any [grants](grant.html) on objects not owned by a [role](security-reference/authorization.html#roles).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The [role](security-reference/authorization.html#roles) must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the specified objects.

`DROP OWNED BY` will result in an error if the user was granted a privilege using the [`GRANT SYSTEM ...`](grant.html#grant-global-privileges-on-the-entire-cluster) command. To work around this, use [`SHOW SYSTEM GRANTS FOR <role>`](show-system-grants.html) and then use [`REVOKE SYSTEM ...`](revoke.html#revoke-global-privileges-on-the-entire-cluster) for each privilege in the result.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_owned_by.html %}</div>

## Parameters

 Parameter | Description
-----------|------------
`role_spec_list` | The source [role](security-reference/authorization.html#roles), or a comma-separated list of source roles.
`RESTRICT` | _(Default)_ Do not drop ownership if any objects (such as [constraints](constraints.html) and tables) use it.
`CASCADE` | Not implemented.

## Known limitations

- [Enum](enum.html) types are not dropped.
{% include {{page.version.version}}/known-limitations/drop-owned-by-role-limitations.md %}
{% include {{page.version.version}}/known-limitations/drop-owned-by-function-limitations.md %}

## Examples

The following examples assume a [local cluster is running](start-a-local-cluster.html). They involve a user we will create called `maxroach` and several tables. The setup is shown below.

From a Terminal window, open a SQL shell as the `root` user:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure --host localhost --port 26257
~~~

Next, create the user `maxroach`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER IF NOT EXISTS maxroach;
~~~

From a second Terminal window, open a SQL shell as the newly created user `maxroach`.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure --host localhost --port 26257 --user maxroach
~~~

### Drop all objects owned by a user/role

From the `maxroach` user's SQL shell, create a table called `max_kv`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS max_kv (k INT, v INT);
~~~

To verify that this table is owned by `maxroach`, use [`SHOW GRANTS`](show-grants.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
  database_name | schema_name | relation_name | grantee  | privilege_type | is_grantable
----------------+-------------+---------------+----------+----------------+---------------
  defaultdb     | public      | max_kv        | maxroach | ALL            |      t
(1 row)
~~~

To drop all of the objects owned by the user `maxroach`, switch to the `root` user's SQL shell and use `DROP OWNED BY`:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP OWNED BY maxroach;
~~~

In this case, `maxroach` only owns the `max_kv` table, so this will drop that table from the database completely. To confirm that the table has been dropped, run [`SHOW TABLES`](show-tables.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~

~~~
SHOW TABLES 0
~~~

From the `root` user's SQL shell, use [`SHOW GRANTS`](show-grants.html) to further confirm that the `maxroach` user has no remaining object grants:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
SHOW GRANTS 0
~~~

### Drop all grants on objects for a user/role

From the `root` user's SQL shell, create a table called `root_kv`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS root_kv (k INT, v INT);
~~~

Next, grant all privileges on that table to user `maxroach` using [`GRANT ALL`](grant.html):

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL on root_kv TO maxroach;
~~~

Next, confirm that the user `maxroach` has all privileges on the table using [`SHOW GRANTS`](show-grants.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
  database_name | schema_name | relation_name | grantee  | privilege_type | is_grantable
----------------+-------------+---------------+----------+----------------+---------------
  defaultdb     | public      | root_kv       | maxroach | ALL            |      f
(1 row)
~~~

Next, switch to the `maxroach` user's SQL shell, and insert some data into the table. It should succeed:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO root_kv(k) select i from generate_series(1,10) as i;
~~~

~~~
INSERT 0 10
~~~

Next, switch to the `root` user's SQL shell and use `DROP OWNED BY` to remove all grants on objects to the user `maxroach`:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP OWNED BY maxroach;
~~~

Next, confirm that the user `maxroach` has no grants on any objects using [`SHOW GRANTS`](show-grants.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS FOR maxroach;
~~~

~~~
SHOW GRANTS 0
~~~

Finally, switch back to the `maxroach` user's SQL shell and try to insert data into the `root_kv` table. This should signal an error:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO root_kv(k) select i from generate_series(1,10) as i;
~~~

~~~
ERROR: user maxroach does not have INSERT privilege on relation root_kv
SQLSTATE: 42501
~~~

## See also

- [Authorization in CockroachDB](security-reference/authorization.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [`REVOKE`](revoke.html)
- [`REASSIGN OWNED`](reassign-owned.html)
- [`DROP ROLE`](drop-role.html)
- [`SHOW TABLES`](show-tables.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
