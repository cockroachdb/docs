---
title: ALTER TYPE
summary: The ALTER TYPE statement modifies a user-defined data type in a database.
toc: true
---

 The `ALTER TYPE` [statement](sql-statements.html) modifies a user-defined, [enumerated data type](enum.html) in the current database.

{{site.data.alerts.callout_info}}
You can only reference a user-defined type from the database that contains the type.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/alter_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the user-defined type.
`ADD VALUE value` | Add a constant value to the user-defined type's list of values. You can optionally specify `BEFORE value` or `AFTER value` to add the value in sort order relative to an existing value.
`RENAME TO name` | Rename the user-defined type.
`RENAME VALUE value TO value` |  Rename a constant value in the user-defined type's list of values.
`SET SCHEMA`  | Set [the schema](sql-name-resolution.html) of the user-defined type.
`OWNER TO`  | Change the [role specification](grant-roles.html) for the user-defined type's owner.

## Required privileges

- To [alter a type](alter-type.html), the user must be the owner of the type.
- To set the schema of a user-defined type, the user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the schema and the `DROP` privilege
on the type.
- To alter the owner of a user-defined type:
    - The user executing the command must be a member of the new owner role.
    - The new owner role must have the `CREATE` privilege on the schema the type belongs to.

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
  schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE status ADD VALUE 'pending';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME VALUE 'open' TO 'active';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME TO account_status;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |      name      |             value
---------+----------------+---------------------------------
  public | account_status | active|closed|inactive|pending
(1 row)
~~~

## See also

- [`CREATE TYPE`](create-type.html)
- [`ENUM`](enum.html)
- [`SHOW ENUMS`](show-enums.html)
- [`DROP TYPE`](drop-type.html)
