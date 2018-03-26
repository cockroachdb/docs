---
title: How to use SQL Audit Logs
summary: Use the `EXPERIMENTAL_AUDIT` setting to turn SQL audit logging on or off for a table.
toc: false
---

You may want to keep SQL audit logs for a number of reasons. For example, you may want to log all queries that are run against a table containing personally identifiable information (hereafter PII).

This page has an example showing:

- How to turn audit logging on and off.
- Where the audit log files live.
- What the audit log files look like.

For reference material, including a detailed description of the audit log file format, see [`EXPERIMENTAL_AUDIT`](sql-audit-logging.html).

<div id="toc"></div>

## Overview

In this example, we'll show how to turn on audit logs for a `customers` table which contains PII such as name, address, etc.  We'll also create an `orders` table with a foreign key into `customers`, which does not expose any PII.

The structure of the tables is as follows:

~~~ sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name STRING NOT NULL,
  address STRING NOT NULL,
  national_id INT NOT NULL,
  telephone INT NOT NULL,
  email STRING UNIQUE NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INT NOT NULL,
  delivery_status STRING check (delivery_status='processing' or delivery_status='in-transit' or delivery_status='delivered') NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers (id)
);
~~~

## Step 1. Turn on auditing for the `customers` table

We turn on auditing for a table using the [`EXPERIMENTAL_AUDIT`](sql-audit-logging.html) subcommand of [`ALTER TABLE`](alter-table.html).

~~~ sql
ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

## Step 2. Populate the `customers` table

Now that we have auditing turned on, let's add some customer data:

~~~ sql
insert into customers (name, address, national_id, telephone, email) values (
  'Pritchard M. Cleveland',
  '23 Crooked Lane, Garden City, NY USA 11536',
  778124477,
  12125552000,
  'pritchmeister@aol.com'
);

insert into customers (name, address, national_id, telephone, email) values (
  'Vainglorious K. Snerptwiddle III',
  '44 Straight Narrows, Garden City, NY USA 11536',
  899127890,
  16465552000,
  'snerp@snerpy.net'
);
~~~

Looks like our customers were added successfully:

~~~
select * from customers;
                  id                  |               name               |                    address                     | national_id |  telephone  |         email
--------------------------------------+----------------------------------+------------------------------------------------+-------------+-------------+-----------------------
 a51b2f7e-3715-433f-b1b1-4b66e8a298a1 | Vainglorious K. Snerptwiddle III | 44 Straight Narrows, Garden City, NY USA 11536 |   899127890 | 16465552000 | snerp@snerpy.net
 d8d765cd-7e3c-4262-9ee1-0ef2582786e0 | Pritchard M. Cleveland           | 23 Crooked Lane, Garden City, NY USA 11536     |   778124477 | 12125552000 | pritchmeister@aol.com
(2 rows)
~~~

## Step 3. Check the audit log

Given the actions we've taken so far, we should expect the audit log to show us the following:

- The `ALTER TABLE` statement (since it was run against the `customers` table)
- The insertions of customer data
- The `SELECT` statement we just ran

By default, the active audit log file is named `cockroach-sql-audit.log` and is stored in CockroachDB's standard log directory.  To store the audit log files in a specific directory, pass the `--sql-audit-dir` flag to [`cockroach start`](start-a-node.html).  Like the other log files, it's rotated according to the `--log-file-max-size` setting.

When we look at the audit log for this example, we see the following lines showing every command we've run so far, as expected.

~~~
I180321 20:54:21.381565 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 2 exec "psql" {"customers"[76]:READWRITE} "ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE" {} 4.811 0 OK
I180321 20:54:26.315985 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 3 exec "psql" {"customers"[76]:READWRITE} "INSERT INTO customers(\"name\", address, national_id, telephone, email) VALUES ('Pritchard M. Cleveland', '23 Crooked Lane, Garden City, NY USA 11536', 778124477, 12125552000, 'pritchmeister@aol.com')" {} 6.319 1 OK
I180321 20:54:30.080592 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 4 exec "psql" {"customers"[76]:READWRITE} "INSERT INTO customers(\"name\", address, national_id, telephone, email) VALUES ('Vainglorious K. Snerptwiddle III', '44 Straight Narrows, Garden City, NY USA 11536', 899127890, 16465552000, 'snerp@snerpy.net')" {} 2.809 1 OK
I180321 20:54:39.377395 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 5 exec "psql" {"customers"[76]:READ} "SELECT * FROM customers" {} 1.236 2 OK
~~~

