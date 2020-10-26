---
title: Ordering Query Results
summary: The ORDER BY clause controls the order of rows.
toc: true
---

The `ORDER BY` clause controls the order in which rows are returned or
processed. It can be used in any [selection
query](selection-queries.html), including
as operand of [`INSERT`](insert.html) or [`UPSERT`](upsert.html), as
well as with [`DELETE`](delete.html) and [`UPDATE`](update.html)
statements.


## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/sort_clause.html %}
</div>

## Parameters

The `ORDER BY` clause takes a comma-separated list of ordering specifications.
Each ordering specification is composed of a column selection followed optionally
by the keyword `ASC` or `DESC`.

Each **column selection** can take one of the following forms:

- A simple column selection, determined as follows:
  1. The name of a column label configured with `AS` earlier in the [`SELECT` clause](select-clause.html). This uses the value computed by the `SELECT` clause as the sorting key.
  2. A positive integer number, designating one of the columns in the data source, either the `FROM` clause of the `SELECT` clause where it happens or the table being written to by `DELETE` or `UPDATE`. This uses the corresponding input value from the data source to use as the sorting key.
  3. An arbitrary [scalar expression](scalar-expressions.html). This uses the result of evaluating that expression as the sorting key.
- The notation `PRIMARY KEY <table_name>`. This uses the primary key column(s) of the given table as sorting key. This table must be part of the data source.
- The notation `INDEX <table_name>@<index_name>`. This uses the columns indexed by the given index as sorting key. This table must be part of the data source.

The optional keyword `ASC` after a column selection indicates to use
the sorting key as-is, and thus is meaningless.

