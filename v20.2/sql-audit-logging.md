---
title: SQL Audit Logging
summary: Use the EXPERIMENTAL_AUDIT setting to turn SQL audit logging on or off for a table.
toc: true
---

SQL audit logging gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

This page provides an example of SQL audit logging in CockroachDB, including:

- How to turn audit logging on and off.
- Where the audit log files live.
- What the audit log files look like.

For a detailed description of the audit log file format, see [Audit log file format](experimental-audit.html#audit-log-file-format) on the [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html) reference page.

Note that enabling SQL audit logs can negatively impact performance. As a result, we recommend using SQL audit logs for security purposes only. For more details, see [Performance considerations](experimental-audit.html#performance-considerations), on the [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html) reference page.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

{{site.data.alerts.callout_success}}
To learn about other SQL query logging options, see [SQL logging](query-behavior-troubleshooting.html#sql-logging).
{{site.data.alerts.end}}

## Step 1. Create sample tables

Use the statements below to create:

- A `customers` table which contains PII such as name, address, etc.
- An `orders` table with a foreign key into `customers`, which does not expose any PII

Later, we'll show how to turn on audit logs for the `customers` table.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING NOT NULL,
    address STRING NOT NULL,
    national_id INT NOT NULL,
    telephone INT NOT NULL,
    email STRING UNIQUE NOT NULL
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INT NOT NULL,
    delivery_status STRING check (delivery_status='processing' or delivery_status='in-transit' or delivery_status='delivered') NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers (id)
);
~~~

## Step 2. Turn on auditing for the `customers` table

We turn on auditing for a table using the [`EXPERIMENTAL_AUDIT`](experimental-audit.html) subcommand of [`ALTER TABLE`](alter-table.html).

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

{{site.data.alerts.callout_info}}
To turn on auditing for more than one table, issue a separate `ALTER` statement for each table.
{{site.data.alerts.end}}

## Step 3. Populate the `customers` table

Now that we have auditing turned on, let's add some customer data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (name, address, national_id, telephone, email) VALUES (
    'Pritchard M. Cleveland',
    '23 Crooked Lane, Garden City, NY USA 11536',
    778124477,
    12125552000,
    'pritchmeister@aol.com'
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (name, address, national_id, telephone, email) VALUES (
    'Vainglorious K. Snerptwiddle III',
    '44 Straight Narrows, Garden City, NY USA 11536',
    899127890,
    16465552000,
    'snerp@snerpy.net'
);
~~~

Now let's verify that our customers were added successfully:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~

~~~
                   id                  |               name               |                    address                     | national_id |  telephone  |         email
---------------------------------------+----------------------------------+------------------------------------------------+-------------+-------------+------------------------
  859c6aa1-ae36-49c8-9f12-7a952b4e6915 | Vainglorious K. Snerptwiddle III | 44 Straight Narrows, Garden City, NY USA 11536 |   899127890 | 16465552000 | snerp@snerpy.net
  90810df2-d3c1-4038-8462-132f4df5112b | Pritchard M. Cleveland           | 23 Crooked Lane, Garden City, NY USA 11536     |   778124477 | 12125552000 | pritchmeister@aol.com
(2 rows)
~~~

## Step 4. Check the audit log

By default, the active audit log file is prefixed `cockroach-sql-audit` and is stored in CockroachDB's standard [log directory](debug-and-error-logs.html#write-to-file).  To store the audit log files in a specific directory, pass the `--sql-audit-dir` flag to [`cockroach start`](cockroach-start.html).  Like the other log files, it's rotated according to the [`--log-file-max-size` setting](cockroach-start.html#logging).

When we look at the audit log for this example, we see the following lines showing every command we've run so far, as expected.

~~~
I201028 16:04:36.072075 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 1 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READWRITE}› ‹"ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE"› ‹{}› 4.463 0 ‹OK› 0
I201028 16:04:41.897324 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 2 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READWRITE}› ‹"INSERT INTO customers(name, address, national_id, telephone, email) VALUES ('Pritchard M. Cleveland', '23 Crooked Lane, Garden City, NY USA 11536', 778124477, 12125552000, 'pritchmeister@aol.com')"› ‹{}› 40.326 1 ‹OK› 0
I201028 16:04:45.504038 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 3 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READWRITE}› ‹"INSERT INTO customers(name, address, national_id, telephone, email) VALUES ('Vainglorious K. Snerptwiddle III', '44 Straight Narrows, Garden City, NY USA 11536', 899127890, 16465552000, 'snerp@snerpy.net')"› ‹{}› 11.653 1 ‹OK› 0
I201028 16:04:49.785126 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 4 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READ}› ‹"SELECT * FROM customers"› ‹{}› 0.669 2 ‹OK› 0
~~~

