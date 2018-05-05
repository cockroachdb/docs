We find that most use cases that appear to ask for total write
ordering can be solved with other, more distribution-friendly
solutions instead. For example, CockroachDB's [time travel queries
(`AS OF SYSTEM
TIME`)](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)
support the following:

- Paginate through all the changes to a table or dataset.
- Determine the order of changes to data over time.
- Determine the state of data at some point in the past.
- Determine the changes to data between two points of time.

Should your application absolutely require it, it is still possible to
create a strictly monotonic counter in CockroachDB, as follows:

- initially: `CREATE TABLE cnt(val INT PRIMARY KEY); INSERT INTO cnt(val) VALUES(1);`
- in each transaction: `INSERT INTO cnt(val) SELECT max(val)+1 FROM cnt RETURNING val;`

This will cause all your INSERT transactions to conflict with each
other and effectively force the transactions to commit one at a time
throughout the cluster, which in turn guarantees the values generated
in this way are strictly increasing over time without gaps. The caveat
is that performance is severely limited as a result.

Please contact us and describe your situation if you find yourself
interested in this problem. We would be glad to help you find
alternative solutions and possibly extend CockroachDB to better match
your needs.