{{site.data.alerts.callout_info}}
For reference documentation of the audit log file format, see [`EXPERIMENTAL_AUDIT`](sql-audit-logging.html).
{{site.data.alerts.end}}

## Step 4. Populate the `orders` table

Next let's populate the `orders` table, which will have a foreign key into `customers`:

~~~ sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INT NOT NULL,
  delivery_status STRING check (delivery_status='processing' or delivery_status='in-transit' or delivery_status='delivered') NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers (id)
);
~~~

Unlike the `customers` table, `orders` doesn't have any PII, just a Product ID and a delivery status. (Note the use of the [`CHECK` constraint](check.html) as a workaround for the as-yet-unimplemented `ENUM` - see [SQL feature support](sql-feature-support.html) for more information.)

Let's populate the `orders` table with some dummy data using [`CREATE SEQUENCE`](create-sequence.html):

~~~ sql
CREATE SEQUENCE product_ids_asc START 1 INCREMENT 1;

-- Evaluate the below a few times to generate data; note that this
-- would error if SELECT returned multiple results, but it doesn't in
-- this case.

INSERT INTO orders (product_id, delivery_status, customer_id) VALUES (
    nextval('product_ids_asc'),
    'processing',
    (SELECT id FROM customers WHERE name ~ 'Cleve')
);
~~~

We should have an `orders` table that looks something like the following:

~~~
select * from orders order by product_id;
                  id                  | product_id | delivery_status |             customer_id
--------------------------------------+------------+-----------------+--------------------------------------
 263a5967-f9f6-4ad1-b942-b46f42f41ae2 |          2 | processing      | 988f54f0-b4a5-439b-a1f7-284358633250
 b62dcf9e-7f8c-40b8-9583-bcb5e131442b |          3 | processing      | 988f54f0-b4a5-439b-a1f7-284358633250
 b466e8e8-040a-4375-8f1f-eb381d236bc9 |          4 | processing      | 988f54f0-b4a5-439b-a1f7-284358633250
 cd85cfbc-7711-483a-9646-d25661bc38f6 |          5 | processing      | 988f54f0-b4a5-439b-a1f7-284358633250
~~~

## Step 5. Check the audit log again

Because we used a `SELECT` against the `customers` table to generate the dummy data for `orders`, those queries should also show up in the audit log as follows:

~~~
I180321 21:01:59.677273 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 7 exec "psql" {"customers"[76]:READ, "customers"[76]:READ} "INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE \"name\" ~ 'Cleve'))" {} 5.183 1 OK
I180321 21:04:07.497555 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 8 exec "psql" {"customers"[76]:READ, "customers"[76]:READ} "INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE \"name\" ~ 'Cleve'))" {} 5.219 1 OK
I180321 21:04:08.730379 351 sql/exec_log.go:163  [n1,client=127.0.0.1:60754,user=root] 9 exec "psql" {"customers"[76]:READ, "customers"[76]:READ} "INSERT INTO orders(product_id, delivery_status, customer_id) VALUES (nextval('product_ids_asc'), 'processing', (SELECT id FROM customers WHERE \"name\" ~ 'Cleve'))" {} 5.392 1 OK
~~~

{{site.data.alerts.callout_info}}
For reference documentation of the audit log file format, see [`EXPERIMENTAL_AUDIT`](sql-audit-logging.html).
{{site.data.alerts.end}}

## See Also

- [`EXPERIMENTAL_AUDIT`](sql-audit-logging.html)
- [`cockroach start` logging flags](start-a-node.html#logging)
- [SQL FAQ - generating unique row IDs](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
- [`CREATE SEQUENCE`](create-sequence.html)
- [SQL Feature Support](sql-feature-support.html)
