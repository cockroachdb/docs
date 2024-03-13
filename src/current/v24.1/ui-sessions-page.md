---
title: Sessions Page
summary: The Sessions page provides details of all open sessions in the cluster.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
On a [secure cluster]({% link {{ page.version.version }}/secure-a-cluster.md %}), you must be an [`admin` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy `VIEWACTIVITY` [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)). Other users will see only their own sessions. Refer to [DB Console security]({% link {{ page.version.version }}/ui-overview.md %}#db-console-security-considerations).
{{site.data.alerts.end}}

The **Sessions** page provides information about open SQL sessions in your cluster, using data in the cluster's [`crdb_internal` system catalog]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#crdb_internal-system-catalog). To view it, click **SQL Activity**, then click **Sessions**.

{% include common/ui/sessions-page.md %}

{% include {{ page.version.version }}/ui/sessions.md %}
