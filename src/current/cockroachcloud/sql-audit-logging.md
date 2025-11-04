---
title: SQL Audit Logging
summary: Learn about the SQL Audit Logging feature for CockroachDB Cloud clusters.
toc: false
docs_area: manage
---

SQL audit logging gives you detailed information about queries being executed against a table in your cluster. This feature is especially useful when you want to log all queries that are run against a table that contains cardholder data, private health information (PHI), or other personally-identifiable information (PII).

After you enable SQL audit logging for a table, audit logs are sent to the [`SENSITIVE_ACCESS` logging channel]({% link {{site.current_cloud_version}}/logging-use-cases.md %}#sensitive_access). You can then export these logs depending on your deployment.  for more information, refer to [Export Logs From a CockroachDB Standard Cluster]({% link cockroachcloud/export-logs.md %}) or [Export Logs From a CockroachDB Advanced Cluster]({% link cockroachcloud/export-logs-advanced.md %}).

## Enable auditing

Use the [`ALTER TABLE ... EXPERIMENTAL_AUDIT`]({% link {{site.current_cloud_version}}/alter-table.md %}#experimental_audit) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE {table_name} EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

Replace `{table_name}` with the name of a table.
