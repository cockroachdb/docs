Find the transactions and statements within the transactions that are experiencing contention.

The [Transactions page](ui-transactions-page.html) and the [Statements page](ui-statements-page.html) in the DB Console allow you to sort by contention.

You can also query the `crdb_internal.cluster_contention_events` table for your database to find the transactions that are experiencing contention.

{%comment%} Replace with final statements {%endcomment%}
{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM movr.crdb_internal.cluster_contention_events ORDER BY num_contention_events DESC;
SELECT * FROM movr.crdb_internal.cluster_contention_events ORDER BY cumulative_contention_time DESC;
~~~
