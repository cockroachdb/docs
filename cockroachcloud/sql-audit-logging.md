---
title: SQL Audit Logging
summary: Learn about the SQL Audit Logging feature for {{ site.data.products.db }} clusters.
toc: true
docs_area: manage
---

SQL audit logging gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

To enable the feature, [enable auditing](#enable-auditing) for a table and then [contact us](https://support.cockroachlabs.com/hc/en-us) to request the audit logs.

## Enable auditing

Use the [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](../{{site.current_cloud_version}}/alter-table.html#experimental_audit) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

{{site.data.alerts.callout_info}}
To turn on auditing for more than one table, issue a separate `ALTER` statement for each table.
{{site.data.alerts.end}}
