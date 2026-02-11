{{site.data.alerts.callout_info}}
Validation of full-cluster restores with `schema_only` must be run on an empty cluster in the same way as a complete [full-cluster restore]({% link {{ page.version.version }}/restore.md %}#full-cluster). Once you have successfully validated the restore, you can destroy the test cluster.
{{site.data.alerts.end}}