Unordered aggregation operations do not support disk spilling, and are limited by the `--max-sql-memory` setting. If unordered aggregation operations exceed the amount of memory available to the SQL layer, CockroachDB will throw an error, and in some circumstances could crash.

See the [GitHub tracking issue](https://github.com/cockroachdb/cockroach/issues/42485) for details.