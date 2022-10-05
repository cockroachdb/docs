---
title: Sessions Page
summary: The Sessions page provides details of all open sessions in the cluster.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by a SQL user with the `VIEWACTIVITY` [role option](alter-role.html#role-options). Non-`admin` users will see only their own sessions, while `admin` users see sessions for all users.
{{site.data.alerts.end}}

The **Sessions** page  of the DB Console provides details of all open sessions in the cluster.

To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. Click the **Sessions** tab.

{% include common/ui/sessions-page.md %}

{% include {{ page.version.version }}/ui/sessions.md %}
