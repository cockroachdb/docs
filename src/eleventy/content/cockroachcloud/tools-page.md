---
title: Tools Page
summary: How to use the Tools page to enable monitoring with Datadog and access the DB Console.
toc: true
docs_area: manage
---

The **Tools** page is accessible on CockroachDB {{ site.data.products.standard }} and {{ site.data.products.advanced }} clusters. This page allows you to:

- Set up cluster [monitoring with Datadog](#monitor-cockroachdb-cloud-with-datadog) (available on clusters hosted on AWS and GCP).
- Set up cluster [monitoring with Amazon CloudWatch](#monitor-cockroachdb-cloud-with-amazon-cloudwatch-integration) (available on clusters hosted on AWS).
- Access the [built-in DB Console](#access-the-db-console) to view time-series data on SQL queries, troubleshoot query performance, view a list of jobs, and more (available on CockroachDB {{ site.data.products.advanced }} clusters).

To view the **Tools** page, select a cluster from the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), and click **Tools** in the **Monitoring** section of the left side navigation.

## Monitor CockroachDB Cloud with Datadog

The [CockroachDB {{ site.data.products.cloud }} integration for Datadog](https://docs.datadoghq.com/integrations/cockroachdb_dedicated/) enables data collection and alerting on a [subset of CockroachDB metrics](#available-metrics) available at the [Prometheus endpoint]({% link "{{site.current_cloud_version}}/monitoring-and-alerting.md" %}#prometheus-endpoint), using the Datadog platform.

To set up Datadog monitoring with CockroachDB {{ site.data.products.standard }} and {{ site.data.products.advanced }}, your Datadog account must be associated with a [Datadog organization](https://docs.datadoghq.com/account_management/#organizations).

{{site.data.alerts.callout_success}}
Enabling the Datadog integration on your CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} cluster will apply additional charges to your **Datadog** bill. Your CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} bill is unchanged.
{{site.data.alerts.end}}

For more information about using Datadog, see the [Datadog documentation](https://docs.datadoghq.com/).

### Enable integration

To enable Datadog monitoring for a CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} cluster, you can **either**:

- Use the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}), following the instructions on [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link "cockroachcloud/export-metrics.md" %}?filters=datadog-metrics-export) or [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link "cockroachcloud/export-metrics-advanced.md" %}?filters=datadog-metrics-export).

OR

- Use the Cloud Console, following the steps below.

1. On the cluster's **Tools** page, click **Setup** in the **Datadog** panel.

