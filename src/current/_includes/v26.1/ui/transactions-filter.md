## Transaction Fingerprints results

The transaction fingerprints returned are determined by the selected **Search Criteria**:

### Search Criteria ###

By default, the **Top** `100` transaction fingerprints **By** `Transaction Time` for the `Past Hour` are returned.

1. To change the number of results returned, select `25`, `50`, `100`, or `500` from the **Top** dropdown. To return a larger number, select `More` and choose an option: `1000`, `5000`, `10000`.
1. To change the sort column, from the **By** dropdown, select a commonly sorted column: `CPU Time`, `Contention Time`, `Execution Count`, or `Transaction Time`. To sort by other columns, select `More` from the dropdown and choose an option: `Max Memory`, `Network`, `Retries`, `Rows Processed`.
{{site.data.alerts.callout_info}}
The `More` options may increase the page loading time and are not generally recommended.
{{site.data.alerts.end}}
1. Select the [**Time Range**](#time-interval).
1. Click **Apply**.

    The list of transactions that satisfy the search criteria is displayed. The results can be further [searched and filtered](#search-and-filter).

{{site.data.alerts.callout_danger}}
Results are not automatically refreshed.

The actual time range of the statistics is displayed at the top right of the results, for example, `Showing aggregated stats from 20:00 to 21:59 (UTC)`. If you select a preset time interval, such as `Past Hour`, be aware that since the statistics displayed are not automatically refreshed, they may become stale. To see the latest statistics, update the **Search Criteria** and apply.

However, it may take up to 10 minutes for the most recent statistics to be included in the aggregated statistics. 10 minutes is the default for the [`sql.stats.flush.interval` cluster setting](#transaction-statistics). For in-memory statistics, directly query the following in-memory table: `crdb_internal.cluster_transaction_statistics`.{% if page.cloud != true %} Alternatively, use the [**Active Executions** view](#active-executions-view).{% endif %}
{{site.data.alerts.end}}

### Time interval

To view transaction fingerprints within a specific time interval, select a time interval from the selector at the top of the tab. The time interval field supports preset time intervals (1 Hour, 6 Hours, 1 Day, etc.) and custom time intervals. To select a custom time interval, click the time interval field and select **Custom time interval**. In the **Start (UTC)** and **End (UTC)** fields select or type a date and time.

Use the arrow buttons to cycle through previous and next time intervals. To select the most recent interval, click **Now**. When you select a time interval, the same interval is selected in the [Metrics]({{ link_prefix }}ui-overview.html#metrics) page.

CockroachDB persists transaction statistics up to 1 million rows before the oldest row is deleted. The retention period of statistics is reduced the more active a workload is and the more distinct statement fingerprints there are.

{{site.data.alerts.callout_info}}
It's possible to select an interval for which no transaction statistics exist.
{{site.data.alerts.end}}

## Search and filter

By default, the **Transactions** page shows transactions from all applications and databases running on the cluster.

{{site.data.alerts.callout_info}}
For the **Transaction Fingerprints** view, the search and filter are applied **after** results are returned based on the [**Search Criteria**](#search-criteria).
{{site.data.alerts.end}}

### Search field

To search using the search field:

1. Enter a string in the search box at the top of the tab. To search for exact terms in order, wrap the search string in quotes.
1. Press `Enter`.

    The list of transactions is filtered by the string.

### Filter

To filter the transactions:

1. Click the **Filters** field.
      - To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and select one or more applications.

          - Queries from the SQL shell are displayed under the `$ cockroach` app.
          - If you haven't set `application_name` in a client connection string, it appears as `unset`.
      - To filter by the nodes on which the transaction ran, click the **Node** field and select one or more checkboxes.
      - To display only statement fingerprints that take longer than a specified time to run, specify the time and units.

1. Click **Apply**.

The following screenshot shows the transactions that contain the string `rides` for the `movr` application filtered by `Runs Longer Than: 300 milliseconds`:

<img src="{{ 'images/v26.1/movr-transactions-rides.png' | relative_url }}" alt="Movr rides transactions" style="border:1px solid #eee;max-width:100%" />
