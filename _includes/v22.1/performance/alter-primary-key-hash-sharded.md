Let's assume the `events` table already exists:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE events (
    product_id INT8,
    owner UUID,
    serial_number VARCHAR,
    event_id UUID,
    ts TIMESTAMP,
    data JSONB,
    PRIMARY KEY (product_id, owner, serial_number, ts, event_id),
    INDEX (ts) USING HASH
);
~~~

You can change an existing primary key to use hash sharding by adding the `USING HASH` clause at the end of the key definition:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE events ALTER PRIMARY KEY USING COLUMNS (product_id, owner, serial_number, ts, event_id) USING HASH;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM events;
~~~

~~~
  table_name |  index_name   | non_unique | seq_in_index |                            column_name                            | direction | storing | implicit
-------------+---------------+------------+--------------+-------------------------------------------------------------------+-----------+---------+-----------
  events     | events_pkey   |   false    |            1 | crdb_internal_event_id_owner_product_id_serial_number_ts_shard_16 | ASC       |  false  |   true
  events     | events_pkey   |   false    |            2 | product_id                                                        | ASC       |  false  |  false
  events     | events_pkey   |   false    |            3 | owner                                                             | ASC       |  false  |  false
  events     | events_pkey   |   false    |            4 | serial_number                                                     | ASC       |  false  |  false
  events     | events_pkey   |   false    |            5 | ts                                                                | ASC       |  false  |  false
  events     | events_pkey   |   false    |            6 | event_id                                                          | ASC       |  false  |  false
  events     | events_pkey   |   false    |            7 | data                                                              | N/A       |  true   |  false
  events     | events_ts_idx |    true    |            1 | crdb_internal_ts_shard_16                                         | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            2 | ts                                                                | ASC       |  false  |  false
  events     | events_ts_idx |    true    |            3 | crdb_internal_event_id_owner_product_id_serial_number_ts_shard_16 | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            4 | product_id                                                        | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            5 | owner                                                             | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            6 | serial_number                                                     | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            7 | event_id                                                          | ASC       |  false  |   true
(14 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM events;
~~~

~~~
                             column_name                            | data_type | is_nullable | column_default |                                     generation_expression                                     |           indices           | is_hidden
--------------------------------------------------------------------+-----------+-------------+----------------+-----------------------------------------------------------------------------------------------+-----------------------------+------------
  product_id                                                        | INT8      |    false    | NULL           |                                                                                               | {events_pkey,events_ts_idx} |   false
  owner                                                             | UUID      |    false    | NULL           |                                                                                               | {events_pkey,events_ts_idx} |   false
  serial_number                                                     | VARCHAR   |    false    | NULL           |                                                                                               | {events_pkey,events_ts_idx} |   false
  event_id                                                          | UUID      |    false    | NULL           |                                                                                               | {events_pkey,events_ts_idx} |   false
  ts                                                                | TIMESTAMP |    false    | NULL           |                                                                                               | {events_pkey,events_ts_idx} |   false
  data                                                              | JSONB     |    true     | NULL           |                                                                                               | {events_pkey}               |   false
  crdb_internal_ts_shard_16                                         | INT8      |    false    | NULL           | mod(fnv32(crdb_internal.datums_to_bytes(ts)), 16)                                             | {events_ts_idx}             |   true
  crdb_internal_event_id_owner_product_id_serial_number_ts_shard_16 | INT8      |    false    | NULL           | mod(fnv32(crdb_internal.datums_to_bytes(event_id, owner, product_id, serial_number, ts)), 16) | {events_pkey,events_ts_idx} |   true
(8 rows)
~~~
