**Expected values for a healthy cluster**: At any time, the total number of connections actively executing SQL statements should not exceed 4 times the number of vCPUs in the cluster. You can find them in the Active Executions view in the [DB Console]({% link {{ page.version.version }}/ui-statements-page.md %}) or [Cloud Console](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page). You can find the number of open connections in the [DB Console]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#open-sql-sessions) or [Cloud Console](../cockroachcloud/metrics-page.html#sql-open-sessions). For more details on configuring connection pools, see [Size connection pools](connection-pooling.html#size-connection-pools).