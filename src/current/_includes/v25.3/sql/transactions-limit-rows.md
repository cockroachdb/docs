- When the `transaction_rows_read_err` [session setting]({% link {{ page.version.version }}/set-vars.md %}#transaction-rows-read-err) is enabled, transactions that read more than the specified number of rows will fail. In addition, the [optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) will not create query plans with scans that exceed the specified row limit. For example, to set a default value for [all users]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-all-users) at the cluster level:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER ROLE ALL SET transaction_rows_read_err = 1000;
    ~~~

- When the `transaction_rows_written_err` [session setting]({% link {{ page.version.version }}/set-vars.md %}#transaction-rows-written-err) is enabled, transactions that write more than the specified number of rows will fail. For example, to set a default value for all users at the cluster level:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER ROLE ALL SET transaction_rows_written_err = 1000;
    ~~~

To assess the impact of configuring these session settings, use the corresponding session settings [`transaction_rows_read_log`]({% link {{ page.version.version }}/set-vars.md %}#transaction-rows-read-log) and [`transaction_rows_written_log`]({% link {{ page.version.version }}/set-vars.md %}#transaction-rows-written-log) to log transactions that read or write the specified number of rows. Transactions are logged to the [`SQL_PERF`]({% link {{ page.version.version }}/logging.md %}#sql_perf) channel.
