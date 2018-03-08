---
title: Controlling row order in query results
summary: The ORDER BY clause controls the order of rows.
toc: false
---

The `ORDER BY` clause in [`SELECT` clauses](select.html),
[`DELETE`](delete.html) and [`UPDATE`](update.html) controls the order
in which rows are returned or processed.

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/sort_clause.html %}

## Parameters

The `ORDER BY` clauses takes a comma-separated list of ordering specifications.

Each ordering specification is composed of a *column selection* followed optionally
by the keyword `ASC` or `DESC`.

Each column selection can take one of the following forms:

- A simple column selection, determined as follows:

  1. The name of a column label configured with `AS` earlier in the [`SELECT` clause](select.html). This uses the value computed by the `SELECT` clause as sort key.
  2. A simple positive, integer number, designating one of the columns in the data source, either the `FROM` clause of the `SELECT` clause where it happens, or the table being written to by `DELETE` or `UPDATE`. This uses the corresponding input value from the data source to use as sort key.
  3. An arbitrary [value expression](sql-expressions.html). This uses the result of evaluating that expression as sort key.

- The notation `PRIMARY KEY <tablename>`. This uses the primary key column(s) of the given table as sorting key. This table must be part of the data source.
- The notation `INDEX <tablename>@<indexname>`. This uses the columns indexed by the given index as sorting key. This table must be part of the data source.

The optional keyword `ASC` after a column selection indicates to use
the sorting key-as is, and thus is meaningless.

The optional keyword `DESC` inverts the direction of the column(s)
selected by the selection that immediately precedes.

## Significant Positions for `ORDER BY`

In general, the `ORDER BY` clause is only effective at the top-level
statement. For example, it is *ignored* by the query planner when
present in a sub-query in a `FROM` clause:

```sql
>  SELECT * FROM a, b ORDER BY a.x;                 -- valid, effective
>  SELECT * FROM (SELECT * FROM a ORDER BY a.x), b; -- ignored, ineffective
```

However, when combining queries together with
[sub-queries](table-expressions.html#subqueries-as-table-expressions),
some combinations will make the `ORDER BY` clause in a sub-query
significant:

- the ordering of the data source in a `SELECT` clause that uses
  `DISTINCT ON` is preserved, to determine the "first row" for each
  `DISTINCT ON` grouping key.
- the ordering of the data source in a `SELECT` clause, an
  [`INSERT`](insert.html) statement, or an [`UPSERT`](upsert.html)
  statement that also uses `LIMIT`, is preserved.

(FIXME: Radu, what are the other cases?)

## Ordering of Rows Without `ORDER BY`

In general, without `ORDER BY` rows are processed or returned in a
non-deterministic order.

"Non-deterministic" means that the actual order can depend on the
logical plan, the order of data on disk, the topology of the
CockroachDB cluster, and is generally variable over time.

## Sorting Using Simple Column Selections

Considering the following table:

```sql
> CREATE TABLE a(a INT);
> INSERT INTO a VALUES (1), (3), (2);
```

The following statements are equivalent:

```sql
> SELECT a AS b FROM a ORDER BY b; -- first form: refers to an AS alias.
> SELECT a      FROM a ORDER BY 1; -- second form: refers to a column position.
> SELECT a      FROM a ORDER BY a; -- third form: refers to a column in the data source.
```

```
+---------+
| a       |
+---------+
|       1 |
|       2 |
|       3 |
+---------+
(3 rows)
```

Note that the order of the rules matter. If there is an ambiguity, the `AS` aliases
take priority over the data source columns. For example:

```sql
> CREATE TABLE ab(a INT, b INT);
> SELECT a AS b, b AS c FROM ab ORDER BY b; -- orders by column a, renamed to b
> SELECT a,      b      FROM ab ORDER BY b; -- orders by column b
```

It is also possible to sort using an arbitrary value expression computed for each row. For example:

```sql
> SELECT a, b FROM ab ORDER BY a + b; -- orders by the result of computing a+b.
```


## Sorting Using Multiple Columns

When more than one ordering specification is given, the later specifications are used
to order rows that are equal over the the earlier specifications.

For example:

```sql
> CREATE TABLE ab(a INT, b INT);
> SELECT a, b FROM ab ORDER BY b, a;
```

This sorts the results by column `b`, and then if there are multiple
rows that have the same value in column `b`, it will then order these
rows by column `a`.

## Inverting The Sort Order

The keyword `DESC` ("descending") can be added after an ordering specification to
invert its order. this can be specified separately for each specification.

For example:

```sql
> CREATE TABLE ab(a INT, b INT);
> SELECT a, b FROM ab ORDER BY b DESC, a; -- sorts on b descending, then a ascending.
```


## Sorting In Primary Key Order

The `PRIMARY KEY` notation guarantees that the results are presented
in primary key order.

The particular advantage is that for most queries, this guarantees the
order while also guaranteeing there will not be an additional sorting
computation to achieve it.

For example:

```sql
> CREATE TABLE kv(k INT PRIMARY KEY, v INT);
> SELECT k, v FROM kv ORDER BY PRIMARY KEY kv; -- guarantees ordering by column k.
```

If a primary key uses the keyword `DESC` already, then its meaning
will be flipped (cancelled) if the `ORDER BY` clause also uses
`DESC`. For example:

```sql
> CREATE TABLE ab(a INT, b INT, PRIMARY KEY (b DESC, a ASC));
> SELECT * FROM ab ORDER BY b DESC; -- orders by b descending, then a ascending.
                                    -- The primary index may be used to optimize.

> SELECT * FROM ab ORDER BY PRIMARY KEY ab DESC; -- orders by b ascending, then a descending.
                                                 -- The index order is inverted.
```

## Sorting In Index Order

The `INDEX` notation guarantees that the results are presented
in the order of a given index.

The particular advantage is that for most queries, this guarantees the
order while also guaranteeing there will not be an additional sorting
computation to achieve it.

For example:

```sql
> CREATE TABLE kv(k INT PRIMARY KEY, v INT, INDEX v_idx(v));
> SELECT k, v FROM kv ORDER BY INDEX kv@v_idx; -- guarantees ordering by column v.
```

If an index uses the keyword `DESC` already, then its meaning
will be flipped (cancelled) if the `ORDER BY` clause also uses
`DESC`. For example:

```sql
> CREATE TABLE ab(a INT, b INT, INDEX b_idx (b DESC, a ASC));
> SELECT * FROM ab ORDER BY b DESC; -- orders by b descending, then a ascending.
                                    -- The index b_idx may be used to optimize.

> SELECT * FROM ab ORDER BY INDEX ab@b_idx DESC; -- orders by b ascending, then a descending.
                                                 -- The index order is inverted.
```

## See Also

- [Selection Clauses](selection-clauses.html)
- [Value Expressions](sql-expressions.html)
- [`DELETE`](delete.html)
- [`UPDATE`](delete.html)
