---
title: Selection Clauses
summary: Selection clauses define tabular data.
toc: false
toc_not_nested: true
---

Selection clauses define tabular data. [`SELECT`](select-clause.html)
is the most common selection clause. They can be used either as
[standalone
statements](relational-expressions.html#statement-like-queries),
or as [subqueries in table
expressions](table-expressions.html#subqueries-as-table-expressions).

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/select_clause.html %}

<div markdown="1"></div>

## Overview

There are four specific syntax forms collectively named selection clauses:

Form | Usage
-----|--------
[`VALUES`](#values-clause) | List tabular data by the client.
[`TABLE`](#table-clause) | Load tabular data from the database.
[`SELECT`](#select-clause) | Load or compute tabular data from various sources.
[Set Operations](set-operations.html) | Combine tabular data from two or more selection clauses.

{{site.data.alerts.callout_info}}To combine selection clauses with <a href="query-order.html"><code>ORDER BY</code></a>, <a href="limit-offset.html"><code>LIMIT</code> or <code>OFFSET</code></a>, use a <a href="relational-expressions.html#statement-like-queries">Statement-like Query</a>.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}To perform joins or other relational operations over selection clauses, use a <a href="table-expressions.html">table expression</a> and <a href="relational-expressions.html#composability">convert it back</a> into a selection clause with <a href="#table-clause"><code>TABLE</code></a> or <a href="select-clause.html"><code>SELECT</code></a>.{{site.data.alerts.end}}

## `VALUES` Clause

### Syntax

{% include sql/{{ page.version.version }}/diagrams/values_clause.html %}

A `VALUES` clause defines tabular data defined by the expressions
listed within parentheses. Each parenthesis group defines a single row
in the resulting table.

The columns of the resulting table data have automatically generated
names. [These names can be modified with
`AS`](table-expressions.html#aliased-table-expressions) when the
`VALUES` clause is used as a sub-query.

### Example

{% include copy-clipboard.html %}
~~~sql
> VALUES (1, 2, 3), (4, 5, 6);
~~~

~~~
+---------+---------+---------+
| column1 | column2 | column3 |
+---------+---------+---------+
|       1 |       2 |       3 |
|       4 |       5 |       6 |
+---------+---------+---------+
~~~

## `TABLE` Clause

### Syntax

{% include sql/{{ page.version.version }}/diagrams/table_clause.html %}

<div markdown="1"></div>

A `TABLE` clause reads tabular data from a specified table. The
columns of the resulting table data are named after the schema of the
table.

In general, `TABLE x` is equivalent to `SELECT * FROM x`, but it is
shorter to type. 

{{site.data.alerts.callout_info}}Any <a href="table-expressions.html">table expression</a> between parentheses is a valid operand for <code>TABLE</code>, not just
<a href="table-expressions.html#table-or-view-names">simple table or view names</a>.{{site.data.alerts.end}}

### Example

{% include copy-clipboard.html %}
~~~sql
> CREATE TABLE employee_copy AS TABLE employee;
~~~

This statement copies the content from table `employee` into a new
table. However, note that the `TABLE` clause does not preserve the indexing,
foreign key, or constraint and default information from the schema of the
table it reads from, so in this example, the new table `employee_copy`
will likely have a simpler schema than `employee`.

Other examples:

{% include copy-clipboard.html %}
~~~sql
> TABLE employee;
~~~

{% include copy-clipboard.html %}
~~~sql
> INSERT INTO employee_copy TABLE employee;
~~~

## `SELECT` Clause

Simple `SELECT` clauses are commonly found as [standalone queries](relational-expressions.html#statement-like-queries). However, it is important to note
the broader application of `SELECT` clauses, which can be used
alongside the other two selection clause forms everywhere such a
clause is admissible.

See [Simple `SELECT` Clause](select-clause.html) for more
details.

## Set Operations

See [Set Operations](set-operations.html) for more
details.

## See Also

- [Simple `SELECT` Clause](select-clause.html)
- [Table Expressions](table-expressions.html)
- [Set Operations](set-operations.html)
- [Relational Expressions](relational-expressions.html)
