{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

### Example

See [View historical statement statistics and the sampled logical plan per fingerprint]({{ link_prefix }}crdb-internal.html#view-historical-statement-statistics-and-the-sampled-logical-plan-per-fingerprint).

## SQL statement fingerprints

The **Statements** page displays SQL statement fingerprints.

A _statement fingerprint_ represents one or more SQL statements by replacing literal values (e.g., numbers and strings) and placeholders with underscores (`_`). Lists with only literals or placeholders and similar expressions are shortened to their first item followed by `__more__`.

Fingerprints can help you quickly identify frequently executed SQL statements and their latencies.

For multiple SQL statements to be represented by a fingerprint, they must be identical aside from their literal values and placeholders.

These SQL statements:

- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 300)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)`

have the fingerprint `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (_, __more__)`

The following statements are not represented by the preceding fingerprint:

- `INSERT INTO new_order(product_id, customer_id, transaction_id, item_count) VALUES (380, 11, 11098, 1)`;
- `INSERT INTO new_order(product_id, customer_id, transaction_id, item_count) VALUES (192, 891, 20, 2)`;
- `INSERT INTO new_order(product_id, customer_id, transaction_id, item_count) VALUES (784, 452, 78, 3)`;

Instead, they have the fingerprint `INSERT INTO new_order(product_id, customer_id, transaction_id, item_count) VALUES (_, __more__)`

It is possible to see the same fingerprint listed multiple times when statements with this fingerprint were executed by more than one [`application_name`]({{ link_prefix }}show-vars.html#supported-variables).
