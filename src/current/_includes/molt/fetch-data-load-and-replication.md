{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source "postgres://postgres:postgres@localhost:5432/molt?sslmode=disable" \
--target "postgres://root@localhost:26257/molt?sslmode=disable" \
--table-filter 'employees' \
--bucket-path 's3://molt-test' \
--table-handling truncate-if-exists \
--non-interactive \
--mode data-load-and-replication \
--pglogical-replication-slot-name cdc_slot \
--allow-tls-mode-disable
~~~

- `--table-filter` filters for tables with the `employees` string in the name.
- `--bucket-path` specifies a directory on an [Amazon S3 bucket](#data-path) where intermediate files will be written.
- `--table-handling` specifies that existing tables on CockroachDB should be truncated before the source data is loaded.
- `--mode data-load-and-replication` starts continuous [replication](#load-data-and-replicate-changes) of data from the source database to CockroachDB after the fetch task succeeds.
- `--pglogical-replication-slot-name` specifies a replication slot name to be created on the source PostgreSQL database. This is used in continuous [replication](#load-data-and-replicate-changes).
<!-- - `--cleanup` specifies that the intermediate files should be removed after the source data is loaded. -->

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source "mysql://user:password@localhost/molt" \
--target "postgres://root@localhost:26257/molt?sslmode=disable" \
--table-filter 'employees' \
--bucket-path 's3://molt-test' \
--table-handling truncate-if-exists \
--non-interactive \
--mode data-load-and-replication \
--allow-tls-mode-disable
~~~

- tk
- tk
</section>