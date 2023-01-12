{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

### Date range

To search by date, click the date range selector and pick a date range that is within the time period. Click **reset time** to reset the date to the last hour.

It's possible to select a date range for which no statement statistics exist. CockroachDB persists statement statistics up to 1 million rows before the oldest row is deleted. The retention period of statistics is reduced the more active a workload is and the more distinct statement fingerprints there are.

### Filter

To filter the statements, click the **Filters** field.

To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and choose one or more applications. When no application is selected internal statements **are not** displayed.

{{site.data.alerts.callout_info}}
- Queries from the SQL shell are displayed under the `$ cockroach` app.
- If you haven't set `application_name` in a client connection string, it appears as `unset`.
{{site.data.alerts.end}}

You can also filter by one or more databases (**Database**), SQL statement types (**Statement Type**), and for [statement fingerprints](#sql-statement-fingerprints) that take longer than a specified time to run. To display only statements with queries that cause full table scans, click **Only show statements that contain queries with full table scans**.

The following screenshot shows the statements that contain the string `rides` for the `movr` application:

<img src="{{ 'images/v21.2/movr-statements-rides.png' | relative_url }}" alt="Movr rides statements" style="border:1px solid #eee;max-width:80%" />
