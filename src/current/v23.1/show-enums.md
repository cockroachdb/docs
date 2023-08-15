---
title: SHOW ENUMS
summary: The SHOW ENUMS statement lists the enumerated data types in a database.
toc: true
docs_area: reference.sql
---

The `SHOW ENUMS` statement lists the [enumerated data types]({% link {{ page.version.version }}/enum.md %}) in the current database.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_enums.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name`<br>`name.name` | The name of the [schema]({% link {{ page.version.version }}/create-schema.md %}) from which to show enumerated data types, or the name of the [database]({% link {{ page.version.version }}/create-database.md %}) and the [schema]({% link {{ page.version.version }}/create-schema.md %}), separated by a "`.`".

## Examples

The following example creates a [user-defined type]({% link {{ page.version.version }}/create-type.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE weekend AS ENUM ('sunday', 'saturday');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name   |                   values                   | owner
---------+---------+--------------------------------------------+--------
  public | weekday | {monday,tuesday,wednesday,thursday,friday} | demo
  public | weekend | {sunday,saturday}                          | demo
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS FROM movr.public;
~~~

~~~
  schema |  name   |                   values                   | owner
---------+---------+--------------------------------------------+--------
  public | weekday | {monday,tuesday,wednesday,thursday,friday} | demo
  public | weekend | {sunday,saturday}                          | demo
(2 rows)
~~~


## See also

- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [Data types]({% link {{ page.version.version }}/data-types.md %})
- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
