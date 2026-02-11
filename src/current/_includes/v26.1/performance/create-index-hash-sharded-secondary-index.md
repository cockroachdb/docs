Let's assume the `events` table already exists:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE events (
    product_id INT8,
    owner UUID,
    serial_number VARCHAR,
    event_id UUID,
    ts TIMESTAMP,
    data JSONB,
    PRIMARY KEY (product_id, owner, serial_number, ts, event_id)
);
~~~

You can create a hash-sharded index on an existing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON events(ts) USING HASH;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM events;
~~~

~~~
  table_name |  index_name   | non_unique | seq_in_index |        column_name        | direction | storing | implicit
-------------+---------------+------------+--------------+---------------------------+-----------+---------+-----------
  events     | events_pkey   |   false    |            1 | product_id                | ASC       |  false  |  false
  events     | events_pkey   |   false    |            2 | owner                     | ASC       |  false  |  false
  events     | events_pkey   |   false    |            3 | serial_number             | ASC       |  false  |  false
  events     | events_pkey   |   false    |            4 | ts                        | ASC       |  false  |  false
  events     | events_pkey   |   false    |            5 | event_id                  | ASC       |  false  |  false
  events     | events_pkey   |   false    |            6 | data                      | N/A       |  true   |  false
  events     | events_ts_idx |    true    |            1 | crdb_internal_ts_shard_16 | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            2 | ts                        | ASC       |  false  |  false
  events     | events_ts_idx |    true    |            3 | product_id                | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            4 | owner                     | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            5 | serial_number             | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            6 | event_id                  | ASC       |  false  |   true
(12 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM events;
~~~

~~~
         column_name        | data_type | is_nullable | column_default |               generation_expression               |           indices           | is_hidden
----------------------------+-----------+-------------+----------------+---------------------------------------------------+-----------------------------+------------
  product_id                | INT8      |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  owner                     | UUID      |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  serial_number             | VARCHAR   |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  event_id                  | UUID      |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  ts                        | TIMESTAMP |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  data                      | JSONB     |    true     | NULL           |                                                   | {events_pkey}               |   false
  crdb_internal_ts_shard_16 | INT8      |    false    | NULL           | mod(fnv32(crdb_internal.datums_to_bytes(ts)), 16) | {events_ts_idx}             |   true
(7 rows)
~~~
