{{site.data.alerts.callout_info}}
Log channels cannot be completely disabled. You can configure [how log messages are routed to different sinks]({% link {{ page.version.version }}/configure-logs.md %}#configure-log-sinks) and [adjust verbosity levels]({% link {{ page.version.version }}/configure-logs.md %}#set-logging-levels), but you cannot turn off a log channel entirely. For example, a channel that **is not explicitly configured** for a [file group]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files) **is enabled** in the `default` file group.
{{site.data.alerts.end}}
