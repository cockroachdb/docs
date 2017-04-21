CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. Although it is not possible to access the key-value store directly, you can mirror direct access using a "simple" table of two columns, with one set as the primary key:

~~~ sql
> CREATE TABLE kv (k INT PRIMARY KEY, v BYTES);
~~~

When such a "simple" table has no indexes or foreign keys, [`INSERT`](insert.html)/[`UPSERT`](upsert.html)/[`UPDATE`](update.html)/[`DELETE`](delete.html) statements translate to key-value operations with minimal overhead (single digit percent slowdowns). For example, the following `UPSERT` to add or replace a row in the table would translate into a single key-value Put operation:

~~~ sql
> UPSERT INTO kv VALUES (1, b'hello')
~~~

This SQL table approach also offers you a well-defined query language, a known transaction model, and the flexibility to add more columns to the table if the need arises.
