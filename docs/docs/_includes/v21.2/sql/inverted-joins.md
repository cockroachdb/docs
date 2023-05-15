To run these examples, initialize a demo cluster with the MovR workload.

{% include {{ page.version.version }}/demo_movr.md %}

Create a GIN index on the `vehicles` table's `ext` column.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INVERTED INDEX idx_vehicle_details ON vehicles(ext);
~~~

Check the statement plan for a `SELECT` statement that uses an inner inverted join.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT * FROM vehicles@primary AS v2 INNER INVERTED JOIN vehicles@idx_vehicle_details AS v1 ON v1.ext @> v2.ext;
~~~

~~~
                                           info
-------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • lookup join
  │ table: vehicles@primary
  │ equality: (city, id) = (city,id)
  │ equality cols are key
  │ pred: ext @> ext
  │
  └── • inverted join
      │ table: vehicles@idx_vehicle_details
      │
      └── • scan
            estimated row count: 3,750 (100% of the table; stats collected 3 minutes ago)
            table: vehicles@primary
            spans: FULL SCAN
(16 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

You can omit the `INNER INVERTED JOIN` statement by putting `v1.ext` on the left side of a `@>` join condition in a `WHERE` clause and using an index hint for the GIN index.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT * FROM vehicles@idx_vehicle_details AS v1, vehicles AS v2 WHERE v1.ext @> v2.ext;
~~~

~~~
                                            info
--------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • lookup join
  │ table: vehicles@primary
  │ equality: (city, id) = (city,id)
  │ equality cols are key
  │ pred: ext @> ext
  │
  └── • inverted join
      │ table: vehicles@idx_vehicle_details
      │
      └── • scan
            estimated row count: 3,750 (100% of the table; stats collected 12 minutes ago)
            table: vehicles@primary
            spans: FULL SCAN
(16 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

Use the `LEFT INVERTED JOIN` hint to perform a left inverted join.

~~~ sql
EXPLAIN SELECT * FROM vehicles AS v2 LEFT INVERTED JOIN vehicles AS v1 ON v1.ext @> v2.ext;
~~~

~~~
                                            info
--------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • lookup join (left outer)
  │ table: vehicles@primary
  │ equality: (city, id) = (city,id)
  │ equality cols are key
  │ pred: ext @> ext
  │
  └── • inverted join (left outer)
      │ table: vehicles@idx_vehicle_details
      │
      └── • scan
            estimated row count: 3,750 (100% of the table; stats collected 16 minutes ago)
            table: vehicles@primary
            spans: FULL SCAN
(16 rows)

Time: 2ms total (execution 2ms / network 0ms)
~~~
