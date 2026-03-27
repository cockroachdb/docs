## v26.2

Release Date: TBD

{% include releases/new-release-downloads-docker-image.md release=include.release %}

<h3 id="v26-2-sql-language-changes">SQL language changes</h3>

- `EXPLAIN` and `EXPLAIN ANALYZE` now show which table statistics were used to build the query plan (`table stats mode`) and, for scans where statistics differ, the canary window duration. [#166129][#166129]

<h3 id="v26-2-bug-fixes">Bug fixes</h3>

- Fixed an issue where running concurrent `UPDATE` statements while creating a partial index could produce missing or incorrect index entries, leading to phantom rows or index validation failures after the index finished building. [#166325][#166325]
- Fixed an issue where `EXPLAIN` output for queries with nested user-defined functions could use excessive memory and trigger out-of-memory errors. [#166132][#166132]
- Fixed an issue where rolling back `CREATE TABLE` could leave dependent types or sequences in an invalid state, causing them to appear in `crdb_internal.invalid_objects`. [#166223][#166223]
- Fixed an issue where restoring a database could retain default privileges that referenced users missing from the target cluster. [#166183][#166183]

[#166129]: https://github.com/cockroachdb/cockroach/pull/166129
[#166132]: https://github.com/cockroachdb/cockroach/pull/166132
[#166183]: https://github.com/cockroachdb/cockroach/pull/166183
[#166223]: https://github.com/cockroachdb/cockroach/pull/166223
[#166325]: https://github.com/cockroachdb/cockroach/pull/166325