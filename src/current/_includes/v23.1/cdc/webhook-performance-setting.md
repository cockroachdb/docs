{{site.data.alerts.callout_info}}
{% include_cached new-in.html version="v23.1" %} Enable the `changefeed.new_webhook_sink_enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to improve the throughput of changefeeds emitting to {% if page.name == "changefeed-sinks.md" %} webhook sinks. {% else %} [webhook sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink). {% endif %}
{{site.data.alerts.end}}

