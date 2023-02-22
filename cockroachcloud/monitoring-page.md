---
title: Monitoring Page
summary: How to use the Monitoring page to enable monitoring with Datadog and access the DB Console.
toc: true
docs_area: manage
---

The **Monitoring** page is accessible on {{ site.data.products.dedicated }} clusters. This page allows you to:

- Set up cluster [monitoring with Datadog](#monitor-cockroachdb-dedicated-with-datadog).
- Access the cluster's [built-in DB Console](#access-the-db-console) to view time-series data on SQL queries, troubleshoot query performance, view a list of jobs, and more.

To view this page, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and click **Tools** in the **Monitoring** section of the left side navigation.

## Monitor {{ site.data.products.dedicated }} with Datadog

The [{{ site.data.products.dedicated }} integration for Datadog](https://docs.datadoghq.com/integrations/cockroachdb_dedicated/) enables data collection and alerting on a [subset of CockroachDB metrics](#available-metrics) available at the [Prometheus endpoint](../{{site.current_cloud_version}}/monitoring-and-alerting.html#prometheus-endpoint), using the Datadog platform.

To set up Datadog monitoring with {{ site.data.products.dedicated }}, your Datadog account must be associated with a [Datadog organization](https://docs.datadoghq.com/account_management/#organizations).

{{site.data.alerts.callout_success}}
Enabling the Datadog integration on your {{ site.data.products.dedicated }} cluster will apply additional charges to your **Datadog** bill. Your {{ site.data.products.dedicated }} bill is unchanged.
{{site.data.alerts.end}}

For more information about using Datadog, see the [Datadog documentation](https://docs.datadoghq.com/).

### Enable integration

To enable Datadog monitoring for a {{ site.data.products.dedicated }} cluster:

1. On the cluster's **Monitoring** page, click **Setup** in the **Datadog** panel.

1. Fill in the **API key** and **Datadog Site** fields with their corresponding values.
    - The **API key** is associated with your Datadog organization. If you don't have an API key to use with your {{ site.data.products.dedicated }} cluster, you need to create one. For instructions, see the [Datadog documentation](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).
    - Your **Datadog Site** corresponds to your Datadog Site URL. For more details, see the [Datadog documentation](https://docs.datadoghq.com/getting_started/site/).

1. Click **Create**. Depending on the size of your cluster and the current load on the system, the integration might take some time to become enabled.

1. Once it is registered on Datadog, the cluster will appear on your Datadog [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/). This can take up to several minutes.

### Verify integration status

Once enabled, the **Integration status** in the **Datadog** panel on the **Monitoring** page will show as `Active`.

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

Open your Datadog [Dashboard List](https://docs.datadoghq.com/dashboards/#dashboard-list) and click `CockroachDB Dedicated Overview`. This sample dashboard presents a high-level view of SQL performance and latency, and information about resource consumption to help aid in capacity planning. It provides the ability to drill down to specific nodes (identified by a `(node, region)` tag pair) within your cluster.

To create your own {{ site.data.products.dedicated }} dashboard, you can either [clone](https://docs.datadoghq.com/dashboards/#clone-dashboard) the default `CockroachDB Dedicated Overview` dashboard and edit the widgets, or [create a new dashboard](https://docs.datadoghq.com/dashboards/#new-dashboard).

The [available metrics](#available-metrics) are drawn directly from the CockroachDB [Prometheus endpoint](../{{site.current_cloud_version}}/monitoring-and-alerting.html#prometheus-endpoint) and are intended for use as building blocks for your own charts.

{{site.data.alerts.callout_info}}
Metric values and time-series graphs in Datadog are not guaranteed to match those in the [DB Console](#access-the-db-console), due to differences in how CockroachDB and Datadog calculate and display metrics.
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
- Use the [Metrics Explorer](https://docs.datadoghq.com/metrics/explorer/) to search for and view `crdb_dedicated` metrics.

See [Metrics](../{{site.current_cloud_version}}/metrics.html) for the full list of metrics available in CockroachDB.

### Monitor health of metrics export

To monitor the health of metrics export, we recommend that you [create a new Monitor](https://docs.datadoghq.com/monitors/create/types/metric/?tab=threshold).

Select **Threshold Alert** as the detection method, which configures an alert that is sent when a supported metric reaches a given threshold. For descriptions of some useful CockroachDB alerts, see [Monitoring and Alerting](../{{site.current_cloud_version}}/monitoring-and-alerting.html#events-to-alert-on).

- To **Define the metric**:

    - Select the `otel.datadog_exporter.metrics.running` metric.

    - Export the metric **from** your {{ site.data.products.dedicated }} cluster (the cluster name in the [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/)).

- To **Set alert conditions**:

    - Trigger when the metric is `below` the threshold `on average` during the last `15 minutes`.

    - Set **Alert threshold** to `1`.

    - `Notify` if data is missing for more than `15` minutes.

This monitor will notify your organization if Datadog is no longer receiving data from your {{ site.data.products.dedicated }} cluster.

### Update integration

To update the metadata associated with the integration (for example, to rotate API keys):

1. In the **Datadog** panel, click the ellipsis and select **Update**.

1. Update the **API key** and **Datadog Site** fields and click **Create**. The integration will be redeployed.

### Deactivate integration

To deactivate the integration:

1. In the **Datadog** panel, click the ellipsis and select **Deactivate integration**.

1. When disabled, the **Integration status** in the panel will show as `Inactive`.

After deactivating an integration, the metrics data will remain in Datadog for a default [retention period](https://docs.datadoghq.com/developers/guide/data-collection-resolution-retention/).

## Access the DB Console

To access the DB Console:

1. On the cluster's **Monitoring** page, click **Open DB Console** in the **DB Console** panel.

    You can also access the DB Console by navigating to `https://<cluster-name>crdb.io:8080/#/metrics/overview/cluster`. Replace the `<cluster-name>` placeholder with the name of your cluster.

1. Log in with your [SQL username](user-authorization.html) and password.

{{site.data.alerts.callout_info}}
For details on creating additional users that can connect to the cluster and access the DB Console, see [User Management](user-authorization.html).
{{site.data.alerts.end}}

## Explore the DB Console

- For an overview of all the areas of the DB Console, see [DB Console Overview](../{{site.current_cloud_version}}/ui-overview.html).
- Be sure to check out the [**Node Map**](../{{site.current_cloud_version}}/ui-overview.html), which visualizes the geographic configuration of your cluster on a world map and provides real-time cluster metrics, with the ability to drill down to individual nodes. This Enterprise feature has been pre-configured and enabled for you.

{{site.data.alerts.callout_info}}
If you have a single-node cluster, you may see a warning that you have under-replicated ranges. This is expected because the default replication factor is set to 3, and you can only have one [replica](../{{site.current_cloud_version}}/architecture/overview.html#architecture-replica) per node. For more information about replication issues, see [Cluster Setup Troubleshooting](../{{site.current_cloud_version}}/cluster-setup-troubleshooting.html#db-console-shows-under-replicated-unavailable-ranges).
{{site.data.alerts.end}}
