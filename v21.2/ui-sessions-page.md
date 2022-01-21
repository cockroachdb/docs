---
title: Sessions Page
summary: The Sessions page provides details of all open sessions in the cluster.
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by a SQL user with the [`VIEWACTIVITY`]({{ link_prefix }}authorization.html#create-and-manage-users) role option. Note that non-`admin` users will see only their own sessions, while `admin` users see sessions for all users.
{{site.data.alerts.end}}

The **Sessions** page provides details of all open sessions in the cluster.

To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. The **Sessions** tab is selected.

{% include common/ui/sessions-page.md %}
