---
title: Monitor CockroachDB with Kibana
summary: The CockroachDB module for Metricbeat enables data visualization of CockroachDB metrics with Kibana.
toc: true
docs_area: manage
---

[Kibana](https://www.elastic.co/kibana/) is a platform that visualizes data on the [Elastic Stack](https://www.elastic.co/elastic-stack/). This page shows how to use the [CockroachDB module for Metricbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-cockroachdb.html) to collect metrics exposed by your CockroachDB {{ site.data.products.core }} cluster's [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) in Elasticsearch and how to visualize those metrics with Kibana.

{{site.data.alerts.callout_success}}
To export metrics from a CockroachDB {{ site.data.products.cloud }} cluster, refer to [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-metrics.md %}) instead of this page.
{{site.data.alerts.end}}

In this tutorial, you will enable the CockroachDB module for Metricbeat and visualize the data in Kibana.

{{site.data.alerts.callout_success}}
For more information about using the CockroachDB module for Metricbeat, see the [Elastic documentation](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-cockroachdb.html).

If you run into problems with this integration, please file an issue on the [Beats issue tracker](https://github.com/elastic/beats).
{{site.data.alerts.end}}

## Before you begin

Either of the following:

- Hosted [Elasticsearch Service](https://www.elastic.co/guide/en/kibana/current/get-started.html#set-up-on-cloud) with [Metricbeat configured](https://www.elastic.co/guide/en/beats/metricbeat/current/configure-cloud-id.html)
- Self-managed [Elastic Stack](https://www.elastic.co/guide/en/elastic-stack-get-started/current/get-started-elastic-stack.html) with [Metricbeat installed](https://www.elastic.co/guide/en/beats/metricbeat/7.13/metricbeat-installation-configuration.html)

{{site.data.alerts.callout_info}}
This tutorial assumes that you have [started a secure CockroachDB cluster]({% link {{ page.version.version }}/secure-a-cluster.md %}). [CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/index.md %}) does not expose a compatible monitoring endpoint.
{{site.data.alerts.end}}

## Step 1. Enable CockroachDB module

From your Metricbeat installation directory, run:

{% include_cached copy-clipboard.html %}
~~~ shell
./metricbeat modules enable cockroachdb
~~~

### Configure security certificates

Open `modules.d/cockroachdb.yml` in your Metricbeat installation directory.

Follow the steps in the [Elastic documentation](https://www.elastic.co/guide/en/beats/metricbeat/current/configuration-ssl.html) to enable SSL on the CockroachDB module.

For example, if you used [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}) to [secure your cluster]({% link {{ page.version.version }}/secure-a-cluster.md %}#step-1-generate-certificates), the YAML should look like:

~~~ yaml
- module: cockroachdb
  metricsets: ['status']
  period: 10s
  hosts: ['localhost:8080']
  enabled: true
  ssl.verification_mode: full
  ssl.certificate_authorities: "/custom/dir/path/ca.crt"
  ssl.certificate: "/custom/dir/path/client.root.crt"
  ssl.key: "/custom/dir/path/client.root.key"
~~~

`ssl.certificate_authorities`, `ssl.certificate`, and `ssl.key` should specify the full file paths to your CA certificate, client certificate, and client key, respectively.

## Step 2. Start Metricbeat

Load the Kibana dashboards (this may take a few moments):

{% include_cached copy-clipboard.html %}
~~~ shell
./metricbeat setup
~~~

Launch Metricbeat:

{% include_cached copy-clipboard.html %}
~~~ shell
./metricbeat -e
~~~

## Step 3. View CockroachDB dashboards on Kibana

Open the Kibana web interface and click **Dashboard**.

Search for the CockroachDB dashboard:

<img src="{{ 'images/{{ page.version.version }}/kibana-crdb-dashboard-selection.png' | relative_url }}" alt="CockroachDB dashboard selection for Metricbeat" style="border:1px solid #eee;max-width:100%" />

Click the dashboard title to open the dashboard, which presents metrics on replicas and query performance:

<img src="{{ 'images/{{ page.version.version }}/kibana-crdb-dashboard.png' | relative_url }}" alt="CockroachDB Overview dashboard for Metricbeat" style="border:1px solid #eee;max-width:100%" />

## Step 4. Run a sample workload

To test the dashboard functionality, use [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}) to run a sample workload on the cluster.

Initialize the workload for MovR, a fictional vehicle-sharing company:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach workload init movr 'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
~~~

Run the MovR workload for 5 minutes:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach workload run movr --duration=5m 'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
~~~

Click **Refresh**. The query metrics will appear on the dashboard:

<img src="{{ 'images/{{ page.version.version }}/kibana-crdb-dashboard-sql.png' | relative_url }}" alt="CockroachDB Overview dashboard for Metricbeat with SQL metrics" style="border:1px solid #eee;max-width:100%" />

## See also

- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Logging Overview]({% link {{ page.version.version }}/logging-overview.md %})