{{site.data.alerts.callout_info}}
For reference documentation of the audit log file format, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/ui/ui-log-files.md %}
{{site.data.alerts.end}}

## Step 5. Populate the `orders` table

Unlike the `customers` table, `orders` doesn't have any PII, just a Product ID and a delivery status.

Let's populate the `orders` table with some placeholder data using [`CREATE SEQUENCE`](create-sequence.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE product_ids_asc START 1 INCREMENT 1;
~~~

Evaluate the below a few times to generate data; note that this would error if [`SELECT`](select-clause.html) returned multiple results, but it doesn't in this case.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (product_id, delivery_status, customer_id) VALUES (
    nextval('product_ids_asc'),
    'processing',
    (SELECT id FROM customers WHERE name ~ 'Cleve')
);
~~~

Let's verify that our orders were added successfully:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders ORDER BY product_id;
~~~

~~~
                   id                  | product_id | delivery_status |             customer_id
---------------------------------------+------------+-----------------+---------------------------------------
  77fa8340-8a65-4ab2-8191-ed87fc049b33 |          1 | processing      | 90810df2-d3c1-4038-8462-132f4df5112b
  36c8b00d-01f0-4956-bb0e-6e9219f49bae |          2 | processing      | 90810df2-d3c1-4038-8462-132f4df5112b
  5eebf961-1e4c-41a4-b6c6-441c3d5ef595 |          3 | processing      | 90810df2-d3c1-4038-8462-132f4df5112b
  2952402e-0cde-438f-a1fb-09e30be26748 |          4 | processing      | 90810df2-d3c1-4038-8462-132f4df5112b
  a9bf61ee-2c8c-4f77-b684-d943e1a46093 |          5 | processing      | 90810df2-d3c1-4038-8462-132f4df5112b
(5 rows)
~~~

## Step 6. Check the audit log again

Because we used a `SELECT` against the `customers` table to generate the placeholder data for `orders`, those queries will also show up in the audit log as follows:

~~~
I201028 16:07:31.632753 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 6 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READ, "customers"[63]:READ}› ‹"INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE name ~ 'Cleve'))"› ‹{}› 30.487 1 ‹OK› 0
I201028 16:07:37.393162 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 7 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READ, "customers"[63]:READ}› ‹"INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE name ~ 'Cleve'))"› ‹{}› 13.479 1 ‹OK› 0
I201028 16:07:38.429564 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 8 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READ, "customers"[63]:READ}› ‹"INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE name ~ 'Cleve'))"› ‹{}› 10.857 1 ‹OK› 0
I201028 16:07:39.476609 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 9 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READ, "customers"[63]:READ}› ‹"INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE name ~ 'Cleve'))"› ‹{}› 14.191 1 ‹OK› 0
I201028 16:07:40.450879 1376 sql/exec_log.go:207 ⋮ [n1,client=‹[::1]:59646›,hostnossl,user=root] 10 ‹exec› ‹"$ cockroach sql"› ‹{"customers"[63]:READ, "customers"[63]:READ}› ‹"INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE name ~ 'Cleve'))"› ‹{}› 14.408 1 ‹OK› 0
~~~

{{site.data.alerts.callout_info}}
For reference documentation of the audit log file format, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/ui/ui-log-files.md %}
{{site.data.alerts.end}}

## See also

- [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html)
- [`cockroach start` logging flags](cockroach-start.html#logging)
- [SQL FAQ - generating unique row IDs](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
- [`CREATE SEQUENCE`](create-sequence.html)
- [SQL Feature Support](sql-feature-support.html)
- [Authentication logs](query-behavior-troubleshooting.html#authentication-logs)
- [Slow query logs](query-behavior-troubleshooting.html#using-the-slow-query-log)
- [SQL logging](query-behavior-troubleshooting.html#sql-logging)
