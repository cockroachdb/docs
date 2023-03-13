CockroachDB does not yet support the following `COPY` syntax:

- `COPY ... TO`. To copy data from a CockroachDB cluster to a file, use an [`EXPORT`](export.html) statement.

  - [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/85571)

- Various `COPY` options (`FORMAT`, `FREEZE`, `QUOTE`, etc.).

  - [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/85572)
  - [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/85573)
  - [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/85574)

- `COPY ... FROM ... WHERE <expr>`.

  - [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/54580)
