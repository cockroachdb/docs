CockroachDB's row-level security (RLS) implementation exposes metadata about the number of restricted rows in a table under certain conditions, such as when users execute certain SQL functions. For example, when a user applies arbitrary SQL filters on a table with RLS enabled, it's possible for the user to see how many total rows are in the table; this count includes rows that the user does not have direct access to. This metadata leakage can also occur when statements like [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain.md %}) are used, as the output includes a count of the number of rows scanned by the query that can include the number of restricted rows, even though the rows themselves are not directly accessible. [#146952](https://github.com/cockroachdb/cockroach/issues/146952)

For example, given the schema from {% if page.name == "row-level-security.md" %}[RLS for multi-tenant isolation](#rls-for-multi-tenant-isolation){% else %}[RLS for multi-tenant isolation]({% link {{ page.version.version }}/row-level-security.md %}#rls-for-multi-tenant-isolation){% endif %}, execute the following statements to view this behavior.

First, set the `app_dev` role from the example.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE app_dev;
~~~

Next, set the application name using one of the given tenant IDs.

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'my_cool_app.9607a12c-3c2f-407b-ae3c-af903542395b';
~~~

A query against the `invoices` table by this role and tenant ID combo shows only the rows that should be visible to this user. This is expected behavior.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM invoices where amount > 0;
~~~

~~~
      invoice_id      |              tenant_id               | customer_name  | amount  |          created_at
----------------------+--------------------------------------+----------------+---------+--------------------------------
  1074613663497256961 | 9607a12c-3c2f-407b-ae3c-af903542395b | Customer One   | 1500.75 | 2025-05-23 16:07:44.297964+00
  1074613663532187649 | 9607a12c-3c2f-407b-ae3c-af903542395b | Customer Three |  210.50 | 2025-05-23 16:07:44.310015+00
  1074614064941465601 | 9607a12c-3c2f-407b-ae3c-af903542395b | Customer Three |  678.90 | 2025-05-23 16:09:46.807641+00
(3 rows)
~~~

However, if the user runs [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) on the same query, they can see that the count (6) of the `rows decoded from KV` includes all the rows in the table, whereas the user should only know about the 3 rows that are visible to them.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE SELECT count(*) FROM invoices where amount > 0;
~~~

~~~
                                                    info
------------------------------------------------------------------------------------------------------------
  planning time: 5ms
  execution time: 6ms
  distribution: local
  vectorized: true
  plan type: custom
  rows decoded from KV: 6 (363 B, 2 gRPC calls)
  ...
~~~
