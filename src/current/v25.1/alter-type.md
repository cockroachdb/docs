---
title: ALTER TYPE
summary: The ALTER TYPE statement modifies a user-defined data type in a database.
toc: true
docs_area: reference.sql
---

The `ALTER TYPE` [statement]({{ page.version.version }}/sql-statements.md) modifies a [user-defined data type]({{ page.version.version }}/create-type.md) in the current database.


## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the user-defined type.
`ADD VALUE value` | Add a constant value to the user-defined type's list of values. You can optionally specify `BEFORE value` or `AFTER value` to add the value in sort order relative to an existing value.
`DROP VALUE value` |  Drop a specific value from the user-defined type's list of values.
`RENAME TO name` | Rename the user-defined type.
`RENAME VALUE value TO value` |  Rename a constant value in the user-defined type's list of values.
`SET SCHEMA`  | Set [the schema]({{ page.version.version }}/sql-name-resolution.md) of the user-defined type.
`OWNER TO`  | Change the [role specification]({{ page.version.version }}/grant.md) for the user-defined type's owner.

## Required privileges

- To [alter a type]({{ page.version.version }}/alter-type.md), the user must be the owner of the type.
- To set the schema of a user-defined type, the user must have the `CREATE` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the schema and the `DROP` privilege
on the type.
- To alter the owner of a user-defined type:
    - The user executing the command must be a member of the new owner role.
    - The new owner role must have the `CREATE` privilege on the schema the type belongs to.

## Known limitations


## Example

The following example uses a [user-defined type]({{ page.version.version }}/create-type.md).

~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

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

~~~ sql
> ALTER TYPE status ADD VALUE 'pending';
~~~

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

~~~ sql
> ALTER TYPE status RENAME VALUE 'open' TO 'active';
~~~

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

~~~ sql
> ALTER TYPE status RENAME TO account_status;
~~~

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

~~~ sql
> ALTER TYPE account_status DROP VALUE 'inactive';
~~~

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

- [`CREATE TYPE`]({{ page.version.version }}/create-type.md)
- [`ENUM`]({{ page.version.version }}/enum.md)
- [`SHOW ENUMS`]({{ page.version.version }}/show-enums.md)
- [`SHOW TYPES`]({{ page.version.version }}/show-types.md)
- [`DROP TYPE`]({{ page.version.version }}/drop-type.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)