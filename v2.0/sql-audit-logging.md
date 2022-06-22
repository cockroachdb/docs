---
title: SQL Audit Logging
summary: Use the EXPERIMENTAL_AUDIT setting to turn SQL audit logging on or off for a table.
toc: true
---

SQL audit logging gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

This page has an example showing:

- How to turn audit logging on and off.
- Where the audit log files live.
- What the audit log files look like.

For reference material, including a detailed description of the audit log file format, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).

{% include {{ page.version.version }}/misc/experimental-warning.md %}


## Step 1. Create sample tables

Use the statements below to create:

- A `customers` table which contains PII such as name, address, etc.
- An `orders` table with a foreign key into `customers`, which does not expose any PII

Later, we'll show how to turn on audit logs for the `customers` table.

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

{{site.data.alerts.callout_info}}
To turn on auditing for more than one table, issue a separate `ALTER` statement for each table.
{{site.data.alerts.end}}

## Step 3. Populate the `customers` table

Now that we have auditing turned on, let's add some customer data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (name, address, national_id, telephone, email) VALUES (
    'Pritchard M. Cleveland',
    '23 Crooked Lane, Garden City, NY USA 11536',
    778124477,
    12125552000,
    'pritchmeister@aol.com'
);
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~

~~~
+--------------------------------------+----------------------------------+------------------------------------------------+-------------+-------------+-----------------------+
|                  id                  |               name               |                    address                     | national_id |  telephone  |         email         |
+--------------------------------------+----------------------------------+------------------------------------------------+-------------+-------------+-----------------------+
| 4bd266fc-0b62-4cc4-8c51-6997675884cd | Vainglorious K. Snerptwiddle III | 44 Straight Narrows, Garden City, NY USA 11536 |   899127890 | 16465552000 | snerp@snerpy.net      |
| 988f54f0-b4a5-439b-a1f7-284358633250 | Pritchard M. Cleveland           | 23 Crooked Lane, Garden City, NY USA 11536     |   778124477 | 12125552000 | pritchmeister@aol.com |
+--------------------------------------+----------------------------------+------------------------------------------------+-------------+-------------+-----------------------+
(2 rows)
~~~

## Step 4. Check the audit log

By default, the active audit log file is named `cockroach-sql-audit.log` and is stored in CockroachDB's standard log directory.  To store the audit log files in a specific directory, pass the `--sql-audit-dir` flag to [`cockroach start`](start-a-node.html).  Like the other log files, it's rotated according to the `--log-file-max-size` setting.

When we look at the audit log for this example, we see the following lines showing every command we've run so far, as expected.

~~~
I180321 20:54:21.381565 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 2 exec "cockroach sql" {"customers"[76]:READWRITE} "ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE" {} 4.811 0 OK
I180321 20:54:26.315985 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 3 exec "cockroach sql" {"customers"[76]:READWRITE} "INSERT INTO customers(\"name\", address, national_id, telephone, email) VALUES ('Pritchard M. Cleveland', '23 Crooked Lane, Garden City, NY USA 11536', 778124477, 12125552000, 'pritchmeister@aol.com')" {} 6.319 1 OK
I180321 20:54:30.080592 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 4 exec "cockroach sql" {"customers"[76]:READWRITE} "INSERT INTO customers(\"name\", address, national_id, telephone, email) VALUES ('Vainglorious K. Snerptwiddle III', '44 Straight Narrows, Garden City, NY USA 11536', 899127890, 16465552000, 'snerp@snerpy.net')" {} 2.809 1 OK
I180321 20:54:39.377395 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 5 exec "cockroach sql" {"customers"[76]:READ} "SELECT * FROM customers" {} 1.236 2 OK
~~~

{{site.data.alerts.callout_info}}
For reference documentation of the audit log file format, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).
{{site.data.alerts.end}}

## Step 5. Populate the `orders` table

Unlike the `customers` table, `orders` doesn't have any PII, just a Product ID and a delivery status. (Note the use of the [`CHECK` constraint](check.html) as a workaround for the as-yet-unimplemented `ENUM` - see [SQL feature support](sql-feature-support.html) for more information.)

Let's populate the `orders` table with some placeholder data using [`CREATE SEQUENCE`](create-sequence.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE product_ids_asc START 1 INCREMENT 1;
~~~

Evaluate the below a few times to generate data; note that this would error if [`SELECT`](select-clause.html) returned multiple results, but it doesn't in this case.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (product_id, delivery_status, customer_id) VALUES (
    nextval('product_ids_asc'),
    'processing',
    (SELECT id FROM customers WHERE name ~ 'Cleve')
);
~~~

Let's verify that our orders were added successfully:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders ORDER BY product_id;
~~~

~~~
+--------------------------------------+------------+-----------------+--------------------------------------+
|                  id                  | product_id | delivery_status |             customer_id              |
+--------------------------------------+------------+-----------------+--------------------------------------+
| 6e85c390-3bbf-48da-9c2f-a73a0ab9c2ce |          1 | processing      | df053c68-fcb0-4a80-ad25-fef9d3b408ca |
| e93cdaee-d5eb-428c-bc1b-a7367f334f99 |          2 | processing      | df053c68-fcb0-4a80-ad25-fef9d3b408ca |
| f05a1b0f-5847-424d-b8c8-07faa6b6e46b |          3 | processing      | df053c68-fcb0-4a80-ad25-fef9d3b408ca |
| 86f619d6-9f18-4c84-8ead-68cd07a1ee37 |          4 | processing      | df053c68-fcb0-4a80-ad25-fef9d3b408ca |
| 882c0fc8-64e7-4fab-959d-a4ff74f170c0 |          5 | processing      | df053c68-fcb0-4a80-ad25-fef9d3b408ca |
+--------------------------------------+------------+-----------------+--------------------------------------+
(5 rows)
~~~

## Step 6. Check the audit log again

Because we used a `SELECT` against the `customers` table to generate the placeholder data for `orders`, those queries will also show up in the audit log as follows:

~~~
I180321 21:01:59.677273 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 7 exec "cockroach sql" {"customers"[76]:READ, "customers"[76]:READ} "INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE \"name\" ~ 'Cleve'))" {} 5.183 1 OK
I180321 21:04:07.497555 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 8 exec "cockroach sql" {"customers"[76]:READ, "customers"[76]:READ} "INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE \"name\" ~ 'Cleve'))" {} 5.219 1 OK
I180321 21:04:08.730379 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 9 exec "cockroach sql" {"customers"[76]:READ, "customers"[76]:READ} "INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE \"name\" ~ 'Cleve'))" {} 5.392 1 OK
~~~

{{site.data.alerts.callout_info}}
For reference documentation of the audit log file format, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).
{{site.data.alerts.end}}

## See Also

- [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html)
- [`cockroach start` logging flags](start-a-node.html#logging)
- [SQL FAQ - generating unique row IDs](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
- [`CREATE SEQUENCE`](create-sequence.html)
- [SQL Feature Support](sql-feature-support.html)
