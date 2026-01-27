---
title: Transaction Diagnostics
summary: Use the built-in function `crdb_internal.request_transaction_bundle` to request a transaction diagnostics bundle for a specified transaction fingerprint ID.
toc: true
---

Transaction diagnostics allow operators and support engineers to investigate issues involving [transactions]({% link {{ page.version.version }}/transactions.md %}) in user workloads. Use the built-in function [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %})`.request_transaction_bundle` to request a transaction diagnostics bundle for a specified [transaction fingerprint ID]({% link {{ page.version.version }}/ui-transactions-page.md %}).

{{site.data.alerts.callout_info}}
Requesting a transaction diagnostics bundle introduces performance overhead. This feature is primarily intended for use under the guidance of [Cockroach Labs Support](https://support.cockroachlabs.com/).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Transaction diagnostics do not contain a [statement diagnostic bundle]({% link {{ page.version.version }}/explain-analyze.md %}#debug-option) for statements executed inside [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) or [stored procedures]({% link {{ page.version.version }}/stored-procedures.md %}). However, they do contain a statement diagnostic bundle for the top-level invocation, or call, of the user-defined function or stored procedure.
{{site.data.alerts.end}}

## Required privileges 

To use this function on a [secure cluster]({% link {{ page.version.version }}/secure-a-cluster.md %}), you must be an [`admin` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). If the user has only `VIEWACTIVITYREDACTED`, they can request only redacted bundles.

## Function signature

~~~
crdb_internal.request_transaction_bundle(
  transaction_fingerprint_id: string,
  sampling_probability: float,
  min_execution_latency: interval,
  expires_after: interval,
  redacted: bool
) -> (request_id: int, created: bool)
~~~

## Parameters

- `transaction_fingerprint_id`: A hex-encoded ID of the [transaction fingerprint]({% link {{ page.version.version }}/ui-transactions-page.md %}#transaction_fingerprint) to capture. The fingerprint ID must exist in `crdb_internal.transaction_statistics`, which is the system of record for transaction fingerprints.
- `sampling_probability`: A probability value (between 0 and 1) for sampling whether a transaction bundle should be recorded. If 0 is provided, there is no sampling; the next execution of the transaction will be captured.
- `min_execution_latency`: The minimum execution time required for the transaction to be considered. If `sampling_probability` is non-zero, this value must also be non-zero.
- `expires_after`: The duration for which the request remains active. A value of 0 keeps the request open until fulfilled or canceled.
- `redacted`: Specifies whether the resulting bundle should be redacted.

## Return values

- `request_id`: The ID of the generated request, or `NULL` if the request could not be created.
- `created`: Returns `true` if the request is successfully created, or `false` if the specified fingerprint ID does not exist.

## Troubleshooting example

To troubleshoot with a transaction diagnostics bundle, follow these steps:

1. [Identify the transaction fingerprint ID](#step-1-identify-the-transaction-fingerprint-id) to generate a bundle for.
1. [Create a bundle request](#step-2-create-a-bundle-request) for that fingerprint ID.
1. [Download the bundle](#step-3-download-the-bundle) from [DB Console]({% link {{ page.version.version }}/ui-overview.md %}).
1. [Inspect the bundle](#step-4-inspect-the-bundle).

### Setup

For this example, set the [`application_name`]({% link {{ page.version.version }}/map-sql-activity-to-app.md %}) to enable filtering:

{% include_cached copy-clipboard.html %}
~~~sql
SET application_name = 'cockroachdb_test';
~~~

Run the following explicit transaction, which sleeps for 10 seconds:

{% include_cached copy-clipboard.html %}
~~~sql
BEGIN; SELECT pg_sleep(10), 'cockroachdb_test' ; COMMIT;
~~~

### Step 1. Identify the transaction fingerprint ID

Identify the transaction fingerprint ID of the example transaction by navigating to the [**SQL Activity**]({% link {{ page.version.version }}/ui-overview.md %}#sql-activity) page in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}). On the [**Transactions**]({% link {{ page.version.version }}/ui-transactions-page.md %}) tab, search the Top `500` by `Transaction Time` in the `Past Hour` and click **Apply** to list transactions. Filter the transactions by **Application Name**:  `cockroachdb_test`.

In the **Transactions** column, click the transaction fingerprint `SELECT pg_sleep(_), _` to open the [**Transaction Details**]({% link {{ page.version.version }}/ui-transactions-page.md %}#transaction-details-page) page for that fingerprint.

<img src="/docs/images/{{ page.version.version }}/transaction-diagnostics-1.png" alt="Transactions tab" style="border:0px solid #eee;max-width:100%" />

From the **Transaction Details** page, copy the hexadecimal **Fingerprint ID** for this transaction, `afdd4059a899442e`.

<img src="/docs/images/{{ page.version.version }}/transaction-diagnostics-2.png" alt="Transactions Details page" style="border:0px solid #eee;max-width:100%" />

Note the decimal equivalent of the fingerprint ID in the browser's address bar. In this case, the URL may look like `https://127.0.0.1:29001/#/transaction/12672355680315327534?appNames=cockroachdb_test`. The decimal value of the fingerprint is `12672355680315327534`.

### Step 2. Create a bundle request

Create a transaction diagnostics request to be fulfilled the next time the relevant transaction is executed:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.request_transaction_bundle('afdd4059a899442e', 0, '0', '0', false);
~~~

The parameters to the call to `crdb_internal.request_transaction_bundle()` are:

- `transaction_fingerprint_id`: `'afdd4059a899442e'`, the hexadecimal fingerprint ID from [Step 1](#step-1-identify-the-transaction-fingerprint-id).
- `sampling_probability`: `0`, which disables sampling.
- `min_execution_latency`: `'0'`, which sets no minimum execution time.
- `expires_after`: `'0'`, which keeps the request open until fulfilled or canceled.
- `redacted`: `false`, which does not redact the bundle.

Calling the function will return a `request_id` and a `created` boolean flag. This will create an entry in the `system.transaction_diagnostics_request` table.

~~~sql
> SELECT * FROM crdb_internal.request_transaction_bundle('afdd4059a899442e', 0, '0', '0', false);
      request_id      | created
----------------------+----------
  1113728276333035521 |    t

> SELECT * FROM system.transaction_diagnostics_requests;
          id          | completed | transaction_fingerprint_id | statement_fingerprint_ids | transaction_diagnostics_id |         requested_at          | min_execution_latency |       expires_at       | sampling_probability | redacted | username
----------------------+-----------+----------------------------+---------------------------+----------------------------+-------------------------------+-----------------------+------------------------+----------------------+----------+------------
  1113386248552742913 |     t     | \xafdd4059a899442e         | {"\\x00befd152e98f3f1"}   |        1113386693458034689 | 2025-10-07 14:42:18.234632+00 | NULL                  | NULL                   |                 NULL |    f     | roachprod
~~~

In the DB Console, go to [**Advanced Debug**]({% link {{ page.version.version }}/ui-debug-pages.md %}) > [**Diagnostics History**]({% link {{ page.version.version }}/ui-debug-pages.md %}#diagnostics-history). Under the **Transactions** tab, there will be a row for the bundle request. You could also use the URL `https://{host}:{port}/#/reports/diagnosticshistory?tab=Transactions`. The page initially displays the following information:

- The date and time the request was **Activated on**.
- `Transaction 12672355680315327534` (the decimal form of the transaction fingerprint ID from [Step 1](#step-1-identify-the-transaction-fingerprint-id)).
- A **Status** of `WAITING`.
- A button to **Cancel request** (Use this if a transaction diagnostics bundle is no longer needed).

<img src="/docs/images/{{ page.version.version }}/transaction-diagnostics-3.png" alt="Diagnostics History, Transactions, Status Waiting" style="border:0px solid #eee;max-width:100%" />

### Step 3. Download the bundle

To fulfill the request, run the explicit transaction again. Note that the constant values in the transaction do not have to exactly match the original run. In the second execution of the transaction, the number of seconds differs from the original `10` and the string differs from the original `'cockroachdb_test'`.

{% include_cached copy-clipboard.html %}
~~~sql
BEGIN; SELECT pg_sleep(12), 'cockroachdb_test_2' ; COMMIT;
~~~

Navigate to the [**Advanced Debug**]({% link {{ page.version.version }}/ui-debug-pages.md %}) > [**Diagnostics History**]({% link {{ page.version.version }}/ui-debug-pages.md %}#diagnostics-history) page in the DB Console. Under the **Transactions** tab, the row for the bundle request now shows:

- The date and time the request was **Activated on**.
- The statements for the transaction fingerprint.
- A **Status** of `READY`.
- A **Bundle.zip** link.

<img src="/docs/images/{{ page.version.version }}/transaction-diagnostics-4.png" alt="Diagnostics History, Transactions, Status Ready" style="border:0px solid #eee;max-width:100%" />

Click the **Bundle.zip** link to download the completed bundle, which will be named `txn-bundle-1113386693458034689.zip` using the `transaction_diagnostics_id` from the `system.transaction_diagnostics_requests` table.

### Step 4. Inspect the bundle

Unzip the transaction diagnostic bundle and examine its contents. It contains [statement diagnostic bundle]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) `zip` files for each statement as well as a `zip` file of the transaction traces: 

```
1-SELECT.zip
2-COMMIT.zip
transaction-1113386693458034689.zip
```

Unzip the `zip` file `transaction-1113386693458034689.zip`. It consists of transaction traces in various formats (including a JSON file that can be [imported to Jaeger]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#visualize-statement-traces-in-jaeger)):

```
trace-jaeger.json
trace.json
trace.txt
```

## See also

- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [DB Console Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %})
- [DB Console Statements page, Diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics)
- [`cockroach statement-diag`]({% link {{ page.version.version }}/cockroach-statement-diag.md %})
- [Identify slow queries]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#identify-slow-queries)
- [Visualize statement traces in Jaeger]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#visualize-statement-traces-in-jaeger)
- [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %})