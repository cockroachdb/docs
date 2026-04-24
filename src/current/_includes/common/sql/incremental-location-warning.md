{{site.data.alerts.callout_danger}}
**Removed in v26.2**: The `incremental_location` option has been removed in v26.2, following its prior [deprecation]({% link releases/v25.4.md %}#v25-4-0-deprecations). Existing backups taken with this option cannot be restored in v26.2 or later. If you have backups that use `incremental_location`, you can only restore them using a cluster running v26.1 or earlier.
{{site.data.alerts.end}}
