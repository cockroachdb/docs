To finalize a major-version upgrade of CockroachDB {{ site.data.products.advanced }} or CockroachDB {{ site.data.products.standard }} manually:

1. Click the cluster's name to open the **Cluster Details** page.
1. At the top of the page, click **Finalize**.

    When finalization begins, a series of migration jobs run to enable certain types of features and changes in the new major version that cannot be rolled back. These include changes to system schemas, indexes, and descriptors, and enabling certain types of improvements and new features.

    Until the upgrade is finalized, these features and functions will not be available, and the command `SHOW CLUSTER SETTING version` will continue to report the previous major version. Features that are available only after finalization are listed in the release notes for the new major version.

    You can monitor the process of finalization in the CockroachDB {{ site.data.products.cloud }} [Jobs page]({% link cockroachcloud/jobs-page.md %}). Migration jobs have names in the format `{major-version}-{migration-id}`. If a migration job fails or stalls, Cockroach Labs can use the migration ID to help diagnose and troubleshoot the problem. Each major version has a unique set of migration jobs and IDs.

When finalization is complete, the **Cluster List** and **Cluster Details** page report the new version, and you can no longer roll back to the previous major version.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.basic }} clusters are upgraded automatically and finalization is not required.
{{site.data.alerts.end}}
