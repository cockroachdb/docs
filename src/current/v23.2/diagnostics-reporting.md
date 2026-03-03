---
title: Diagnostics Reporting
summary: Learn about the diagnostic details that get shared with CockroachDB and how to opt out of sharing.
toc: true
docs_area: reference.diagnostics_reporting
---

By default, the DB Console and each node of a CockroachDB cluster share usage details with Cockroach Labs. Sensitive data is redacted from this usage information; these details help Cockroach Labs understand and improve how the system behaves in real-world scenarios.

This page summarizes the details that get shared, how to view the details yourself, and how to opt out of sharing.

{{site.data.alerts.callout_success}}
For insights into your cluster's performance and health, use the built-in [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) or a third-party monitoring tool like [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}).
{{site.data.alerts.end}}

## What gets shared

When diagnostics reporting is on, each node of a CockroachDB cluster shares obfuscated usage details on a periodic basis. For more information about what information is shared, refer to [Telemetry Collected by CockroachDB]({% link {{ page.version.version }}/telemetry.md %}).

To view the full diagnostics details that a node reports to Cockroach Labs, use the `http://<node-address>:<http-port>/_status/diagnostics/local` JSON endpoint.

{{site.data.alerts.callout_info}}
In all cases, names and other string values are scrubbed and replaced with underscores. Also, the details that get shared may change over time, but as that happens, we will announce the changes in release notes.
{{site.data.alerts.end}}

## Opt out of diagnostics reporting

{{site.data.alerts.callout_info}}
Diagnostics reporting is required for [**Enterprise Trial** or **Enterprise Free** licenses]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses). Therefore, the cluster setting `diagnostics.reporting.enabled` is ignored on clusters with these licenses. The following opt-out methods apply only to clusters with an [**Enterprise** license]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses).
{{site.data.alerts.end}}

### At cluster initialization

To make sure that absolutely no diagnostic details are shared, you can set the environment variable `COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true` before starting the first node of the cluster. Note that this works only when set before starting the first node of the cluster. Once the cluster is running, you need to use the `SET CLUSTER SETTING` method described below.

### After cluster initialization

To stop sending diagnostic details to Cockroach Labs once a cluster is running, [use the built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}) to execute the following [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement, which switches the `diagnostics.reporting.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `false`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING diagnostics.reporting.enabled = false;
~~~

This change will not be instantaneous, as it must be propagated to other nodes in the cluster.

## Check the state of diagnostics reporting

To check the state of diagnostics reporting, [use the built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}) to execute the following [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~

~~~
  diagnostics.reporting.enabled
+-------------------------------+
              false
(1 row)
~~~

If the setting is `false`, diagnostics reporting is off; if the setting is `true`, diagnostics reporting is on.

## See also

- [Telemetry Collected by CockroachDB]({% link {{ page.version.version }}/telemetry.md %})
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
- [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %})
