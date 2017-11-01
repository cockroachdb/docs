# Goals

"Indexes - https://www.cockroachlabs.com/docs/stable/indexes.html
Interleaved tables - https://www.cockroachlabs.com/docs/stable/interleave-in-parent.html
Parallel statement execution (drafting for 1.1)"

# Presentation

/----------------------------------------/

## Performance Optimizations

To ensure the best performance out of CockroachDB, there are a number of features we recommend you leverage.

/----------------------------------------/

## Agenda

- Secondary indexes
- Parallel statement execution
- Interleaved tables 
- Batching

/----------------------------------------/

## Secondary Indexes

For performance, indexes are of utmost importance.

### Guidance

Sorted columns should be indexed, other columns in query should be stored

/----------------------------------------/

## Secondary Indexes

`CREATE INDEX ON table (col)`

Index are also automatically created for any column with `UNIQUE` constraint. 

Can also store/cover columns (which aren't sorted, but might be returned):

`CRATE INDEX ON table (col1) STORING (col2)`

/----------------------------------------/

## Parallel Statement Execution

Enable-able in transactions for `INSERT`, `UPDATE`, `UPSERT`, and `DELETE` by including `RETURNING NOTHING` clause. Including this means the executed statement literally doesn't return anything.

When running parallel statement execution, errors in txn surface only when it attempts to `COMMIT`.

~~~ sql
BEGIN;
UPDATE x SET id3=1 
WHERE (id1,id2) IN ((1,1)) RETURNING NOTHING;
INSERT INTO x VALUES (1,1,1) RETURNING NOTHING;
INSERT INTO x VALUES (1,1,1) RETURNING NOTHING;
COMMIT;
~~~

/----------------------------------------/

## Interleaved Tables

If tables are related hierarchically, you can influence their physical layout with interleaved tables.

Each table in an interleaved hierarchy has a "prefix" in its `PRIMARY KEY` that expresses the relationship to its parent.

customer > id

orders > customer.id AS customer, id

INTERLEAVE IN PARENT customers (customer)

packages > orders.customer AS customer, orders.id AS order, id

 INTERLEAVE IN PARENT orders (customer, "order")

/----------------------------------------/

## Interleaved Tables

When tables are interleaved, they're stored together in the KV layer, instead of being split by table.

~~~
/table0/<table0.id = 1>
/table0/<table1.table0-id = 1>/table1/<table1.id = 1> - > table1val1
/table0/<table1.table0-id = 1>/table1/<table1.id = 2> - > table1val2
/table0/<table0.id = 2>
/table0/<table1.table0-id = 2>/table1/<table1.id = 3> - > table1val3
/table0/<table1.table0-id = 2>/table1/<table1.id = 4> - > table1val4
~~~

This ends up being more likely to place the data in the same range, which can speed up queries that read data from the tables in the interleaved hierarchy.

/----------------------------------------/

## Batching

Whenever working with individual rows, you should try to manipulate as many of them as you can:

~~~ sql
> UPDATE x SET id3=1 WHERE (id1,id2) IN ((1,1),(2,2),(3,3))
~~~

# Lab