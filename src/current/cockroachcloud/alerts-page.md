---
title: Alerts Page
summary: The Alerts page allows you to toggle CockroachDB Cloud alerts and view alert history.
toc: true
docs_area: manage
page_version: v23.1
---

The **Alerts** page allows you to enable email alerts, send test alerts, and view the email recipients and alert history for your CockroachDB {{ site.data.products.cloud }} organization. To view the Alerts page, [log in](https://cockroachlabs.cloud/) and click **Alerts**.

{{site.data.alerts.callout_info}}
The **Alerts** page is applicable for CockroachDB {{ site.data.products.dedicated }} clusters in your CockroachDB {{ site.data.products.cloud }} organization. For CockroachDB {{ site.data.products.serverless }} clusters in your organization, all [Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) automatically receive email alerts when your cluster reaches 50%, 75%, and 100% of your [resource limits](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits).
{{site.data.alerts.end}}

If alerts are enabled, CockroachDB {{ site.data.products.cloud }} sends alerts to [specified email recipients](#configure-alerts) when the following usage metrics are detected:

**Storage Utilization:**

- Cluster-wide available disk capacity is **20% or less**.
- Node-level available disk capacity is **10% or less**.

**CPU Utilization:**

- Cluster-wide CPU usage is **80% or greater** on *average* for at least 60 minutes.
- Node-level CPU usage is **90% or greater** on *average* for at least 90 minutes.

**Memory Utilization:**

- Cluster-wide available memory is **20% or less** on *average* for at least 60 minutes.
- Node-level available memory is **10% or less** on *average* for at least 90 minutes.

**CMEK:**

- Cluster node unable to start due to CMEK key access failure.
{% comment %}- Encrypted backup failed due to CMEK key access failure.{% endcomment %}

If you receive an alert repeatedly, you may need to [optimize your workload](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/make-queries-fast) or [scale your CockroachDB {{ site.data.products.cloud }} cluster]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#add-or-remove-nodes-from-a-cluster).

[Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) also receive email alerts when your cluster undergoes an automatic [patch version upgrade]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades).

## Configure alerts

To enable alerts:

1. Under **Configure CockroachDB {{ site.data.products.cloud }} alerts**, toggle the **Alerts are on** switch.
1. Under **Add Email Recipients**, add at least one email address and click **Add**.

Alerts are enabled for all CockroachDB {{ site.data.products.dedicated }} clusters in your Organization.

{{site.data.alerts.callout_success}}
You can use an email alias to send alerts to a monitoring tool such as [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) or [PagerDuty](https://www.pagerduty.com/).
{{site.data.alerts.end}}

## Send a test alert

To send a test alert:

1. Under **Send test email**, select a cluster and an alert type.
1. Add at least one email address and click **Add**.
1. Click **Send test email**.

## Repeated alerts

If the condition triggering an alert does not change, the alert will repeat at a specific cadence:

**Storage Utilization:**

- Cluster-wide alerts: every 60 minutes
- Node-level alerts: every 60 minutes

**CPU Utilization:**

- Cluster-wide alerts: every 60 minutes
- Node-level alerts: every 90 minutes

**Memory Utilization:**

- Cluster-wide alerts: every 60 minutes
- Node-level alerts: every 90 minutes
