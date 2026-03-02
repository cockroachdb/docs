{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

The **Statements** page provides information about the execution of SQL statements in your cluster, using data in the cluster's [`crdb_internal` system catalog]({{ link_prefix }}monitoring-and-alerting.html#crdb_internal-system-catalog).
{%- if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. The **Statements** tab is selected.
{% else %}
To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **SQL Activity** in the **Monitoring** section of the left side navigation. The **Statements** tab is selected.
{% endif %}

It offers two views:

- **Statement Fingerprints** show information about completed SQL statements.
- **Active Executions** show information about SQL statements which are currently executing.

Choose a view by selecting the **Statement Fingerprints** or **Active Executions** radio button. The selection is retained when you switch between the **Statements** and **Transactions** tabs on the **SQL Activity** page.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

## Statement Fingerprints view

The **Statements Fingerprints** view helps you:

- Identify frequently executed or high latency [SQL statements]({{ link_prefix}}sql-statements.html).
- View SQL statement fingerprint [details](#statement-fingerprint-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

{{site.data.alerts.callout_info}}
The **Statements** page displays all SQL statements, including those executed within [user-defined functions]({{ link_prefix}}user-defined-functions.html#statement-statistics) and [stored procedures]({{ link_prefix}}stored-procedures.html#statement-statistics). This allows you to monitor the performance of individual statements within your routines.
{{site.data.alerts.end}}

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the CockroachDB {{ site.data.products.cloud }} Console.
{% endif -%}
The **Statements** tab is selected. The **Statement Fingerprints** radio button is selected and the [Statements table](#statements-table) displays.

The following screenshot shows the statement fingerprint for `SELECT city, id FROM vehicles WHERE city = $1` while running the [`movr` workload]({{ link_prefix}}cockroach-workload.html#run-the-movr-workload):

<img src="{{ 'images/v26.1/statement-fingerprint.png' | relative_url }}" alt="Statement fingerprint" style="border:1px solid #eee;max-width:100%" />

If you click the statement fingerprint in the **Statements** column, the [**Statement Fingerprint** page](#statement-fingerprint-page) displays.

<img src="{{ 'images/v26.1/statement-details.png' | relative_url }}" alt="Statement details" style="border:1px solid #eee;max-width:100%" />

## Active Executions view

The **Active Executions** view helps you:

- Understand and tune workload performance, particularly for long-running statements.

{% if page.cloud != true %}
To display this view, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To display this view, click **SQL Activity** in the left-hand navigation of the CockroachDB {{ site.data.products.cloud }} Console.
{% endif -%}
The **Statements** tab is selected. Click the **Active Executions** radio button. The [Active Executions table](#active-executions-table) displays.

{{site.data.alerts.callout_info}}
When Auto [Refresh](#refresh) is On, active executions are polled every 10 seconds. Faster-running executions will potentially disappear upon each refresh.
{{site.data.alerts.end}}

The following screenshot shows the active statement execution for `INSERT INTO users VALUES ($1, $2, $3, $4, $5)` while running the [`movr` workload]({{ link_prefix }}cockroach-workload.html#run-the-movr-workload):

<img src="{{ 'images/v26.1/statement-execution.png' | relative_url }}" alt="Statement execution" style="border:1px solid #eee;max-width:100%" />

If you click the execution ID in the **Statement Execution ID** column, the [**Statement Execution** details page](#statement-execution-details-page) displays.

<img src="{{ 'images/v26.1/statement-execution-details.png' | relative_url }}" alt="Statement execution details" style="border:1px solid #eee;max-width:100%" />

{% if page.cloud != true %}
{% include {{ page.version.version }}/ui/refresh.md %}
{% else %}
{% include {{ site.current_cloud_version }}/ui/refresh.md %}
{% endif %}
