---
title: Alerts Page
summary: The Alerts page allows you to toggle CockroachDB Cloud alerts and view alert history.
toc: true
docs_area: manage
---

The **Alerts** page allows you to toggle {{ site.data.products.db }} alerts, send test alerts, and view the email recipients and alert history for your {{ site.data.products.db }} Organization. To view the Alerts page, [log in](https://cockroachlabs.cloud/) and click **Alerts**.

{{site.data.alerts.callout_info}}
The **Alerts** page is accessible on {{ site.data.products.dedicated }} clusters. For {{ site.data.products.serverless }} clusters, all [Console Admins](console-access-management.html#console-admin) will automatically receive email alerts when your cluster reaches 75% and 100% of its burst capacity or storage limit. If you set a resource limit, you will also receive alerts at 50%, 75%, and 100% of your resource limit.
{{site.data.alerts.end}}

If alerts are enabled, {{ site.data.products.db }} will send alerts to [specified email recipients](#configure-alerts) when the following usage metrics are detected:

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
- Encrypted backup failed due to CMEK key access failure.

If you receive an alert repeatedly, you may need to [optimize your workload](../stable/make-queries-fast.html) or [scale your {{ site.data.products.db }} cluster](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster).

[Console Admins](console-access-management.html#console-admin) will also receive email alerts when your cluster undergoes an automatic [patch version upgrade](upgrade-policy.html#patch-version-upgrades).

{{site.data.alerts.callout_success}}
When scaling your cluster, we recommend first scaling VMs to include more than 2 vCPUs each. If this doesn't sufficiently improve performance, then add more nodes.
{{site.data.alerts.end}}

## Configure alerts

To enable alerts:

- Under **Configure {{ site.data.products.db }} alerts**, toggle the **Alerts are on** switch.
- Under **Add Email Recipients**, add at least one email address and click **Add**.

Note that alerts are enabled for all clusters in your Organization. To filter alerts on specific clusters, you can use an email alias to send alerts to a monitoring tool such as [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) or <a href="https://www.pagerduty.com/" data-proofer-ignore>PagerDuty</a>.

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
