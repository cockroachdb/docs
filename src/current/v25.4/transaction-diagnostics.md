---
title: Transaction Diagnostics
summary: Use the built-in function `crdb_internal.request_transaction_bundle` to request a transaction diagnostics bundle for a specified transaction fingerprint ID.
toc: true
---

Transaction diagnostics enable support engineers to investigate issues involving [transactions]({% link {{ page.version.version }}/transactions.md %}) in user workloads. Use the built-in function, `crdb_internal.request_transaction_bundle`, to request a transaction diagnostics bundle for a specified [transaction fingerprint ID]({% link {{ page.version.version }}/ui-transactions-page.md %}).

{{site.data.alerts.callout_info}}
Transaction diagnostics introduces a performance overhead. This feature is primarily intended for use under the guidance of [Cockroach Labs Support](https://support.cockroachlabs.com/).
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

- `transaction_fingerprint_id`: A hex-encoded ID of the transaction fingerprint to capture. The fingerprint ID must exist in `crdb_internal.transaction_statistics`, which is the system of record for transaction fingerprints.
- `sampling_probability`: A probability value (between 0 and 1) for sampling whether a transaction bundle should be recorded.
- `min_execution_latency`: The minimum execution time required for the transaction to be considered. If `sampling_probability` is non-zero, this value must also be non-zero.
- `expires_after`: The duration for which the request remains active. A value of 0 keeps the request open until fulfilled or deleted.
- `redacted`: Specifies whether the resulting bundle should be redacted.

## Return values

- `request_id`: The ID of the generated request, or `NULL` if the request could not be created.
- `created`: Returns `true` if the request is successfully created, or `false` if the specified fingerprint ID does not exist.

## Troubleshooting example

To troubleshoot with transaction diagnostics bundles, follow these steps:

1. [Identify the transaction fingerprint ID](#step-1-identify-the-transaction-fingerprint-id) to generate a bundle for.
1. [Create a bundle request](#step-2-create-a-bundle-request) for that fingerprint ID.
1. [Download the bundle](#step-3-download-the-bundle) from DB Console.
1. [Inspect the bundle](#step-4-inspect-the-bundle).

### Setup

For this example, set the `application_name` to enable filtering:

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

Identify the transaction fingerprint ID of the example transaction by navigating to the **SQL Activity** page in the DB Console. On the **Transactions** tab, search the Top `500` by `Transaction Time` in the `Past Hour` and click **Apply** to list transactions. Filter the transactions by **Application Name**:  `cockroachdb_test`.

In the **Transactions** column, click the transaction fingerprint `SELECT pg_sleep(_), _` to open the **Transaction Details** page for that fingerprint.

<img src="{{ 'images/v25.4/transaction-diagnostics-1.png' | relative_url }}" alt="Transactions tab" style="border:0px solid #eee;max-width:100%" />

On the **Transaction Details** page, copy the hexadecimal **Fingerprint ID** for this transaction, `afdd4059a899442e`.

<img src="{{ 'images/v25.4/transaction-diagnostics-2.png' | relative_url }}" alt="Transactions Details page" style="border:0px solid #eee;max-width:100%" />

Note the decimal equivalent of the fingerprint ID in the browser's address bar. In this case, the URL may look like `https://127.0.0.1:29001/#/transaction/12672355680315327534?appNames=cockroachdb_test`. The decimal value of the fingerprint is `12672355680315327534`.

### Step 2. Create a bundle request

Create a transaction diagnostics request to be fulfilled the next time the relevant transaction is executed:

{% include_cached copy-clipboard.html %}
~~~sql
select * from crdb_internal.request_transaction_bundle('afdd4059a899442e', 0, '0', '0', false);
~~~

where

- `transaction_fingerprint_id`: 'afdd4059a899442e', the hexadecimal fingerprint ID from Step 1.
- `sampling_probability`: `0`, which disables sampling.
- `min_execution_latency`: `'0'`, which sets no minimum execution time.
- `expires_after`: `'0'`, which keeps the request open until fulfilled or canceled.
- `redacted`: `false`, which does not redact the bundle.

 In the DB Console, go to **Advanced Debug** > **Diagnostics History**. Under the **Transactions** tab, there will be a row for the bundle request. It should display the following information:

- the date and time the request was **Activated on**
- `Transaction 12672355680315327534` (the decimal form of the fingerprint ID)
- a **Status** of `WAITING`
- a button to **Cancel request**

<img src="{{ 'images/v25.4/transaction-diagnostics-3.png' | relative_url }}" alt="Diagnostics History, Transactions, Status Waiting" style="border:0px solid #eee;max-width:100%" />

### Step 3. Download the bundle

To fulfill the request, run the explicit transaction again. Note that the values in the transaction do not have to exactly match. (In the second execution of the transaction, the number of seconds could differ from `10` and the string could differ from `'cockroachdb_test'.)

{% include_cached copy-clipboard.html %}
~~~sql
BEGIN; SELECT pg_sleep(10), 'cockroachdb_test' ; COMMIT;
~~~

Navigate to the **Advanced Debug** > **Diagnostics History** page in the DB Console. Under the **Transactions** tab, the row for the bundle request should now show:

- the date and time the request was **Activated on**
- the statements for the transaction fingerprint
- a **Status** of `READY`
- a **Bundle.zip** link

<img src="{{ 'images/v25.4/transaction-diagnostics-4.png' | relative_url }}" alt="Diagnostics History, Transactions, Status Ready" style="border:0px solid #eee;max-width:100%" />

Click the **Bundle.zip** link to download the completed bundle, which will be named `txn-bundle-1113386693458034689.zip` using the `transaction_diagnostics_id` from the `system.transaction_diagnostics_requests` table.

### Step 4. Inspect the bundle

Unzip the transaction diagnostic bundle and examine its contents. It should contain statement diagnostic bundle `zip` files for each statement as well as a `zip` file of the transaction traces: 

```
1-SELECT.zip
2-COMMIT.zip
transaction-1113386693458034689.zip
```

Unzip the `zip` file of the transaction traces, `transaction-1113386693458034689.zip`. It should contain traces in different formats:

```
trace-jaeger.json
trace.json
trace.txt
```

You can use jaeger analyze `trace-jaeger.json`.

## See also

- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [DB Console Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %})
- [DB Console Statements page, Diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics)
- [`cockroach statement-diag`]({% link {{ page.version.version }}/cockroach-statement-diag.md %})
- [Identify slow queries]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#identify-slow-queries)

