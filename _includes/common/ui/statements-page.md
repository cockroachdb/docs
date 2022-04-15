{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Search and filter

By default, the Statements page shows SQL statements from all applications and databases running on the cluster.

### Search field

To search using the search field, type a string over `Search Statements` and press `Enter`. The list of statements is filtered by the string.

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

## Statement statistics

{% include common/ui/statistics.md %}

### Example

See [View historical statement statistics and the sampled logical plan per fingerprint]({{ link_prefix }}crdb-internal.html#view-historical-statement-statistics-and-the-sampled-logical-plan-per-fingerprint).

## SQL statement fingerprints

The Statements page displays SQL statement fingerprints.

A _statement fingerprint_ represents one or more SQL statements by replacing literal values (e.g., numbers and strings) with underscores (`_`). This can help you quickly identify frequently executed SQL statements and their latencies.

For multiple SQL statements to be represented by a fingerprint, they must be identical aside from their literal values:

- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`

The preceding SQL statements have the fingerprint:

`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (_, _, _)`

The following statements cannot be represented by the same fingerprint:

- `INSERT INTO orders(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)`

It is possible to see the same fingerprint listed multiple times in the following scenarios:

- Statements with this fingerprint were executed by more than one [`application_name`]({{ link_prefix }}show-vars.html#supported-variables).
- Statements with this fingerprint were executed both successfully and unsuccessfully.

## Understand the Statements page

Use the Statements page to identify SQL statements that you want to [troubleshoot]({{ link_prefix }}query-behavior-troubleshooting.html). This might include statements that are experiencing high latencies, multiple [retries]({{ link_prefix }}transactions.html#transaction-retries), or execution failures. You can optionally create and retrieve [diagnostics](#diagnostics) for these statements.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

<a id="statement-fingerprint-properties"></a>
