{{site.data.alerts.callout_info}}
{% include_cached new-in.html version="v23.1" %} Enable the `changefeed.new_pubsub_sink_enabled` [cluster setting](cluster-settings.html) to improve the throughput of changefeeds emitting to {% if page.name == "changefeed-sinks.md" %} Pub/Sub sinks. {% else %} [Pub/Sub sinks](changefeed-sinks.html#google-cloud-pub-sub). {% endif %}
{{site.data.alerts.end}}