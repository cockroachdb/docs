## v26.1.0-rc.1

Release Date: December 4, 2025

{% include releases/new-release-downloads-docker-image.md release=include.release %}

<h3 id="v26-1-0-rc-1-general-changes">General changes</h3>

- Changefeeds now support the `partition_alg` option for specifying a kafka partitioning algorithm. Currently `fnv-1a` (default) and `murmur2` are supported. The option is only valid on kafka v2 sinks. This is protected by the cluster setting `changefeed.partition_alg.enabled`. An example usage: `SET CLUSTER SETTING changefeed.partition_alg.enabled=true; CREATE CHANGEFEED ... INTO 'kafka://...' WITH partition_alg='murmur2';` Note that if a changefeed is created using the murmur2 algorithm, and then the cluster setting is disabled, the changefeed will continue using the murmur2 algorithm unless the changefeed is altered to use a differed `partition_alg`. [#161532][#161532]

<h3 id="v26-1-0-rc-1-edition-changes">{{ site.data.products.enterprise }} edition changes</h3>

- A new cluster setting, `security.provisioning.oidc.enabled`, has been added to allow for the automatic provisioning of users when they log in for the first time via OIDC. When enabled, a new user will be created in CockroachDB upon their first successful OIDC authentication. This feature is disabled by default. [#160016][#160016]

<h3 id="v26-1-0-rc-1-sql-language-changes">SQL language changes</h3>

- makes the information_schema.crdb_datums_to_bytes builtin documented. [#161196][#161196]
- In v26.1.0-alpha.2 the new builtin function `crdb_internal.inject_hint` was introduced. This function is now renamed `information_schema.crdb_rewrite_inline_hints` to better reflect its intention. [#160946][#160946]
- Added support for SHOW STATEMENT HINTS, which displays information about the statement hints (if any) associated with the given statement fingerprint string. The fingerprint is normalized in the same way as `EXPLAIN (FINGERPRINT)` before hints are matched. Example usage: `SHOW STATEMENT HINTS FOR ' SELECT * FROM xy WHERE x = 10 '`, `SHOW STATEMENT HINTS FOR $$ SELECT * FROM xy WHERE x = 10 $$ WITH DETAILS`. [#160865][#160865]
- New cluster settings that control the number of concurrent automatic statistic collection jobs have been introduced: - `sql.stats.automatic_full_concurrency_limit` controls the number of auto full statistics collections, 1 by default, matching the behavior since introduction of automatic stats collection around v19.2. - `sql.stats.automatic_extremes_concurrency_limit` controls the number of auto partial USING EXTREMES statistics collections, 128 by default. Note that at most one statistics collection can run on a single table. [#159870][#159870]
- The default value of `sql.catalog.allow_leased_descriptors.enabled` is now true. This setting allows introspection tables like information_schema and pg_catalog to use cached descriptors when building the table results, which improves the performance of introspection queries when there are many tables in the cluster. [#159566][#159566]
- INSPECT is now a generally available feature. The enable_inspect_command session variable has been deprecated, and is now effectively always true. [#159750][#159750]
- Fixed two cases where creation of a routine resolves unnecessary column dependencies, which can prevent drop of the column without first dropping the routine. Here, the unnecessary dependencies are due to references within CHECK constraints, including those for RLS policies and hash-sharded indexes, as well as those in partial index predicates. The fix is gated behind the session setting `use_improved_routine_deps_triggers_and_computed_cols`, which is off by default before 26.1. [#159439][#159439]
- A new column, database, was being added to SHOW CHANGEFEED JOBS as part of 26.1. This patch reverts adding that column for 26.1. [#158995][#158995]

<h3 id="v26-1-0-rc-1-operational-changes">Operational changes</h3>

- A new metric `sql.query.with_statement_hints.count` is added which is incremented whenever a statement is executed with one or more external statement hints applied. (One example of an external statement hint is an inline-hints rewrite rule added by calling `information_schema.crdb_rewrite_inline_hints`.) [#161085][#161085]
- goroutine profile dumps are now captured as binary proto .pb.gz files instead of human readable .txt.gz files. This change improves the performance of the goroutine dumper by eliminating stop-the-world events caused by grabbing stacks during goroutine dumps. [#160994][#160994]
- A structured event of type `rewrite_inline_hints` is now emitted when a new inline-hints rewrite rule is added using `information_schema.crdb_rewrite_inline_hints`. This event is written to both the event log and the OPS channel. [#161035][#161035]
- the kv.range_split.load_sample_reset_duration now defaults to 30m. This should improve load-based splitting in rare edge cases. [#159677][#159677]

<h3 id="v26-1-0-rc-1-command-line-changes">Command-line changes</h3>

- The `cockroach debug zip` command's `--include-files` and `--exclude-files` flags now support full zip path patterns. Patterns containing '/' are matched against the full path within the zip archive (e.g. `--include-files='debug/nodes/1/*.json'`). Patterns without '/' continue to match the base file name as before. [#164146][#164146]

<h3 id="v26-1-0-rc-1-db-console-changes">DB Console changes</h3>

- Standardizes nanoseconds as the unit of measurement for admission control duration metrics, instead of microseconds. [#161076][#161076]
- The sessions page sets the Session Status filter by default. It is set to Active,Idle. [#160937][#160937]

<h3 id="v26-1-0-rc-1-bug-fixes">Bug fixes</h3>

- Fixed a bug where concurrent updates to a table using multiple column families during a partial index creation could result in data loss, incorrect NULL values, or validation failures in the resulting index. [#166324][#166324]
- Fixed a bug where rolling back a CREATE TABLE that referenced user-defined types or sequences would leave orphaned back-references on the type and sequence descriptors, causing them to appear in crdb_internal.invalid_objects after the table was GC'd. [#166222][#166222]
- Fixed a bug where restoring a database backup containing default privileges referencing non-existent users would leave dangling user references in the restored database descriptor. [#166182][#166182]
- Previously, running `EXPLAIN ANALYZE (DEBUG)` on a query that invokes a UDF with many blocks in some cases could cause OOMs, and this is now fixed. [#166131][#166131]
- Fixed a bug in the legacy schema changer where rolling back a CREATE TABLE with inline FOREIGN KEY constraints could leave orphaned FK back-references on the referenced table, causing descriptor validation errors. [#165994][#165994]
- Fixed a rare race condition where SHOW CREATE TABLE could fail with a "relation does not exist" error if a table referenced by a foreign key was being concurrently dropped. [#165274][#165274]
- Fixed a bug existing since before v23.1 that could cause row sampling for table statistics to crash a node due to a data race when processing a collated string column with values larger than 400 bytes. [#165562][#165562]
- Fixed a bug where CREATE INDEX on a table with PARTITION ALL BY would fail if the partition columns were explicitly included in the primary key definition. [#164754][#164754]
- Fixed a bug where contention events reported the wrong key. Previously, the key field in contention events showed the transaction's anchor key (used for record placement) rather than the actual key where the conflict occurred. This made it difficult to diagnose contention issues accurately. [#164157][#164157]
- Previously, CockroachDB might not have promptly responded to the statement timeout when performing a hash join with ON filter that is mostly `false`. This is now fixed. [#164891][#164891]
- The default value of the changefeed.max_retry_backoff cluster setting has been lowered from 10m to 30s to reduce changefeed lag during rolling restarts. [#164936][#164936]
- In a recent change that was included in 25.4+, we inadvertently made it so that setting `min_checkpoint_frequency` to 0 would cause the changefeed's highwater to not advance/not send resolved timestamps. This bug has been fixed. Note however that setting `min_checkpoint_frequency` to lower than `500ms` is not recommended as it may cause degraded changefeed performance. [#164892][#164892]
- Fixed a bug that prevented the optimizer_min_row_count setting from applying to anti-join expressions, which could lead to bad query plans. The fix is gated behind `optimizer_use_min_row_count_anti_join_fix`, and will be on by default on 26.2+, and off by default in prior versions. [#164798][#164798]
- Fixed a rare data race during parallel constraint checks where a fresh descriptor collection could resolve a stale enum type version. This data race should only affect 26.1.0. [#163959][#163959]
- Fixed an issue where changefeeds with execution_locality filters could fail in multi-tenant clusters with "node descriptor not found" errors. [#164284][#164284]
- Prevented a race condition/conflict between concurrent ALTER FUNCTION ... SET SCHEMA and DROP SCHEMA operations. [#164063][#164063]
- Fixed an internal error "could not find format code for column N" that occurred when executing EXPLAIN ANALYZE EXECUTE statements via JDBC or other clients using the PostgreSQL binary protocol. [#162284][#162284]
- Fixes a bug where generating a debug zip causes a node to OOM. This OOM happens when a log file contains a malformed log and is using json (or json-compact) formatting. [#163353][#163353]
- Fix a bug in which PL/pgSQL UDFs with many IF statements would cause a timeout and/or OOM when executed from a prepared statement. This bug was introduced in v23.2.22, v24.1.15, v24.3.9, v25.1.2, v25.2.0. [#162560][#162560]
- Previously, CockroachDB could hit an internal error when evaluating builtin functions with `'{}'` as an argument (without explicit type casts) (e.g. on a query like "SELECT cardinality('{}');"). This is now fixed and a regular error is returned instead (matching PG). [#162358][#162358]
- Fixes a bug in kafka v1 where a changefeed could potentially hang if the changefeed was shutting down. [#162121][#162121]
- Fixed an error that occurred when using generic plan that generates a lookup join on indexes containing identity computed columns. [#162140][#162140]
- Previously, if buffered writes were enabled (which is a public preview feature, off by default), multi-stmt explicit txns that use SAVEPOINTs to recover from certain errors (like duplicate key value violations) could lose the writes that were performed _before_ the savepoint was created in rare cases. The bug has been present since the buffered writes feature was added in 25.2 and is now fixed. [#162031][#162031]
- Fixed a bug introduced in v26.1.0-beta.1 in which row-level TTL jobs could encounter GC threshold errors if each node had a large number of spans to process. [#161990][#161990]
- Fix a bug which prevented successfully injecting hints using `information_schema.crdb_rewrite_inline_hints` for INSERT, UPSERT, UPDATE, and DELETE statements. This bug has existed since hint injection was introduced in v26.1.0-alpha.2. [#161970][#161970]
- Fixed a bug where AVRO file imports could hang indefinitely when encountering stream errors from cloud storage (such as HTTP/2 CANCEL errors). Import jobs will now properly fail with an error instead of hanging. [#161446][#161446]
- Fixed a bug where IMPORT with AVRO data using OCF format could silently lose data if the underlying storage (e.g., S3) returned an error during read. Such errors are now properly reported. Other formats (specified via `data_as_binary_records` and `data_as_json_records` options) are unaffected. The bug has been present since about v20.1. [#161325][#161325]
- Fix a bug in which inline-hints rewrite rules created with `information_schema.crdb_rewrite_inline_hints` were not correctly applied to statements run with `EXPLAIN ANALYZE`. This bug was introduced in version v26.1.0-alpha.2 and is now fixed. [#161312][#161312]
- Fixed a bug where the pprof UI endpoints for allocs, heap, block, and mutex profiles ignored the seconds parameter and returned immediate snapshots instead of delta profiles. [#160804][#160804]
- enable SHOW CREATE TABLE for function created with columns casting to user defined types. [#160126][#160126]
- Fixed a bug where schema changes adding a NOT NULL constraint could enter an infinite retry loop if a row violated the constraint and contained certain content (e.g., "EOF"). Such errors are now correctly classified and don't cause retries. [#160917][#160917]
- v26.1.0-beta.1 and v26.1.0-beta.2 versions of CockroachDB could encounter a rare process crash when running TTL jobs, and this has now been fixed. [#160689][#160689]
- CockroachDB could previously crash when handling decimals with negative scales via extended PGWire protocol and this has been fixed (an error is returned, similar to PG). [#160561][#160561]
- Fixed a bug that caused rolling back a transaction that just rolled back a savepoint to block transactions touching the same rows for five seconds. [#160477][#160477]
- Fixed a deadlock that could occur when a statistics creation task panicked. [#160422][#160422]
- Fixed a bug causing a query predicate to be ignored when the predicate is on a column following one or more ENUM columns in an index, the predicate constrains the column to multiple values, and a lookup join to the index is chosen for the query plan. This bug was introduced in 24.3.0 and present in all versions since. [#159778][#159778]
- Fixes a memory accounting issue that could occur when a lease expires due to a SQL liveness session based timeout. [#159625][#159625]
- TRUNCATE is not blocked when LDR is in use and does not behave correctly with schema_locked. [#159405][#159405]
- Fixes a rare bug that could cause a panic on changefeed startup. [#159542][#159542]
- the performance impact of the automatic goroutine dumper has been reduced by reducing the number of stop-the-world events it causes (especially on large, busy systems). [#159396][#159396]
- Previously, when a node was restarted with additional stores for the first time, the metrics for these stores could be missing the node_id label. [#159351][#159351]
- Fixes a race in context cancellation of an incoming snapshot. [#159435][#159435]
- fixes a race where queries run after revoking BYPASSRLS could return wrong results because cached plans failed to notice the change immediately. [#159380][#159380]
- Fixes a bug where comments associated with constraints were left behind after the column and constraint were dropped. [#159288][#159288]
- A bug has been fixed which could cause prepared statements to fail with the error message "non-const expression" when they contained filters with stable functions. This bug has been present since 25.4.0. [#159203][#159203]

<h3 id="v26-1-0-rc-1-performance-improvements">Performance improvements</h3>

- improved the performance on changefeed checkpoint when changefeeds are lagging. Informs: #158913 [#163283][#163283]
- Add a new session variable, `distsql_prevent_partitioning_soft_limited_scans`, which, when true, prevents scans with soft limits from being planned as multiple TableReaders by the physical planner. This should decrease the initial setup costs of some fully-distributed query plans. [#160600][#160600]
- Fixed a performance regression in pg_catalog.pg_roles and pg_catalog.pg_authid by avoiding privilege lookups for each row in the table. [#160228][#160228]
- Various background tasks and jobs now more actively yield to foreground work when it is waiting to run. Epic: CRDB-37540. [#159258][#159258]

[#158995]: https://github.com/cockroachdb/cockroach/pull/158995
[#159203]: https://github.com/cockroachdb/cockroach/pull/159203
[#159258]: https://github.com/cockroachdb/cockroach/pull/159258
[#159288]: https://github.com/cockroachdb/cockroach/pull/159288
[#159351]: https://github.com/cockroachdb/cockroach/pull/159351
[#159380]: https://github.com/cockroachdb/cockroach/pull/159380
[#159396]: https://github.com/cockroachdb/cockroach/pull/159396
[#159405]: https://github.com/cockroachdb/cockroach/pull/159405
[#159435]: https://github.com/cockroachdb/cockroach/pull/159435
[#159439]: https://github.com/cockroachdb/cockroach/pull/159439
[#159542]: https://github.com/cockroachdb/cockroach/pull/159542
[#159566]: https://github.com/cockroachdb/cockroach/pull/159566
[#159625]: https://github.com/cockroachdb/cockroach/pull/159625
[#159677]: https://github.com/cockroachdb/cockroach/pull/159677
[#159750]: https://github.com/cockroachdb/cockroach/pull/159750
[#159778]: https://github.com/cockroachdb/cockroach/pull/159778
[#159870]: https://github.com/cockroachdb/cockroach/pull/159870
[#160016]: https://github.com/cockroachdb/cockroach/pull/160016
[#160126]: https://github.com/cockroachdb/cockroach/pull/160126
[#160228]: https://github.com/cockroachdb/cockroach/pull/160228
[#160422]: https://github.com/cockroachdb/cockroach/pull/160422
[#160477]: https://github.com/cockroachdb/cockroach/pull/160477
[#160561]: https://github.com/cockroachdb/cockroach/pull/160561
[#160600]: https://github.com/cockroachdb/cockroach/pull/160600
[#160689]: https://github.com/cockroachdb/cockroach/pull/160689
[#160804]: https://github.com/cockroachdb/cockroach/pull/160804
[#160865]: https://github.com/cockroachdb/cockroach/pull/160865
[#160917]: https://github.com/cockroachdb/cockroach/pull/160917
[#160937]: https://github.com/cockroachdb/cockroach/pull/160937
[#160946]: https://github.com/cockroachdb/cockroach/pull/160946
[#160994]: https://github.com/cockroachdb/cockroach/pull/160994
[#161035]: https://github.com/cockroachdb/cockroach/pull/161035
[#161076]: https://github.com/cockroachdb/cockroach/pull/161076
[#161085]: https://github.com/cockroachdb/cockroach/pull/161085
[#161196]: https://github.com/cockroachdb/cockroach/pull/161196
[#161312]: https://github.com/cockroachdb/cockroach/pull/161312
[#161325]: https://github.com/cockroachdb/cockroach/pull/161325
[#161446]: https://github.com/cockroachdb/cockroach/pull/161446
[#161532]: https://github.com/cockroachdb/cockroach/pull/161532
[#161970]: https://github.com/cockroachdb/cockroach/pull/161970
[#161990]: https://github.com/cockroachdb/cockroach/pull/161990
[#162031]: https://github.com/cockroachdb/cockroach/pull/162031
[#162121]: https://github.com/cockroachdb/cockroach/pull/162121
[#162140]: https://github.com/cockroachdb/cockroach/pull/162140
[#162284]: https://github.com/cockroachdb/cockroach/pull/162284
[#162358]: https://github.com/cockroachdb/cockroach/pull/162358
[#162560]: https://github.com/cockroachdb/cockroach/pull/162560
[#163283]: https://github.com/cockroachdb/cockroach/pull/163283
[#163353]: https://github.com/cockroachdb/cockroach/pull/163353
[#163959]: https://github.com/cockroachdb/cockroach/pull/163959
[#164063]: https://github.com/cockroachdb/cockroach/pull/164063
[#164146]: https://github.com/cockroachdb/cockroach/pull/164146
[#164157]: https://github.com/cockroachdb/cockroach/pull/164157
[#164284]: https://github.com/cockroachdb/cockroach/pull/164284
[#164754]: https://github.com/cockroachdb/cockroach/pull/164754
[#164798]: https://github.com/cockroachdb/cockroach/pull/164798
[#164891]: https://github.com/cockroachdb/cockroach/pull/164891
[#164892]: https://github.com/cockroachdb/cockroach/pull/164892
[#164936]: https://github.com/cockroachdb/cockroach/pull/164936
[#165274]: https://github.com/cockroachdb/cockroach/pull/165274
[#165562]: https://github.com/cockroachdb/cockroach/pull/165562
[#165994]: https://github.com/cockroachdb/cockroach/pull/165994
[#166131]: https://github.com/cockroachdb/cockroach/pull/166131
[#166182]: https://github.com/cockroachdb/cockroach/pull/166182
[#166222]: https://github.com/cockroachdb/cockroach/pull/166222
[#166324]: https://github.com/cockroachdb/cockroach/pull/166324