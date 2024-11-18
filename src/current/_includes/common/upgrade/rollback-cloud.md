To roll back an CockroachDB {{ site.data.products.advanced }} cluster to the previous major version before the upgrade is finalized automatically:

1. Click the cluster's name to open the **Cluster Details** page.
1. At the top of the page, click **Roll back**.

   A CockroachDB {{ site.data.products.standard }} cluster remains fully available while it is rolled back. For a multi-node CockroachDB {{ site.data.products.advanced }} cluster, nodes are rolled back one at a time in a rolling fashion so the cluster remains available, with one node unavailable at a time. A single-node CockroachDB {{ site.data.products.advanced }} cluster will be unavailable while the cluster is rolled back and restarted.

{{site.data.alerts.callout_info}}
Rolling back a major-version upgrade is not supported on {{ site.data.products.basic }}.
{{site.data.alerts.end}}
