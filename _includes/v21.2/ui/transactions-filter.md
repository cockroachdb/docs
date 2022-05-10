{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

### Date range

To search by date, click the date range selector and pick a date range that is within the time period. Click **reset time** to reset the date to the last hour.

It's possible to select a date range for which no transaction statistics exist. CockroachDB persists transaction statistics up to 1 million rows before the oldest row is deleted. The retention period of statistics is reduced the more active a workload is and the more distinct transaction fingerprints there are.

### Filter

To filter the transactions by [`application_name`]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and choose one or more applications. When no application is selected internal transactions **are not** displayed.

{{site.data.alerts.callout_info}}
- Internal transactions are displayed under the `$ internal` app.
- Transactions from the SQL shell are displayed under the `$ cockroach` app.
- If you haven't set `application_name` in a client connection string, it appears as `unset`.
{{site.data.alerts.end}}

To filter transactions in which a SQL statement fingerprint exceeds a specified latency value, fill in the fields in **Query fingerprint runs longer than**.

The following screenshot shows the transactions that contain the string `rides` for the `movr` application:

<img src="{{ 'images/v21.2/movr-transactions-rides.png' | relative_url }}" alt="Movr rides transactions" style="border:1px solid #eee;max-width:80%" />
