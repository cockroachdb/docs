If MOLT Fetch fails while loading data into CockroachDB from intermediate files, it exits with an error message, fetch ID, and *continuation token* for each table that failed to load on the target database. 

~~~json
{"level":"info","table":"public.employees","file_name":"shard_01_part_00000001.csv.gz","message":"creating or updating token for duplicate key value violates unique constraint \"employees_pkey\"; Key (id)=(1) already exists."}
{"level":"info","table":"public.employees","continuation_token":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","message":"created continuation token"}
{"level":"info","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","message":"continue from this fetch ID"}
{"level":"error","message":"Error: error from fetching table for public.employees: error importing data: duplicate key value violates unique
  constraint \"employees_pkey\" (SQLSTATE 23505)"}
~~~

You can use this information to [continue the task from the *continuation point*]({% link molt/molt-fetch.md %}#continue-molt-fetch-after-interruption) where it was interrupted.

Continuation is only possible under the following conditions:

- All data has been exported from the source database into intermediate files on [cloud]({% link molt/molt-fetch.md %}#bucket-path) or [local storage]({% link molt/molt-fetch.md %}#local-path).
- The *initial load* of source data into the target CockroachDB database is incomplete.
- The load uses [`IMPORT INTO` rather than `COPY FROM`](#data-load-mode).

{{site.data.alerts.callout_info}}
Only one fetch ID and set of continuation tokens, each token corresponding to a table, are active at any time. See [List active continuation tokens]({% link molt/molt-fetch.md %}#list-active-continuation-tokens).
{{site.data.alerts.end}}

The following command reattempts the data load starting from a specific continuation file, but you can also use individual continuation tokens to [reattempt the data load for individual tables]({% link molt/molt-fetch.md %}#continue-molt-fetch-after-interruption).

<section class="filter-content" markdown="1" data-scope="postgres">

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--schema-filter 'migration_schema' \
--table-filter 'employees|payments|orders' \
--bucket-path 's3://migration/data/cockroach' \
--table-handling truncate-if-exists \
--ignore-replication-check \
--fetch-id f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c \
--continuation-file-name shard_01_part_00000001.csv.gz
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--table-filter 'employees|payments|orders' \
--bucket-path 's3://migration/data/cockroach' \
--table-handling truncate-if-exists \
--ignore-replication-check \
--fetch-id f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c \
--continuation-file-name shard_01_part_00000001.csv.gz
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
The command assumes an Oracle Multitenant (CDB/PDB) source. [`--source-cdb`]({% link molt/molt-fetch-commands-and-flags.md %}#source-cdb) specifies the container database (CDB) connection string.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--source-cdb $SOURCE_CDB \
--target $TARGET \
--schema-filter 'migration_schema' \
--table-filter 'employees|payments|orders' \
--bucket-path 's3://migration/data/cockroach' \
--table-handling truncate-if-exists \
--ignore-replication-check \
--fetch-id f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c \
--continuation-file-name shard_01_part_00000001.csv.gz
~~~
</section>