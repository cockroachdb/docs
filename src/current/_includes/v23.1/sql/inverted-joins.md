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
EXPLAIN SELECT * FROM vehicles@vehicles_pkey AS v2 INNER INVERTED JOIN vehicles@idx_vehicle_details AS v1 ON v1.ext @> v2.ext;
~~~

~~~
                    info
---------------------------------------------
  distribution: full
  vectorized: true

  • lookup join
  │ table: vehicles@vehicles_pkey
  │ equality: (city, id) = (city,id)
  │ equality cols are key
  │ pred: ext @> ext
  │
  └── • inverted join
      │ table: vehicles@idx_vehicle_details
      │
      └── • scan
            estimated row count: 3,750 (100% of the table; stats collected 1 hour ago)
            table: vehicles@vehicles_pkey
            spans: FULL SCAN
(16 rows)
~~~

You can omit the `INNER INVERTED JOIN` statement by putting `v1.ext` on the left side of a `@>` join condition in a `WHERE` clause and using an [index hint]({% link {{ page.version.version }}/table-expressions.md %}#force-index-selection) for the GIN index.

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
  │ table: vehicles@vehicles_pkey
  │ equality: (city, id) = (city,id)
  │ equality cols are key
  │ pred: ext @> ext
  │
  └── • inverted join
      │ table: vehicles@idx_vehicle_details
      │
      └── • scan
            estimated row count: 3,750 (100% of the table; stats collected 1 hour ago)
            table: vehicles@vehicles_pkey
            spans: FULL SCAN
(16 rows)
~~~

Use the `LEFT INVERTED JOIN` hint to perform a left inverted join.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT * FROM vehicles AS v2 LEFT INVERTED JOIN vehicles AS v1 ON v1.ext @> v2.ext;
~~~

~~~
                                           info
------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • lookup join (left outer)
  │ table: vehicles@vehicles_pkey
  │ equality: (city, id) = (city,id)
  │ equality cols are key
  │ pred: ext @> ext
  │
  └── • inverted join (left outer)
      │ table: vehicles@idx_vehicle_details
      │
      └── • scan
            estimated row count: 3,750 (100% of the table; stats collected 1 hour ago)
            table: vehicles@vehicles_pkey
            spans: FULL SCAN
(16 rows)
~~~
