{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}


## Transaction statistics

{% include common/ui/statistics.md %}

For an example of querying the statistics table, see [Example]({{ page_prefix}}statements-page.html#example).

## Understand the Transactions page

Use the Transactions page to identify transactions that you want to [troubleshoot]({{ link_prefix }}query-behavior-troubleshooting.html), such as transactions that are experiencing high latencies, multiple [retries]({{ link_prefix }}transactions.html#transaction-retries), or execution failures.

{{site.data.alerts.callout_success}}
If you haven't yet executed any transactions in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}
