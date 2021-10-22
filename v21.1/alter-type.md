---
title: ALTER TYPE
summary: The ALTER TYPE statement modifies a user-defined data type in a database.
toc: true
---

The `ALTER TYPE` [statement](sql-statements.html) modifies a user-defined, [enumerated data type](enum.html) in the current database.

{{site.data.alerts.callout_info}}
You can only [cancel](cancel-job.html) `ALTER TYPE` [schema change jobs](online-schema-changes.html) that drop values. All other `ALTER TYPE` schema change jobs are non-cancellable.
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/alter_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the user-defined type.
`ADD VALUE value` | Add a constant value to the user-defined type's list of values. You can optionally specify `BEFORE value` or `AFTER value` to add the value in sort order relative to an existing value.
`DROP VALUE value` | <span class="version-tag">New in v21.1:</span> Drop a specific value from the user-defined type's list of values.<br>{{site.data.alerts.callout_info}}`ALTER TYPE ... DROP VALUE` is disabled by default with the `enable_drop_enum_value` [cluster setting](cluster-settings.html) set to `off`. To enable `ALTER TYPE ... DROP VALUE`, run `SET enable_drop_enum_value = on;`.{{site.data.alerts.end}}
`RENAME TO name` | Rename the user-defined type.
`RENAME VALUE value TO value` |  Rename a constant value in the user-defined type's list of values.
`SET SCHEMA`  | Set [the schema](sql-name-resolution.html) of the user-defined type.
`OWNER TO`  | Change the [role specification](grant.html) for the user-defined type's owner.

## Required privileges

- To [alter a type](alter-type.html), the user must be the owner of the type.
- To set the schema of a user-defined type, the user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the schema and the `DROP` privilege
on the type.
- To alter the owner of a user-defined type:
    - The user executing the command must be a member of the new owner role.
    - The new owner role must have the `CREATE` privilege on the schema the type belongs to.

## Known limitations

- You can only reference a user-defined type from the database that contains the type.
- Expressions in [views](views.html), [default values](default-value.html), and [computed columns](computed-columns.html) will stop working if they reference an `ENUM` value dropped by an `ALTER TYPE ... DROP VALUE` statement. As a result, `ALTER TYPE ... DROP VALUE` is disabled by default with the `enable_drop_enum_value` [cluster setting](cluster-settings.html) set to `off`. You can enable `ALTER TYPE ... DROP VALUE` by running `SET enable_drop_enum_value = on;`.

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE status ADD VALUE 'pending';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME VALUE 'open' TO 'active';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME TO account_status;
~~~

{% include copy-clipboard.html %}
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

To drop a value from the `account_status` type, use a `DROP VALUE` clause.

Note that expressions in [views](views.html), [default values](default-value.html), and [computed columns](computed-columns.html) will stop working if they reference a dropped `ENUM` value. As a result, `ALTER TYPE ... DROP VALUE` is disabled by default with the `enable_drop_enum_value` [cluster setting](cluster-settings.html) set to `off`.

To enable `ALTER TYPE ... DROP VALUE`:

{% include copy-clipboard.html %}
~~~ sql
> SET enable_drop_enum_value = on;
~~~

Then, to drop a value from the type:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE account_status DROP VALUE 'inactive';
~~~

{% include copy-clipboard.html %}
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

- [`CREATE TYPE`](create-type.html)
- [`ENUM`](enum.html)
- [`SHOW ENUMS`](show-enums.html)
- [`DROP TYPE`](drop-type.html)
