Before beginning a major-version upgrade:

1. Review the cluster's [Metrics page]({% link "cockroachcloud/metrics.md" %}) to ensure that your cluster's compute and storage capacity is within acceptable values. The cluster must be able to tolerate some increase, in case the new version uses more resources for your workload. If any of these metrics is above healthy limits, consider increasing the cluster's resources before beginning your upgrade.
1. {% dynamic_include site.current_cloud_version, "/backups/recommend-backups-for-upgrade.md" %}
1. Review the [Release Notes for the major version]({% link "cockroachcloud/upgrade-policy.md" %}#currently-supported-versions) to which you plan to upgrade, as well as the release notes for any skipped major version. Pay careful attention to the sections for backward-incompatible changes, deprecations, changes to default cluster settings, and features that are not available until the upgrade is finalized.
