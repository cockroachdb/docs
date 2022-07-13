{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

### Time interval

To view [statement fingerprints](#sql-statement-fingerprints) within a specific time interval, click the selector and pick an interval. Use the arrow keys to cycle through previous and next time intervals. When you select a time interval, the same interval is selected in the [Metrics]({{ link_prefix }}ui-overview.html#metrics) page.

It's possible to select an interval for which no statement statistics exist. CockroachDB persists statement statistics up to 1 million rows before the oldest row is deleted. The retention period of statistics is reduced the more active a workload is and the more distinct statement fingerprints there are.

### Filter

To filter the statements:

1. Click the **Filters** field.
      - To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and select one or more applications.

          - Queries from the SQL shell are displayed under the `$ cockroach` app.
          - If you haven't set `application_name` in a client connection string, it appears as `unset`.
      - To filter by one or more databases (**Database**), [SQL statement types]({{ link_prefix }}sqltype.html) (**Statement Type**), or nodes on which the statement ran (**Node**), click the field and select one or more checkboxes.
      - To display only statement fingerprints that take longer than a specified time to run, specify the time and units.
      - To display only statement fingerprints with queries that cause full table scans, click **Only show statements that contain queries with full table scans**.

1. Click **Apply**.

The following screenshot shows the statements that contain the string `rides` for the `movr` application:

<img src="{{ 'images/v22.1/movr-statements-rides.png' | relative_url }}" alt="Movr rides statements" style="border:1px solid #eee;max-width:100%" />
