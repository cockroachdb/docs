---
title: ALTER TYPE
summary: The ALTER TYPE statement modifies a user-defined data type in a database.
toc: true
docs_area: reference.sql
---

The `ALTER TYPE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) modifies a [user-defined data type]({% link {{ page.version.version }}/create-type.md %}) in the current database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the user-defined type.
`ADD VALUE value` | Add a constant value to the user-defined type's list of values. You can optionally specify `BEFORE value` or `AFTER value` to add the value in sort order relative to an existing value.
`DROP VALUE value` |  Drop a specific value from the user-defined type's list of values.
`RENAME TO name` | Rename the user-defined type.
`RENAME VALUE value TO value` |  Rename a constant value in the user-defined type's list of values.
`SET SCHEMA`  | Set [the schema]({% link {{ page.version.version }}/sql-name-resolution.md %}) of the user-defined type.
`OWNER TO`  | Change the [role specification]({% link {{ page.version.version }}/grant.md %}) for the user-defined type's owner.

## Required privileges

- To [alter a type]({% link {{ page.version.version }}/alter-type.md %}), the user must be the owner of the type.
- To set the schema of a user-defined type, the user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the schema and the `DROP` privilege
on the type.
- To alter the owner of a user-defined type:
    - The user executing the command must be a member of the new owner role.
    - The new owner role must have the `CREATE` privilege on the schema the type belongs to.

## Known limitations

{% include {{ page.version.version }}/known-limitations/alter-type-limitations.md %}

## Example

The following example uses a [user-defined type]({% link {{ page.version.version }}/create-type.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |         values         | owner
---------+--------+------------------------+--------
  public | status | {open,closed,inactive} | demo
(1 row)
~~~

### Add a value to a user-defined type

To add a value to the `status` type, use an `ADD VALUE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE status ADD VALUE 'pending';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |             values             | owner
---------+--------+--------------------------------+--------
  public | status | {open,closed,inactive,pending} | demo
(1 row)
~~~

### Rename a value in a user-defined type

To rename a value in the `status` type, use a `RENAME VALUE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME VALUE 'open' TO 'active';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |              values              | owner
---------+--------+----------------------------------+--------
  public | status | {active,closed,inactive,pending} | demo
(1 row)
~~~

### Rename a user-defined type

To rename the `status` type, use a `RENAME TO` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME TO account_status;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |      name      |              values              | owner
---------+----------------+----------------------------------+--------
  public | account_status | {active,closed,inactive,pending} | demo
(1 row)
~~~

### Drop a value in a user-defined type

To drop a value from the `account_status` type, use a `DROP VALUE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE account_status DROP VALUE 'inactive';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |      name      |         values          | owner
---------+----------------+-------------------------+--------
  public | account_status | {active,closed,pending} | demo
(1 row)
~~~

## See also

- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %})
- [`SHOW TYPES`]({% link {{ page.version.version }}/show-types.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
