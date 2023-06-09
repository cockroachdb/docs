{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Statement Fingerprints results

The statement fingerprints returned are determined by the selected **Search Criteria**:

1. By default, the **Top** `100` statement fingerprints **By** `% of All Runtime` are returned.
  - To change the number returned, select `25`, `50`, or `500` from the dropdown.
  - To change the column filter, select `Contention Time`, `Execution Count`, `P99 Latency`, or `Statement Time` from the dropdown.
1. Select the [**Time Range**](#time-interval).
1. Click **Apply**.

    The list of statements that satisfy the search criteria is displayed. The results can be further [searched and filtered](#search-and-filter).

### Time interval

To view [statement fingerprints](#sql-statement-fingerprints) within a specific time interval, select a time interval from the selector at the top of the tab. The time interval field supports preset time intervals (1 Hour, 6 Hours, 1 Day, etc.) and custom time intervals. To select a custom time interval, click the time interval field and select **Custom time interval**. In the **Start (UTC)** and **End (UTC)** fields select or type a date and time.

Use the arrow buttons to cycle through previous and next time intervals. To select the most recent interval, click **Now**. When you select a time interval, the same interval is selected in the [Metrics]({{ link_prefix }}ui-overview.html#metrics) page.

CockroachDB persists statement statistics up to 1 million rows before the oldest row is deleted. The retention period of statistics is reduced the more active a workload is and the more distinct statement fingerprints there are.

{{site.data.alerts.callout_info}}
It's possible to select an interval for which no statement statistics exist.
{{site.data.alerts.end}}


## Search and filter

By default, the **Statements** page shows SQL statements from all applications and databases running on the cluster.

### Search statements

To search using the search field:

1. Enter a string in the search box at the top of the tab. To search for exact terms in order, wrap the search string in quotes.
1. Press `Enter`.

    The list of statements is filtered by the string.

### Filter

To filter the statements:

1. Click the **Filters** field.
      - To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and select one or more applications.

          - Queries from the SQL shell are displayed under the `$ cockroach` app.
          - If you haven't set `application_name` in a client connection string, it appears as `unset`.
      - To filter by one or more databases (**Database**), SQL statement types (**Statement Type**), or nodes on which the statement ran (**Node**), click the field and select one or more checkboxes.

          The **Statement Type** values map to the CockroachDB statement types [data definition language (DDL)]({{ link_prefix }}sql-statements.html#data-definition-statements), [data manipulation language (DML)]({{ link_prefix }}sql-statements.html#data-manipulation-statements), [data control language (DCL)]({{ link_prefix }}sql-statements.html#data-control-statements), and [transaction control language (TCL)]({{ link_prefix }}sql-statements.html#transaction-control-statements).
      - To display only statement fingerprints that take longer than a specified time to run, specify the time and units.
      - To display only statement fingerprints with queries that cause full table scans, click **Only show statements that contain queries with full table scans**.

1. Click **Apply**.

The following screenshot shows the statements that contain the string `rides` for the `movr` application filtered by `Statement Type: DML`:

<img src="{{ 'images/v22.2/movr-statements-rides.png' | relative_url }}" alt="Movr rides statements" style="border:1px solid #eee;max-width:100%" />
