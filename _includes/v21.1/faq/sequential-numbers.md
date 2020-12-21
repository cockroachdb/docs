Sequential numbers can be generated in CockroachDB using the `unique_rowid()` built-in function or using [SQL sequences](create-sequence.html). However, note the following considerations:

- Unless you need roughly-ordered numbers, we recommend using [`UUID`](uuid.html) values instead. See the [previous
FAQ](#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) for details.
- [Sequences](create-sequence.html) produce **unique** values. However, not all values are guaranteed to be produced (e.g., when a transaction is canceled after it consumes a value) and the values may be slightly reordered (e.g., when a transaction that
consumes a lower sequence number commits after a transaction that consumes a higher number).
- For maximum performance, avoid using sequences or `unique_rowid()` to generate row IDs or indexed columns. Values generated in these ways are logically close to each other and can cause contention on few data ranges during inserts. Instead, prefer [`UUID`](uuid.html) identifiers.
- {% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}
