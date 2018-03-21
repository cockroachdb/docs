---
title: Set Operations
summary: Set operations combine tabular data from two selection clauses.
toc: false
---

Set operations combine data from two [selection
clauses](selection-clauses.html). They are valid as operand to other
set operations or a [statement-like
query](relational-expressions.html#statement-like-queries).

<div id="toc"></div>

## Synopsis

<div>{% include sql/{{ page.version.version }}/diagrams/set_operation.html %}</div>

<div markdown="1"></div>

SQL lets you compare the results of multiple [selection clauses](selection-clauses.html). You can think of each of the set operators as representing a Boolean operator:

- `UNION` = OR
- `INTERSECT` = AND
- `EXCEPT` = NOT

By default, each of these comparisons displays only one copy of each value (similar to `SELECT DISTINCT`). However, each function also lets you add an `ALL` to the clause to display duplicate values.

## Examples

### Union: Combine Two Queries

`UNION` combines the results of two queries into one result.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('AZ', 'NY')
UNION
SELECT name
FROM mortgages
WHERE state_opened IN ('AZ', 'NY');
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Naseem Joossens |
| Ricarda Caron   |
| Carola Dahl     |
| Aygün Sanna     |
+-----------------+
~~~

To show duplicate rows, you can use `ALL`.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('AZ', 'NY')
UNION ALL
SELECT name
FROM mortgages
WHERE state_opened IN ('AZ', 'NY');
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Naseem Joossens |
| Ricarda Caron   |
| Carola Dahl     |
| Naseem Joossens |
| Aygün Sanna     |
| Carola Dahl     |
+-----------------+
~~~

### Intersect: Retrieve Intersection of Two Queries

`INTERSECT` finds only values that are present in both query operands.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('NJ', 'VA')
INTERSECT
SELECT name
FROM mortgages;
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Danijel Whinery |
| Agar Archer     |
+-----------------+
~~~

### Except: Exclude One Query's Results from Another

`EXCEPT` finds values that are present in the first query operand but not the second.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM mortgages
EXCEPT
SELECT name
FROM accounts;
~~~
~~~
+------------------+
|       name       |
+------------------+
| Günay García     |
| Karla Goddard    |
| Cybele Seaver    |
+------------------+
~~~

## See Also

- [Selection Clauses](selection-clauses.html)
- [Simple `SELECT` Clause](select-clause.html)
- [Relational Expressions](relational-expressions.html)
- [Table Expressions](table-expressions.html)

