---
title: Alerts Page
summary: The Alerts page allows you to toggle CockroachDB Cloud alerts and view alert history.
toc: true
docs_area: manage
---

The **Alerts** page allows you to enable email alerts, send test alerts, and view the email recipients and alert history for your CockroachDB {{ site.data.products.cloud }} organization. To view the Alerts page, [log in](https://cockroachlabs.cloud/) and click **Alerts**. 

{{site.data.alerts.callout_info}}
The **Alerts** page is applicable for CockroachDB {{ site.data.products.dedicated }} clusters in your CockroachDB {{ site.data.products.cloud }} organization. For CockroachDB {{ site.data.products.serverless }} clusters in your organization, all [Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator) automatically receive email alerts when your cluster reaches 50%, 75%, and 100% of your [resource limits](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits).
{{site.data.alerts.end}}

## Automatic alerts

### Cluster Maintenance

[Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator) receive email alerts when:

- A cluster is scheduled for an automatic [patch version upgrade]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades) and again after the upgrade is complete. 
- When a cluster is scheduled for [maintenance]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) that could temporarily impact the cluster's performance. 
- When a cluster's CockroachDB version is nearing [end of life](https://www.cockroachlabs.com/docs/releases/release-support-policy#support-cycle) and must be upgraded to maintain support.

### CMEK

The [Customer-Managed Encryption Keys (CMEK)](https://www.cockroachlabs.com/docs/cockroachcloud/cmek) alert is triggered when the cluster node is unable to start due to CMEK key access failure.
{% comment %}- Encrypted backup failed due to CMEK key access failure.{% endcomment %}

If you receive the alert repeatedly, verify the following:

- The key is still enabled in their cloud provider KMS. 
- The role or account used to access the key still has valid permissions. 
- The credentials or access key are still valid, and generate new credentials if needed.

## Opt-in alerts

Even with CockroachDB's various [built-in safeguards](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/frequently-asked-questions#how-does-cockroachdb-survive-failures) against failure, it is critical to [enable](#configure-alerts) alerts and actively monitor the overall health and performance of a cluster running in production.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.dedicated }} clusters do not auto-scale and upgrade cluster capacity in response to utilization alerts. If you receive an alert repeatedly, you may need to [optimize your workload](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/make-queries-fast) or [scale your CockroachDB {{ site.data.products.cloud }} cluster]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#add-or-remove-nodes-from-a-cluster).
{{site.data.alerts.end}}

If alerts are enabled, CockroachDB {{ site.data.products.cloud }} sends alerts to [specified email recipients](#configure-alerts) when the following usage metrics are detected:

### Storage Utilization

Storage utilization alerts are triggered when:

- Cluster-wide available disk capacity is **20% or less**.
- Node-level available disk capacity is **10% or less**.

If the condition triggering an alert does not change, the alert will repeat every 60 minutes.

If you receive an alert repeatedly:

- Consider [increasing storage per node]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#increase-storage-for-a-cluster).
- Consider [truncating](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/truncate) or [dropping unused tables](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-table).

### CPU Utilization

CPU utilization alerts are triggered when:

- Cluster-wide CPU usage is **80% or greater** on *average* for at least 60 minutes.
- Node-level CPU usage is **90% or greater** on *average* for at least 90 minutes.

If the condition triggering an alert does not change, the cluster-wide alert will repeat every 60 minutes and the node-level alert will repeat every 90 minutes.

If you receive an alert repeatedly:

- Identify unoptimized queries and [optimize your workload](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/make-queries-fast). 
- Add one or more [indexes](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/create-index) to improve query performance.
- Consider [increasing the capacity]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#change-compute-for-a-cluster) of the nodes or [add more nodes]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#add-or-remove-nodes-from-a-cluster) to reduce the load per node. 

### Memory Utilization

Memory utilization alerts are triggered when:

- Cluster-wide available memory is **20% or less** on *average* for at least 60 minutes.
- Node-level available memory is **10% or less** on *average* for at least 90 minutes.

If the condition triggering an alert does not change, the cluster-wide alert will repeat every 60 minutes and the node-level alert will repeat every 90 minutes.

If you receive an alert repeatedly:

- Identify unoptimized queries and [optimize your workload](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/make-queries-fast). 
- Add one or more [indexes](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/create-index) to improve query performance.
- Consider [increasing the capacity]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#change-compute-for-a-cluster) of the nodes or [add more nodes]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#add-or-remove-nodes-from-a-cluster) to reduce the load per node. 

### Maintenance Window 

For clusters with [maintenance windows]({% link cockroachcloud/cluster-management.md %}?filters=dedicated#set-a-maintenance-window) configured, users who have [signed up for alerts](#configure-alerts) will receive email notifications.

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