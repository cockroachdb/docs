---
title: Monitoring Page
summary: How to use the Monitoring page to enable monitoring with Datadog and access the DB Console.
toc: true
docs_area: manage
---

The **Monitoring** page is accessible on {{ site.data.products.dedicated }} clusters. This page allows you to:

- Set up cluster [monitoring with Datadog](#monitor-with-datadog).
- Access the cluster's [built-in DB Console](#access-the-db-console) to view time-series data on SQL queries, troubleshoot query performance, view a list of jobs, and more.

To view the **Monitoring** page, [log in](https://cockroachlabs.cloud/) and click **Monitoring** on the left-hand navigation.

## Monitor with Datadog

The {{ site.data.products.dedicated }} integration for Datadog enables data collection and alerting on a subset of CockroachDB metrics available at the [Prometheus endpoint](../{{site.versions["stable"]}}/monitoring-and-alerting.html#prometheus-endpoint), using the Datadog platform. For details about the available metrics, see the [Datadog documentation](https://docs.datadoghq.com/integrations/cockroach-cloud).

To set up Datadog monitoring with {{ site.data.products.dedicated }}, your Datadog account must be associated with a [Datadog organization](https://docs.datadoghq.com/account_management/#organizations).

{{site.data.alerts.callout_success}}
For more information about using Datadog, see the [Datadog documentation](https://docs.datadoghq.com/).
{{site.data.alerts.end}}

### Enable integration

To enable Datadog monitoring for a {{ site.data.products.dedicated }} cluster:

1. On the cluster's **Monitoring** page, click **Setup** in the **Datadog** panel.

1. Fill in the **API key** and **Datadog Site** fields with their corresponding values.
    - The **API key** is associated with your Datadog organization. If you don't have an API key to use with your {{ site.data.products.dedicated }} cluster, you need to create one. For instructions, see the [Datadog documentation](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).
    - Your **Datadog Site** corresponds to your Datadog Site URL. For more details, see the [Datadog documentation](https://docs.datadoghq.com/getting_started/site/).

1. Click **Create**.  Depending on the size of your cluster and the current load on the system, the integration might take some time to become enabled.

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
- Transient CockroachDB unavailbility. In this case, the integration status will continue to be `Active` but you might experience incomplete metrics exports in Datadog. To resolve the issue, try [deactivating](#deactivate-integration) and reactivating the integration from the **Datadog** panel. If this does not resolve the issue, [contact our support team](https://support.cockroachlabs.com/).

{{site.data.alerts.callout_info}}
Gaps in metrics within Datadog do not necessarily point to an availability issue with CockroachDB. If you encounter any gaps in metrics, we recommend [contacting support](https://support.cockroachlabs.com/).
{{site.data.alerts.end}}

To monitor the health of metrics export, you can [create a custom Monitor](#monitor-health-of-metrics-export) in Datadog. 

### View and configure dashboards

{% comment %}
Open your Datadog [Dashboard List](https://docs.datadoghq.com/dashboards/#dashboard-list) and click `TK`. This sample dashboard presents metrics on TK.

To create your own {{ site.data.products.dedicated }} dashboard, you can either [clone](https://docs.datadoghq.com/dashboards/#clone-dashboard) the default `TK` dashboard and edit the widgets, or [create a new dashboard](https://docs.datadoghq.com/dashboards/#new-dashboard).
{% endcomment %}

To create your own {{ site.data.products.dedicated }} dashboard, see the [Datadog documentation](https://docs.datadoghq.com/dashboards/#new-dashboard).

The [available metrics](https://docs.datadoghq.com/integrations/cockroach-cloud) are drawn directly from the CockroachDB [Prometheus endpoint](../{{site.versions["stable"]}}/monitoring-and-alerting.html#prometheus-endpoint) and are intended for use as building blocks for your own charts.

{{site.data.alerts.callout_info}}
Metric values and time-series graphs in Datadog are not guaranteed to match those in the [DB Console](#access-the-db-console), due to differences in how CockroachDB and Datadog calculate and display metrics.
{{site.data.alerts.end}}

To preview the metrics being collected, you can:

- Click on your cluster's entry in the [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/) to display time-series graphs for each available metric.
- Use the [Metrics Explorer](https://docs.datadoghq.com/metrics/explorer/) to search for and view `crdb_dedicated` metrics.

### Monitor health of metrics export

To monitor the health of metrics export, we recommend that you [create a new Monitor](https://docs.datadoghq.com/monitors/create/types/metric/?tab=threshold).

Select **Threshold Alert** as the detection method, which configures an alert that is sent when a [supported metric](https://docs.datadoghq.com/integrations/cockroach-cloud) reaches a given threshold. For descriptions of some useful CockroachDB alerts, see [Monitoring and Alerting](../{{site.versions["stable"]}}/monitoring-and-alerting.html#events-to-alert-on).

- To **Define the metric**:

    - Select the `otel.datadog_exporter.metrics.running` metric.

    - Export the metric **from** your {{ site.data.products.dedicated }} cluster (the cluster name in the [Infrastructure List](https://docs.datadoghq.com/infrastructure/list/).

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

2. Log in with your [SQL username](user-authorization.html) and password.

{{site.data.alerts.callout_info}}
For details on creating additional users that can connect to the cluster and access the DB Console, see [User Management](user-authorization.html).
{{site.data.alerts.end}}

## Explore the DB Console

- For an overview of all the areas of the DB Console, see [DB Console Overview](../{{site.versions["stable"]}}/ui-overview.html).
- Be sure to check out the [**Node Map**](../{{site.versions["stable"]}}/ui-overview.html), which visualizes the geographic configuration of your cluster on a world map and provides real-time cluster metrics, with the ability to drill down to individual nodes. This Enterprise feature has been pre-configured and enabled for you.

{{site.data.alerts.callout_info}}
If you have a single-node cluster, you may see a warning that you have under-replicated ranges. This is expected because the default replication factor is set to 3, and you can only have one [replica](../{{site.versions["stable"]}}/architecture/overview.html#architecture-replica) per node. For more information about replication issues, see [Cluster Setup Troubleshooting](../{{site.versions["stable"]}}/cluster-setup-troubleshooting.html#db-console-shows-under-replicated-unavailable-ranges).
{{site.data.alerts.end}}