The optional keyword `DESC` inverts the direction of the column(s)
selected by the selection that immediately precedes.

 CockroachDB supports `NULLS FIRST`/`NULLS LAST` in `ORDER BY` clauses for compatibility with [PostgreSQL row-sorting syntax](https://www.postgresql.org/docs/current/queries-order.html).

{{site.data.alerts.callout_info}}
Support for `NULLS LAST` is currently syntax-only. If you specify `NULLS LAST` in an `ORDER BY` clause, CockroachDB uses `NULLS FIRST` and does not return an error.
{{site.data.alerts.end}}

## Order preservation

In general, the order of the intermediate results of a query is not guaranteed,
even if `ORDER BY` is specified. In other words, the `ORDER BY` clause is only
effective at the top-level statement. For example, it is *ignored* by the query
planner when present in a sub-query in a `FROM` clause as follows:

{% include copy-clipboard.html %}
~~~ sql
>  SELECT * FROM a, b ORDER BY a.x;                 -- valid, effective
>  SELECT * FROM (SELECT * FROM a ORDER BY a.x), b; -- ignored, ineffective
~~~

However, when combining queries together with
[sub-queries](table-expressions.html#subqueries-as-table-expressions),
some combinations will make the `ORDER BY` clause in a sub-query
significant:

1. The ordering of the operand of a `WITH ORDINALITY` clause
   (within the `FROM` operand of a `SELECT` clause) is preserved,
   to control the numbering of the rows.
2. The ordering of the operand of a stand-alone `LIMIT` or `OFFSET` clause (within
   a `FROM` operand of a `SELECT` clause) is preserved, to determine
   which rows are kept in the result.
3. The ordering of the data source for an [`INSERT`](insert.html)
   statement or an [`UPSERT`](upsert.html) statement that also uses
   `LIMIT` is preserved, to determine [which rows are processed, but not their order](#ordering-rows-in-dml-statements).
4. The ordering indicated for an [`UPDATE`](update.html) or [`DELETE`](delete.html)
   statement that also uses `LIMIT` is used to determine
   [which rows are processed, but not their order](#ordering-rows-in-dml-statements).
   (This is a CockroachDB extension.)
5. The ordering of a sub-query used in a scalar expression
   is preserved.

For example, using `WITH ORDINALITY`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM (SELECT * FROM a ORDER BY a.x) WITH ORDINALITY;
  -- ensures that the rows are numbered in the order of column a.x.
~~~

For example, using a stand-alone `LIMIT` clause in `FROM`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM a, ((SELECT * FROM b ORDER BY b.x) LIMIT 1);
  -- ensures that only the first row of b in the order of column b.x
  -- is used in the cross join.
~~~

For example, using a sub-query in scalar context:

{% include copy-clipboard.html %}
~~~ sql
> SELECT ARRAY(SELECT a.x FROM a ORDER BY a.x);
  -- ensures that the array is constructed using the values of a.x in sorted order.
> SELECT (1, 2, 3) = (SELECT a.x FROM a ORDER BY a.x);
  -- ensures that the values on the right-hand side are compared in the order of column a.x.
~~~

## Ordering of rows without `ORDER BY`

Without `ORDER BY`, rows are processed or returned in a
non-deterministic order. "Non-deterministic" means that the actual order
can depend on the logical plan, the order of data on disk, the topology
of the CockroachDB cluster, and is generally variable over time.

## Sorting using simple column selections

Considering the following table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE a(a INT);
> INSERT INTO a VALUES (1), (3), (2);
~~~

The following statements are equivalent:

{% include copy-clipboard.html %}
~~~ sql
> SELECT a AS b FROM a ORDER BY b; -- first form: refers to an AS alias.
> SELECT a      FROM a ORDER BY 1; -- second form: refers to a column position.
> SELECT a      FROM a ORDER BY a; -- third form: refers to a column in the data source.
~~~

~~~
+---------+
| a       |
+---------+
|       1 |
|       2 |
|       3 |
+---------+
(3 rows)
~~~

Note that the order of the rules matter. If there is ambiguity, the `AS` aliases
take priority over the data source columns, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ab(a INT, b INT);
> SELECT a AS b, b AS c FROM ab ORDER BY b; -- orders by column a, renamed to b
> SELECT a,      b      FROM ab ORDER BY b; -- orders by column b
~~~

It is also possible to sort using an arbitrary scalar expression computed for each row, for example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT a, b FROM ab ORDER BY a + b; -- orders by the result of computing a+b.
~~~

## Sorting using multiple columns

When more than one ordering specification is given, the later specifications are used
to order rows that are equal over the earlier specifications, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ab(a INT, b INT);
> SELECT a, b FROM ab ORDER BY b, a;
~~~

This sorts the results by column `b`, and then if there are multiple
rows that have the same value in column `b`, it will then order these
rows by column `a`.

## Inverting the sort order

The keyword `DESC` ("descending") can be added after an ordering specification to
invert its order. This can be specified separately for each specification, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ab(a INT, b INT);
> SELECT a, b FROM ab ORDER BY b DESC, a; -- sorts on b descending, then a ascending.
~~~

## Sorting in primary key order

The `ORDER BY PRIMARY KEY` notation guarantees that the results are
presented in primary key order.

The particular advantage is that for queries using the primary index,
this guarantees the order while also guaranteeing there will not be an
additional sorting computation to achieve it, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE kv(k INT PRIMARY KEY, v INT);
> SELECT k, v FROM kv ORDER BY PRIMARY KEY kv; -- guarantees ordering by column k.
~~~

If a primary key uses the keyword `DESC` already, then its meaning
will be flipped (cancelled) if the `ORDER BY` clause also uses
`DESC`, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ab(a INT, b INT, PRIMARY KEY (b DESC, a ASC));
> SELECT * FROM ab ORDER BY b DESC; -- orders by b descending, then a ascending.
                                    -- The primary index may be used to optimize.

> SELECT * FROM ab ORDER BY PRIMARY KEY ab DESC; -- orders by b ascending, then a descending.
                                                 -- The index order is inverted.
~~~

## Sorting in index order

The `ORDER BY INDEX` notation guarantees that the results are presented
in the order of a given index.

The particular advantage is that for queries using that index, this
guarantees the order while also guaranteeing there will not be an
additional sorting computation to achieve it, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE kv(k INT PRIMARY KEY, v INT, INDEX v_idx(v));
> SELECT k, v FROM kv ORDER BY INDEX kv@v_idx; -- guarantees ordering by column v.
~~~

If an index uses the keyword `DESC` already, then its meaning
will be flipped (cancelled) if the `ORDER BY` clause also uses
`DESC`, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ab(a INT, b INT, INDEX b_idx (b DESC, a ASC));
> SELECT * FROM ab ORDER BY b DESC; -- orders by b descending, then a ascending.
                                    -- The index b_idx may be used to optimize.

> SELECT * FROM ab ORDER BY INDEX ab@b_idx DESC; -- orders by b ascending, then a descending.
                                                 -- The index order is inverted.
~~~

## Ordering rows in DML statements

When using `ORDER BY` with an [`INSERT`](insert.html),
[`UPSERT`](upsert.html), [`UPDATE`](update.html) or
[`DELETE`](delete.html) (i.e., a DML statement), the `ORDER BY` clause is
ignored if it is not used in combination with [`LIMIT` and/or
`OFFSET`](limit-offset.html).

The combination of both `ORDER BY` and `LIMIT`/`OFFSET` determines
which rows of the input are used to insert, update or delete the table
data, but *it does not determine in which order the mutation takes
place*.

For example, using `LIMIT` in `INSERT`:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO a SELECT * FROM b ORDER BY b.x LIMIT 1;
  -- ensures that only the first row of b in the order of column b.x
  -- is inserted into a.
~~~

The reason why `ORDER BY` does not control the final order of the rows
in the table is that the ordering of rows in the target table is
determined by its [primary and secondary indexes](indexes.html).

To order the result of the `RETURNING` clause, see [Sorting the output
of deletes](#sorting-the-output-of-deletes).

## Sorting the output of deletes

{% include {{page.version.version}}/misc/sorting-delete-output.md %}

## See also

- [Selection Queries](selection-queries.html)
- [Scalar Expressions](scalar-expressions.html)
- [`INSERT`](insert.html)
- [`UPSERT`](upsert.html)
- [`DELETE`](delete.html)
- [`UPDATE`](delete.html)
