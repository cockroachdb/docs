CockroachDB does not yet support the following `COPY` syntax:

- `COPY ... TO`. To copy data from a CockroachDB cluster to a file, use an [`EXPORT`](export.html) statement.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/41608)

- `COPY ... FROM CSV`

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/51891)

- `COPY ... FROM STDIN` with a delimiter other than the default tab delimiter.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/16407)

- `COPY ... FROM ... WHERE <expr>`

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/54580)