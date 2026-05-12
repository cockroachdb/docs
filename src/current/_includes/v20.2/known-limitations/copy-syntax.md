CockroachDB does not yet support the following `COPY` syntax:

- `COPY ... TO`. To copy data from a CockroachDB cluster to a file, use an [`EXPORT`](export.html) statement.

    Tracking GitHub Issue

- `COPY ... FROM CSV`

    Tracking GitHub Issue

- `COPY ... FROM STDIN` with a delimiter other than the default tab delimiter.

    Tracking GitHub Issue

- `COPY ... FROM ... WHERE <expr>`

    Tracking GitHub Issue