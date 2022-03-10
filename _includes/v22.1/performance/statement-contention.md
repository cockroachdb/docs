Find the transactions and statements within the transactions that are experiencing contention. CockroachDB has several tools to help you track down such transactions and statements:

* In DB Console, visit the [Transactions](ui-transactions-page.html) and [Statements](ui-statements-page.html) pages and sort transactions and statements by contention.
* Query the [`crdb_internal.cluster_contended_indexes`](crdb-internal.html#cluster_contended_indexes) and [`crdb_internal.cluster_contended_tables`](crdb-internal.html#cluster_contended_tables) tables for your database to find the indexes and tables that are experiencing contention.

After you identify the transactions or statements that are causing contention, follow the steps in the next section [to avoid contention](performance-best-practices-overview.html#avoid-transaction-contention).
