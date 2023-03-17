* In the [**Transaction Executions** view](ui-insights-page.html) on the **Insights** page, transaction executions display the **High Contention** insight.
* Your application is experiencing degraded performance with transaction errors like `SQLSTATE: 40001`, `RETRY_WRITE_TOO_OLD`, and `RETRY_SERIALIZABLE`. See [Transaction Retry Error Reference](transaction-retry-error-reference.html).
* The [SQL Statement Contention graph](ui-sql-dashboard.html#sql-statement-contention) is showing spikes over time.
<img src="{{ 'images/v22.2/ui-statement-contention.png' | relative_url }}" alt="SQL Statement Contention graph in DB Console" style="border:1px solid #eee;max-width:100%" />
* The [Transaction Restarts graph](ui-sql-dashboard.html) is showing spikes in retries over time.
