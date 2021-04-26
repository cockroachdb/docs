---
title: Alerts Page
summary: The Alerts page allows you to toggle CockroachCloud alerts and view alert history.
toc: true
---

The **Alerts** page allows you to toggle CockroachCloud alerts, send test alerts, and view the email recipients and alert history for your CockroachCloud Organization. To view the Alerts page, [log in](https://cockroachlabs.cloud/) and click **Alerts**.

If alerts are enabled, CockroachCloud will send alerts to [specified email receipients](#configure-alerts) when the following usage metrics are detected:

**Storage Utilization:**

- Cluster-wide available disk capacity is **20% or less**.
- Node-level available disk capacity is **10% or less**.

**CPU Utilization:**

- Cluster-wide CPU usage is **80% or greater** on *average* for at least 60 minutes.
- Node-level CPU usage is **90% or greater** on *average* for at least 90 minutes.

**Memory Utilization:**

- Cluster-wide available memory is **20% or less** on *average* for at least 60 minutes.
- Node-level available memory is **10% or less** on *average* for at least 90 minutes.

If you receive an alert repeatedly, you may need to [optimize your workload](../stable/make-queries-fast.html) or [scale your CockroachCloud cluster](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster).

{{site.data.alerts.callout_success}}
When scaling your cluster, we recommend first scaling VMs to include more than 2 vCPUs each. If this doesn't sufficiently improve performance, then add more nodes.
{{site.data.alerts.end}}

## Configure alerts

To enable alerts:

- Under **Configure CockroachCloud Alerts**, toggle the **Alerts are on** switch.
- Under **Add Email Recipients**, add at least one email address and click **Add**.

Note that alerts are enabled for all clusters in your Organization. To filter alerts on specific clusters, you can use an email alias to send alerts to a monitoring tool such as [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) or [PagerDuty](https://www.pagerduty.com/).

To send a test alert:

1. Under **Send test email**, select a cluster and an alert type.
1. Add at least one email address and click **Add**.
1. Click **Send test email**.