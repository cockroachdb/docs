---
title: SQL Audit Logging
summary: Learn about the SQL Audit Logging feature for CockroachDB Cloud clusters.
toc: true
docs_area: manage
---

SQL audit logging gives you detailed information about queries being executed against a table in your cluster. This feature is especially useful when you want to log all queries that are run against a table that contains cardholder data, private health information (PHI), or other personally-identifiable information (PII).

After you enable SQL audit logging for a table, [contact Support](https://support.cockroachlabs.com/hc/) to request the audit logs.

## Enable auditing

Use the [`ALTER TABLE ... EXPERIMENTAL_AUDIT`]({% link {{site.current_cloud_version}}/alter-table.md %}#experimental_audit) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE {table_name} EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

Replace `{table_name}` with the name of a table.
