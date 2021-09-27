Find the transactions and statements within the transactions that are experiencing contention. CockroachDB has several ways of tracking down transactions that are experiencing contention:

* The [Transactions page](ui-transactions-page.html) and the [Statements page](ui-statements-page.html) in the DB Console allow you to sort by contention.
* Query the `crdb_internal.cluster_contended_indexes` and `crdb_internal.cluster_contended_tables` tables for your database to find the indexes and tables that are experiencing contention.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM movr.crdb_internal.cluster_contended_indexes;
    SELECT * FROM movr.crdb_internal.cluster_contended_tables;
    ~~~

After identifying the transactions or statements that are causing contention, follow the steps [outlined in our best practices recommendations to avoid contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