1. Fill in the **API key** and **Datadog Site** fields with their corresponding values.
    - The **API key** is associated with your Datadog organization. If you don't have an API key to use with your CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} cluster, you need to create one. For instructions, see the [Datadog documentation](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).
    - Your **Datadog Site** corresponds to your Datadog Site URL. For more details, see the [Datadog documentation](https://docs.datadoghq.com/getting_started/site/).

1. Click **Create**. Depending on the size of your cluster and the current load on the system, the integration might take some time to become enabled.

1. Once it is registered on Datadog, the cluster will appear on your Datadog [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/). This can take up to several minutes.

### Verify integration status

Once enabled, the **Integration status** in the **Datadog** panel on the **Tools** page will show as `Active`.

If an issue is encountered during the integration, one of the following statuses may appear instead:

- `Active` indicates that the integration has been successfully deployed.
- `Inactive` indicates that the integration has not been successfully deployed. Setup has either not been attempted or has encountered an error.
- `Unhealthy` indicates that the integration API key is invalid and needs to be [updated](#update-integration).
- `Unknown` indicates that an unknown error has occurred. If this status is displayed, [contact our support team](https://support.cockroachlabs.com/).

Metrics export from CockroachDB can be interrupted in the event of:

- A stale API key. In this case, the integration status will be `Unhealthy`. To resolve the issue, [update your integration](#update-integration) with a new API key.
- Transient CockroachDB unavailability. In this case, the integration status will continue to be `Active` but you might experience incomplete metrics exports in Datadog. To resolve the issue, try [deactivating](#deactivate-integration) and reactivating the integration from the **Datadog** panel. If this does not resolve the issue, [contact our support team](https://support.cockroachlabs.com/).

{{site.data.alerts.callout_info}}
Gaps in metrics within Datadog do not necessarily point to an availability issue with CockroachDB. If you encounter any gaps in metrics, we recommend [contacting support](https://support.cockroachlabs.com/).
{{site.data.alerts.end}}

To monitor the health of metrics export, you can [create a custom Monitor](#monitor-health-of-metrics-export) in Datadog.

### View and configure dashboards

Open your Datadog [Dashboard List](https://docs.datadoghq.com/dashboards/#dashboard-list). There are two sample dashboards that present CockroachDB metrics:

- `CockroachDB {{ site.data.products.cloud }} {{ site.data.products.standard }}`
- `CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }}`

Both sample dashboards presents a high-level view of SQL performance and latency, and information about resource consumption to help aid in capacity planning. `CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }}` provides the ability to drill down to specific nodes (identified by a `(node, region)` tag pair) within your cluster.

To create your own CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} dashboard, you can either [clone](https://docs.datadoghq.com/dashboards/#clone-dashboard) the default dashboards and edit the widgets, or [create a new dashboard](https://docs.datadoghq.com/dashboards/#new-dashboard).

The [available metrics](#available-metrics) are drawn directly from the CockroachDB [Prometheus endpoint]({% link "{{site.current_cloud_version}}/monitoring-and-alerting.md" %}#prometheus-endpoint) and are intended for use as building blocks for your own charts.

{{site.data.alerts.callout_info}}
Metric values and time-series graphs in Datadog are not guaranteed to match those in the [DB Console](#access-the-db-console), due to differences in how CockroachDB and Datadog calculate and display metrics. For more information, refer to [Differences in Metrics between Third-Party Monitoring Integrations and DB Console]({% link "{{site.current_cloud_version}}/differences-in-metrics-between-third-party-monitoring-integrations-and-db-console.md" %}).
{{site.data.alerts.end}}

#### Enable percentiles for selected metrics

A subset of CockroachDB metrics require that you explicitly enable percentiles for them in the Datadog interface. Graphs that display data for these metrics will fail to render properly otherwise.

To enable percentiles for these metrics, perform the following steps:

1. In your Datadog interface, select **Metrics** then **Summary** from the sidebar.
1. Check the **Distributions** checkbox in the **Metric Type** section to limit returned metrics to the subset of CockroachDB metrics that require percentiles support.
1. For each metric shown:
    1. Select the metric and expand its **Advanced** section.
    1. Click the **Edit** button.
    1. Click the slider labeled **Enable percentiles and threshold queries**.
    1. Click the **Save** button.

You only need to perform this once per metric. Datadog graphs reliant on these metrics will begin rendering immediately once configured in this manner.

Only data received for these metrics once percentiles are enabled can be displayed; any data collected before enabling percentiles for these specific metrics cannot be rendered.

#### Available metrics

To preview the metrics being collected, you can:

- Click on your cluster's entry in the [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/) to display time-series graphs for each available metric.
- Use the [Metrics Explorer](https://docs.datadoghq.com/metrics/explorer/) to search for and view `crdb_cloud` metrics.

See [Metrics]({% link "{{site.current_cloud_version}}/metrics.md" %}) for the full list of metrics available in CockroachDB.

### Monitor health of metrics export

To monitor the health of metrics export in a CockroachDB {{ site.data.products.advanced }} cluster, we recommend that you [create a new Monitor](https://docs.datadoghq.com/monitors/create/types/metric/?tab=threshold).

Select **Threshold Alert** as the detection method, which configures an alert that is sent when a supported metric reaches a given threshold. For descriptions of some useful CockroachDB alerts, see [Monitoring and Alerting]({% link "{{site.current_cloud_version}}/monitoring-and-alerting.md" %}#events-to-alert-on).

- To **Define the metric**:

    - Select the `otel.datadog_exporter.metrics.running` metric.

    - Export the metric **from** your CockroachDB {{ site.data.products.advanced }} cluster (the cluster name in the [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/)).

- To **Set alert conditions**:

    - Trigger when the metric is `below` the threshold `on average` during the last `15 minutes`.

    - Set **Alert threshold** to `1`.

    - `Notify` if data is missing for more than `15` minutes.

This monitor will notify your organization if Datadog is no longer receiving data from your CockroachDB {{ site.data.products.advanced }} cluster.

### Update integration

To update the metadata associated with the integration (for example, to rotate API keys):

1. In the **Datadog** panel, click the ellipsis and select **Update**.

1. Update the **API key** and **Datadog Site** fields and click **Create**. The integration will be redeployed.

### Deactivate integration

To deactivate the integration:

1. In the **Datadog** panel, click the ellipsis and select **Deactivate integration**.

1. When disabled, the **Integration status** in the panel will show as `Inactive`.

After deactivating an integration, the metrics data will remain in Datadog for a default [retention period](https://docs.datadoghq.com/developers/guide/data-collection-resolution-retention/).

## Monitor CockroachDB {{ site.data.products.cloud }} with Amazon CloudWatch integration

The CockroachDB {{ site.data.products.cloud }} integration for [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) enables data collection and alerting on CockroachDB metrics available at the [Prometheus endpoint]({% link "{{site.current_cloud_version}}/monitoring-and-alerting.md" %}#prometheus-endpoint). It is only available with CockroachDB {{ site.data.products.standard }} and {{ site.data.products.advanced }} clusters hosted on AWS.

{{site.data.alerts.callout_success}}
Enabling the Amazon CloudWatch integration on your CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} cluster will apply additional charges to your **Amazon CloudWatch** bill. Your CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} bill is unchanged.
{{site.data.alerts.end}}

### Enable

To enable Amazon CloudWatch monitoring for a CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} cluster hosted on AWS, you can **either**:

- Use the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}), following the instructions on [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link "cockroachcloud/export-metrics.md" %}) or [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link "cockroachcloud/export-metrics-advanced.md" %}).

OR

- Use the Cloud Console, following the steps below.

1. On the cluster's **Tools** page, click **Setup** in the **CloudWatch** panel.

1. Fill in the **Role ARN**, **Target Region**, and **Log Group Name** fields with their corresponding values.
    - The **Role ARN** is in the format: `arn:aws:iam::{role_arn}:role/{role_name}`. To determine `{role_arn}` and `{role_name}`, follow the steps in the **Enable metrics export** section on [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link "cockroachcloud/export-metrics.md" %}#enable-metrics-export) or [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link "cockroachcloud/export-metrics-advanced.md" %}#enable-metrics-export).
    - The **Target Region** is your AWS region, like `us-east-1`. Specifying an AWS region that you do not have a cluster in, or a region that only partially covers your cluster, will result in missing metrics.
    - The **Log Group Name** is the target Amazon CloudWatch log group you used when creating the role in the **Role ARN**.

1. Click **Create**. Depending on the size of your cluster and the current load on the system, the integration might take some time to become enabled.

1. Once metrics export has been enabled, you can access metrics from your CockroachDB {{ site.data.products.standard }} cluster directly in [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/home).

### Verify status

Once enabled, the **Integration status** in the **CloudWatch** panel on the **Tools** page will show as `Active`.

If an issue is encountered during the integration, one of the following statuses may appear instead:

- `Active` indicates that the integration has been successfully deployed.
- `Inactive` indicates that the integration has not been successfully deployed. Setup has either not been attempted or has encountered an error.
- `Unknown` indicates that an unknown error has occurred. If this status is displayed, [contact our support team](https://support.cockroachlabs.com/).

In the event of transient CockroachDB unavailability, metrics export from CockroachDB can be interrupted. In this case, the integration status will continue to be `Active` but you might experience incomplete metrics exports in CloudWatch. To resolve the issue, try [deactivating](#deactivate) and reactivating the integration from the **CloudWatch** panel. If this does not resolve the issue, [contact our support team](https://support.cockroachlabs.com/).

{{site.data.alerts.callout_info}}
Gaps in metrics within CloudWatch do not necessarily point to an availability issue with CockroachDB. If you encounter any gaps in metrics, we recommend [contacting support](https://support.cockroachlabs.com/).

Metric values and time-series graphs in CloudWatch are not guaranteed to match those in the [DB Console](#access-the-db-console), due to differences in how CockroachDB and CloudWatch calculate and display metrics. For more information, refer to [Differences in Metrics between Third-Party Monitoring Integrations and DB Console]({% link "{{site.current_cloud_version}}/differences-in-metrics-between-third-party-monitoring-integrations-and-db-console.md" %}).
{{site.data.alerts.end}}

### Update

To update the metadata associated with the integration:

1. In the **CloudWatch** panel, click the ellipsis and select **Update**.

1. Update the **Role ARN**, **Target Region**, and **Log Group Name** fields and click **Create**. The integration will be redeployed.

### Deactivate

To deactivate the integration:

1. In the **CloudWatch** panel, click the ellipsis and select **Deactivate integration**.

1. When disabled, the **Integration status** in the panel will show as `Inactive`.

## Access the DB Console

For CockroachDB {{ site.data.products.advanced }} clusters, to access the DB Console:

1. On the cluster's **Tools** page, click **Open DB Console** in the **DB Console** panel.

    You can also access the DB Console by navigating to `https://admin-{cluster-name}crdb.io:8080/#/metrics/overview/cluster`. Replace the `{cluster-name}` placeholder with the name of your cluster.

1. Log in with your [SQL username]({% link "cockroachcloud/managing-access.md" %}) and password.

{{site.data.alerts.callout_info}}
For details on creating additional users that can connect to the cluster and access the DB Console, see [User Management]({% link "cockroachcloud/managing-access.md" %}).
{{site.data.alerts.end}}

## Explore the DB Console

- For an overview of all the areas of the DB Console, see [DB Console Overview]({% link "{{site.current_cloud_version}}/ui-overview.md" %}).
- Be sure to check out the [**Node Map**]({% link "{{site.current_cloud_version}}/ui-overview.md" %}), which visualizes the geographic configuration of your cluster on a world map and provides real-time cluster metrics, with the ability to drill down to individual nodes. This Enterprise feature has been pre-configured and enabled for you.

{{site.data.alerts.callout_info}}
If you have a single-node cluster, you may see a warning that you have under-replicated ranges. This is expected because the default replication factor is set to 3, and you can only have one [replica]({% link "{{site.current_cloud_version}}/architecture/overview.md" %}#architecture-replica) per node. For more information about replication issues, see [Cluster Setup Troubleshooting]({% link "{{site.current_cloud_version}}/cluster-setup-troubleshooting.md" %}#db-console-shows-under-replicated-unavailable-ranges).
{{site.data.alerts.end}}
