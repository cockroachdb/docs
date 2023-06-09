---
title: INTERLEAVE IN PARENT
summary: Interleaving tables improves query performance by optimizing the key-value structure of closely related table's data.
toc: true
toc_not_nested: true
---

{{site.data.alerts.callout_danger}}
`INTERLEAVE IN PARENT` was deprecated in v20.2, disabled by default in v21.1, and permanently removed in v21.2. We do not recommend interleaving tables or indexes in new clusters.

For details, see [Deprecation](#deprecation).
{{site.data.alerts.end}}

## Deprecation

Interleaving tables and indexes was deprecated in CockroachDB v20.2 for the following reasons:

- Scans over tables or indexes with interleaved, child objects (i.e., interleaved tables or indexes) are much slower than scans over tables and indexes with no child objects, as the scans must traverse the parent object and all of its child objects.
- Database schema changes are slower for interleaved objects and their parents than they are for non-interleaved objects and objects with no interleaved children. For example, if you add or remove a column to a parent or child table, CockroachDB must rewrite the entire interleaved hierarchy for that table and its parents/children.
- [Internal benchmarks](https://github.com/cockroachdb/cockroach/issues/53455) have shown the performance benefits of interleaving tables and indexes are limited to a small number of use cases.

In CockroachDB v21.1, interleaving is disabled with the `sql.defaults.interleaved_tables.enabled` [cluster setting](cluster-settings.html) set to `false` by default.

For more details, see the [GitHub tracking issue](https://github.com/cockroachdb/cockroach/issues/52009).

After [upgrading to v21.1](upgrade-cockroach-version.html), we recommend that you do the following:

- [Convert any existing interleaved tables to non-interleaved tables](#convert-interleaved-tables).
- [Replace any existing interleaved secondary indexes with non-interleaved indexes](#replace-interleaved-indexes).

{{site.data.alerts.callout_success}}
Test your [schema changes](online-schema-changes.html) in a non-production environment before implementing them in production.
{{site.data.alerts.end}}

### Convert interleaved tables

To convert an interleaved table to a non-interleaved table, issue an [`ALTER PRIMARY KEY`](alter-primary-key.html) statement on the table, specifying the existing primary key column(s) for the table, and no `INTERLEAVE IN PARENT` clause.

When converting interleaved tables with `ALTER PRIMARY KEY`, note the following:

- CockroachDB executes `ALTER PRIMARY KEY` statements as [online schema changes](online-schema-changes.html). This means that you can convert your interleaved tables to non-interleaved tables without experiencing any downtime.
- `ALTER PRIMARY KEY` statements can only convert a child table if that table is not a parent. If your cluster has child tables that are also parents, you must start from the bottom of the interleaving hierarchy and work your way up (i.e., start with child tables that are not parents).

You can identify interleaved objects by querying the `crdb_internal.interleaved_tables` and `crdb_internal.interleaved_views` system tables.

For example, suppose you created an interleaved hierarchy between the `customers`, `orders`, and `packages` tables, using the following [`CREATE TABLE`](create-table.html) statements:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
   id INT PRIMARY KEY,
   name STRING(50)
 );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
   customer INT,
   id INT,
   total DECIMAL(20, 5),
   PRIMARY KEY (customer, id),
   CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES customers
 ) INTERLEAVE IN PARENT customers (customer);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE packages (
   customer INT,
   "order" INT,
   id INT,
   address STRING(50),
   delivered BOOL,
   delivery_date DATE,
   PRIMARY KEY (customer, "order", id),
   CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES orders
 ) INTERLEAVE IN PARENT orders (customer, "order");
~~~

The `INTERLEAVE IN PARENT` clauses will appear in `SHOW CREATE` statements for the `packages` and `orders` tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE orders;
~~~

~~~
 table_name |                                  create_statement
-------------+-------------------------------------------------------------------------------------
 orders     | CREATE TABLE public.orders (
            |     customer INT8 NOT NULL,
            |     id INT8 NOT NULL,
            |     total DECIMAL(20,5) NULL,
            |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, id ASC),
            |     CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES public.customers(id),
            |     FAMILY "primary" (customer, id, total)
            | ) INTERLEAVE IN PARENT public.customers (customer)
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE packages;
~~~

~~~
 table_name |                                        create_statement
-------------+--------------------------------------------------------------------------------------------------
 packages   | CREATE TABLE public.packages (
            |     customer INT8 NOT NULL,
            |     "order" INT8 NOT NULL,
            |     id INT8 NOT NULL,
            |     address STRING(50) NULL,
            |     delivered BOOL NULL,
            |     delivery_date DATE NULL,
            |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, "order" ASC, id ASC),
            |     CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES public.orders(customer, id),
            |     FAMILY "primary" (customer, "order", id, address, delivered, delivery_date)
            | ) INTERLEAVE IN PARENT public.orders (customer, "order")
(1 row)
~~~

To convert these tables to non-interleaved tables, use `ALTER PRIMARY KEY` statements, starting at the bottom of the hierarchy (i.e., with `packages`):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE packages ALTER PRIMARY KEY USING COLUMNS (customer, "order", id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ALTER PRIMARY KEY USING COLUMNS (customer, id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE orders;
~~~

~~~
 table_name |                                  create_statement
-------------+-------------------------------------------------------------------------------------
 orders     | CREATE TABLE public.orders (
            |     customer INT8 NOT NULL,
            |     id INT8 NOT NULL,
            |     total DECIMAL(20,5) NULL,
            |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, id ASC),
            |     CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES public.customers(id),
            |     UNIQUE INDEX orders_customer_id_key (customer ASC, id ASC),
            |     FAMILY "primary" (customer, id, total)
            | )
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE packages;
~~~

~~~
 table_name |                                        create_statement
-------------+--------------------------------------------------------------------------------------------------
 packages   | CREATE TABLE public.packages (
            |     customer INT8 NOT NULL,
            |     "order" INT8 NOT NULL,
            |     id INT8 NOT NULL,
            |     address STRING(50) NULL,
            |     delivered BOOL NULL,
            |     delivery_date DATE NULL,
            |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, "order" ASC, id ASC),
            |     CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES public.orders(customer, id),
            |     UNIQUE INDEX packages_customer_order_id_key (customer ASC, "order" ASC, id ASC),
            |     FAMILY "primary" (customer, "order", id, address, delivered, delivery_date)
            | )
(1 row)
~~~

### Replace interleaved indexes

Interleaved [secondary indexes](indexes.html) cannot be converted to non-interleaved indexes. You must [drop the existing index](drop-index.html), and then [create a new index](create-index.html) without an `INTERLEAVE IN PARENT` clause.
