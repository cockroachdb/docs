Find the transactions and statements within the transactions that are experiencing contention. CockroachDB has several tools to help you track down such transactions and statements:

* In the DB Console:
  - Visit the [Insights > Workload Insights > Transaction Executions](ui-insights-page.html) view and look for transaction executions with the **High Contention** insight.
  - Visit the [**Transactions**](ui-transactions-page.html) and [**Statements**](ui-statements-page.html) pages and sort transactions and statements by **Contention Time**.
* Query the [`crdb_internal.cluster_contended_indexes`](crdb-internal.html#cluster_contended_indexes) and [`crdb_internal.cluster_contended_tables`](crdb-internal.html#cluster_contended_tables) tables for your database to find the indexes and tables that are experiencing contention. To find out which transactions are holding locks on which objects, query [`crdb_internal.cluster_locks`](crdb-internal.html#cluster_locks).

After you identify the transactions or statements that are causing contention, follow the steps in the next section [to avoid contention](performance-best-practices-overview.html#avoid-transaction-contention).

{{site.data.alerts.callout_info}}
If you experience a hanging or stuck query that is not showing up in the list of contended transactions and statements on the [Transactions](ui-transactions-page.html) or [Statements](ui-statements-page.html) pages in the DB Console, the process described above will not work.  You will need to follow the process described in [Hanging or stuck queries](query-behavior-troubleshooting.html#hanging-or-stuck-queries) instead.
{{site.data.alerts.end}}
