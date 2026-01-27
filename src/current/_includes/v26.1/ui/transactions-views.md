{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

The **Transactions** page provides information about the execution of SQL transactions in your cluster, using data in the cluster's [`crdb_internal` system catalog]({{ link_prefix }}monitoring-and-alerting.html#crdb_internal-system-catalog).
{%- if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. Click the **Transactions** tab.
{% else %}
To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **SQL Activity** in the **Monitoring** section of the left side navigation. Select the **Transactions** tab.
{% endif %}

It offers two views:

- **Transaction Fingerprints** show information about completed SQL transactions.
- **Active Executions**, show information about SQL transactions which are currently executing.

Choose a view by selecting the **Transaction Fingerprints** or **Active Executions** radio button. The selection is retained when you switch between the **Statements** and **Transactions** tabs on the **SQL Activity** page.

<a id="transaction_fingerprint"></a>
{{site.data.alerts.callout_success}}
In contrast to the [**Statements** page]({{ page_prefix }}statements-page.html), which displays [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints), the **Transactions** page displays _transaction fingerprints_, which are SQL statement fingerprints grouped by [transaction]({{ link_prefix }}transactions.html).
{{site.data.alerts.end}}

## Transaction Fingerprints view

The **Transaction Fingerprints** view helps you:

- Identify frequently [retried]({{ link_prefix }}transactions.html#transaction-retries) transactions.
- [Troubleshoot]({{ link_prefix }}query-behavior-troubleshooting.html) high-latency transactions or execution failures.
- View transaction [details](#transaction-details-page).

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the CockroachDB {{ site.data.products.cloud }} Console.
{% endif -%}
Click the **Transactions** tab. The **Transaction Fingerprints** radio button is selected and the [Transactions table](#transactions-table) displays.

The following screenshot shows the transaction fingerprint for `SELECT city, id FROM vehicles WHERE city = $1` while running the [`movr` workload]({{ link_prefix }}cockroach-workload.html#run-the-movr-workload):

<img src="/docs/images/{{ page.version.version }}/transaction-fingerprint.png" alt="Transaction fingerprint" style="border:1px solid #eee;max-width:100%" />

If you click the transaction fingerprint in the **Transactions** column, the [**Transaction Details** page](#transaction-details-page) displays.

<img src="/docs/images/{{ page.version.version }}/transaction-details.png" alt="Transaction details" style="border:1px solid #eee;max-width:100%" />

## Active Executions view

The **Active Executions** view helps you:

- Understand and tune workload performance, particularly for long-running transactions.

{% if page.cloud != true %}
To display this view, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To display this view, click **SQL Activity** in the left-hand navigation of the CockroachDB {{ site.data.products.cloud }} Console.
{% endif -%}
The **Statements** tab is selected. Click the **Transactions** tab and the **Active Executions** radio button. The [Active Executions table](#active-executions-table) displays.

{{site.data.alerts.callout_info}}
When Auto [Refresh](#refresh) is On, active executions are polled every 10 seconds. Faster-running executions will potentially disappear upon each refresh.
{{site.data.alerts.end}}

The following screenshot shows the active statement execution for `UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $4, $5)` while running the [`movr` workload]({{ link_prefix }}cockroach-workload.html#run-the-movr-workload):

<img src="/docs/images/{{ page.version.version }}/transaction-execution.png" alt="Transaction execution" style="border:1px solid #eee;max-width:100%" />

If you click the execution ID in the **Transaction Execution ID** column, the [**Transaction Execution** details page](#transaction-execution-details-page) displays.

<img src="/docs/images/{{ page.version.version }}/transaction-execution-details.png" alt="Transaction execution details" style="border:1px solid #eee;max-width:100%" />

{% if page.cloud != true %}
{% include {{ page.version.version }}/ui/refresh.md %}
{% else %}
{% include {{ site.current_cloud_version }}/ui/refresh.md %}
{% endif %}
