# Goals

https://www.cockroachlabs.com/docs/v1.1/manage-long-running-queries.html

# Presentation

/----------------------------------------/

## Long-Running Queries

Queries that hang around can be a drag on performance. In CockroachDB you can both find out if they exist, and then cancel them.

/----------------------------------------/

## Agenda

- Causes & Effects
- Finding LRQ
- Cancel LRQ
- Fixes

/----------------------------------------/

## Causes

- Inherent in analytics queries
- Full-table scan (misses an index)
- Decent-sized query whose performance is dragged down by overloaded system

## Effects

Contends with other queries for same resources (i.e. slow)

/----------------------------------------/

## Finding LRQ

~~~ sql
> SELECT query_id, query, start FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '1 hour');
~~~

~~~
+------------------+-------------------------------------------+----------------------------------+
|     query_id     |                   query                   |              start               |
+------------------+-------------------------------------------+----------------------------------+
| 14db657443230c3e | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.675151+00:00 |
| 14db657443b68c7d | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.684818+00:00 |
| 14db65744382c234 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.681431+00:00 |
| 14db657443c9dc66 | SHOW CLUSTER QUERIES                      | 2017-08-16 18:00:50.686083+00:00 |
| 14db657443e30a85 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.68774+00:00  |
| 14db6574439f477d | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.6833+00:00   |
| 14db6574435817d2 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.678629+00:00 |
| 14db6574433c621f | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.676813+00:00 |
| 14db6574436f71d5 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 2017-08-16 18:00:50.680165+00:00 |
+------------------+-------------------------------------------+----------------------------------+
~~~

/----------------------------------------/

## Cancel LRQ

~~~ sql
> CANCEL QUERY '14db657443230c3e';
~~~

## Fixes

`EXPLAIN` on query

- Indexes
- Column ordering affecting index accessibility

# Lab