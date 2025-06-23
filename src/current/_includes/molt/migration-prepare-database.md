<section class="filter-content" markdown="1" data-scope="postgres">
Ensure that the PostgreSQL database is configured for replication. Enable logical replication by setting `wal_level` to `logical` in `postgresql.conf` or in the SQL shell. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER SYSTEM SET wal_level = 'logical';
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Ensure that the MySQL database is configured for replication.

For MySQL **8.0 and later** sources, enable [global transaction identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) consistency. Set the following values in `mysql.cnf`, in the SQL shell, or as flags in the `mysql` start command:

- `--enforce-gtid-consistency=ON`
- `--gtid-mode=ON`
- `--binlog-row-metadata=full`

For MySQL **5.7** sources, set the following values. Note that `binlog-row-image` is used instead of `binlog-row-metadata`. Set `server-id` to a unique integer that differs from any other MySQL server you have in your cluster (e.g., `3`).

- `--enforce-gtid-consistency=ON`
- `--gtid-mode=ON`
- `--binlog-row-image=full`
- `--server-id={ID}`
- `--log-bin=log-bin`
</section>