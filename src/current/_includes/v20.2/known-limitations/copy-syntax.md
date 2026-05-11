CockroachDB does not yet support the following `COPY` syntax:

- `COPY ... TO`. To copy data from a CockroachDB cluster to a file, use an [`EXPORT`](export.html) statement.

    

- `COPY ... FROM CSV`

    

- `COPY ... FROM STDIN` with a delimiter other than the default tab delimiter.

    

- `COPY ... FROM ... WHERE <expr>`
