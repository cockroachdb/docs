{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

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
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $1, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $1, $1)`

It is possible to see the same fingerprint listed multiple times in the following scenarios:

- Statements with this fingerprint were executed by more than one [`application_name`]({{ link_prefix }}show-vars.html#supported-variables).
- Statements with this fingerprint were executed both successfully and unsuccessfully.
