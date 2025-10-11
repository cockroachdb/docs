When inserting or updating all columns of a table, and the table has no secondary
indexes, Cockroach Labs recommends using an `UPSERT` statement instead of the
equivalent `INSERT ON CONFLICT` statement. Whereas `INSERT ON CONFLICT` always
performs a read to determine the necessary writes, the `UPSERT` statement writes
without reading, making it faster. This may be particularly useful if
you are using a simple SQL table of two columns to [simulate direct KV access](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store).
In this case, be sure to use the `UPSERT` statement.

For tables with secondary indexes, there is no performance difference between `UPSERT` and `INSERT ON CONFLICT`.
