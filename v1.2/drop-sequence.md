---
title: DROP SEQUENCE
summary:
toc: false
---

<span class="version-tag">New in v2.0:</span> The `DROP SEQUENCE` [statement](sql-statements.html) removes a sequence from a database.

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Synopsis

~~~
DROP SEQUENCE [IF EXISTS] <sequenceName> [, ...] [CASCADE | RESTRICT]
~~~

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`IF EXISTS` |  Drop the sequence only if it exists; if it does not exist, do not return an error.
`sequenceName` | The name of the sequence you want to drop. Find the sequence name with `SHOW CREATE TABLE` on the table that uses the sequence.
`CASCADE` | Drop all objects (such as [constraints](constraints.html) and tables) that depend on the sequence.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT` | _(Default)_ Do not drop the sequence if any objects (such as [constraints](constraints.html) and tables) depend on it.

## Examples

### Remove a Sequence (No Dependencies)

In this example, other objects do not depend on the sequence being dropped.

{% include copy-clipboard.html %}
~~~ sql
> DROP SEQUENCE customer_seq;
~~~
~~~
DROP SEQUENCE
~~~

### Remove a Sequence and Dependent Objects with `CASCADE`

In this example, a table depends on the sequence that's being dropped. Therefore, it's only possible to drop the sequence while simultaneously dropping the dependent table using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

~~~ sql
> DROP SEQUENCE customer_seq CASCADE;
~~~
~~~
DROP SEQUENCE
~~~

## See Also
- [CREATE SEQUENCE](create-sequence.html)
- [ALTER SEQUENCE](alter-sequence.html)
- [Functions and Operators](functions-and-operators.html)
