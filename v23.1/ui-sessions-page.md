---
title: Sessions Page
summary: The Sessions page provides details of all open sessions in the cluster.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
On a secure cluster, you must be an `admin` user or a SQL user with the `VIEWACTIVITY` [system privilege](security-reference/authorization.html#supported-privileges) (or the legacy `VIEWACTIVITY` [role option](security-reference/authorization.html#role-options)). Other users will see only their own sessions. Refer to [DB Console security](ui-overview.html#db-console-access).
{{site.data.alerts.end}}

The **Sessions** page provides information about open SQL sessions in your cluster, using data in the cluster's [`crdb_internal` system catalog](monitoring-and-alerting.html#crdb_internal-system-catalog). To view it, click **SQL Activity**, then click **Sessions**.

{% include common/ui/sessions-page.md %}

{% include {{ page.version.version }}/ui/sessions.md %}
