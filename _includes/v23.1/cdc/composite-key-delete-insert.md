{{site.data.alerts.callout_info}}
When changes happen to a column that is part of a composite [key](primary-key.html), the changefeed will produce a {% if page.name == "cdc-queries.md" %}[delete message](#filter-delete-messages) {% else %}[delete message](changefeed-messages.html#delete-messages) {% endif %} and then an insert message.
{{site.data.alerts.end}}