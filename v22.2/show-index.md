---
title: SHOW INDEX
summary: The SHOW INDEX statement returns index information for a table or database.
toc: true
docs_area: reference.sql
---

The `SHOW INDEX` [statement](sql-statements.html) returns index information for a table or database.


## Required privileges

The user must have any [privilege](security-reference/authorization.html#managing-privileges) on the target table or database.

## Aliases

In CockroachDB, the following are aliases for `SHOW INDEX`:

- `SHOW INDEXES`
- `SHOW KEYS`

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_indexes.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show indexes.
`database_name` | The name of the database for which to show indexes.

## Response

The following fields are returned for each column in each index.

Field | Description
----------|------------
`table_name` | The name of the table.
`index_name` | The name of the index.
`non_unique` | Whether values in the indexed column are unique. Possible values: `true` or `false`.
`seq_in_index` | The position of the column in the index, starting with `1`.
`column_name` | The indexed column.
`direction` | How the column is sorted in the index. Possible values: `ASC` or `DESC` for indexed columns; `N/A` for stored columns.
`storing` | Whether the `STORING` clause was used to index the column during [index creation](create-index.html). Possible values: `true` or `false`.
`implicit` | Whether the column is part of the index despite not being explicitly included during [index creation](create-index.html). Possible values: `true` or `false`<br><br>[Primary key](primary-key.html) columns are the only columns implicitly included in secondary indexes. The inclusion of primary key columns improves performance when retrieving columns not in the index.
`visible` | Whether the index is visible to the [cost-based optimizer](cost-based-optimizer.html#control-whether-the-optimizer-uses-an-index).

A column is in the primary key if the value of the `index_name` column is `{tbl}_pkey` and value of the `storing` column is `false`.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show indexes for a table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_name_idx |     t      |            1 | name        | ASC       |    f    |    f     |    t
  users      | users_name_idx |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | users_name_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

In this example, the columns where the value of the `index_name` column is `users_pkey` and value of the `storing` column is `false`, and thus are in the primary key, are `city` and `id`.

### Show indexes for a database

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM DATABASE movr;
~~~

~~~
          table_name         |                  index_name                   | non_unique | seq_in_index |   column_name    | direction | storing | implicit | visible
-----------------------------+-----------------------------------------------+------------+--------------+------------------+-----------+---------+----------+----------
  promo_codes                | promo_codes_pkey                              |     f      |            1 | code             | ASC       |    f    |    f     |    t
  promo_codes                | promo_codes_pkey                              |     f      |            2 | description      | N/A       |    t    |    f     |    t
  promo_codes                | promo_codes_pkey                              |     f      |            3 | creation_time    | N/A       |    t    |    f     |    t
  promo_codes                | promo_codes_pkey                              |     f      |            4 | expiration_time  | N/A       |    t    |    f     |    t
  promo_codes                | promo_codes_pkey                              |     f      |            5 | rules            | N/A       |    t    |    f     |    t
  rides                      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city             | ASC       |    f    |    f     |    t
  rides                      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id         | ASC       |    f    |    f     |    t
  rides                      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id               | ASC       |    f    |    t     |    t
  rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            1 | vehicle_city     | ASC       |    f    |    f     |    t
  rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            2 | vehicle_id       | ASC       |    f    |    f     |    t
  rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            3 | city             | ASC       |    f    |    t     |    t
  rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            4 | id               | ASC       |    f    |    t     |    t
  rides                      | rides_pkey                                    |     f      |            1 | city             | ASC       |    f    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            2 | id               | ASC       |    f    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            3 | vehicle_city     | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            4 | rider_id         | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            5 | vehicle_id       | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            6 | start_address    | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            7 | end_address      | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            8 | start_time       | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |            9 | end_time         | N/A       |    t    |    f     |    t
  rides                      | rides_pkey                                    |     f      |           10 | revenue          | N/A       |    t    |    f     |    t
  user_promo_codes           | user_promo_codes_pkey                         |     f      |            1 | city             | ASC       |    f    |    f     |    t
  user_promo_codes           | user_promo_codes_pkey                         |     f      |            2 | user_id          | ASC       |    f    |    f     |    t
  user_promo_codes           | user_promo_codes_pkey                         |     f      |            3 | code             | ASC       |    f    |    f     |    t
  user_promo_codes           | user_promo_codes_pkey                         |     f      |            4 | timestamp        | N/A       |    t    |    f     |    t
  user_promo_codes           | user_promo_codes_pkey                         |     f      |            5 | usage_count      | N/A       |    t    |    f     |    t
  users                      | users_name_idx                                |     t      |            1 | name             | ASC       |    f    |    f     |    t
  users                      | users_name_idx                                |     t      |            2 | city             | ASC       |    f    |    t     |    t
  users                      | users_name_idx                                |     t      |            3 | id               | ASC       |    f    |    t     |    t
  users                      | users_pkey                                    |     f      |            1 | city             | ASC       |    f    |    f     |    t
  users                      | users_pkey                                    |     f      |            2 | id               | ASC       |    f    |    f     |    t
  users                      | users_pkey                                    |     f      |            3 | name             | N/A       |    t    |    f     |    t
  users                      | users_pkey                                    |     f      |            4 | address          | N/A       |    t    |    f     |    t
  users                      | users_pkey                                    |     f      |            5 | credit_card      | N/A       |    t    |    f     |    t
  vehicle_location_histories | vehicle_location_histories_pkey               |     f      |            1 | city             | ASC       |    f    |    f     |    t
  vehicle_location_histories | vehicle_location_histories_pkey               |     f      |            2 | ride_id          | ASC       |    f    |    f     |    t
  vehicle_location_histories | vehicle_location_histories_pkey               |     f      |            3 | timestamp        | ASC       |    f    |    f     |    t
  vehicle_location_histories | vehicle_location_histories_pkey               |     f      |            4 | lat              | N/A       |    t    |    f     |    t
  vehicle_location_histories | vehicle_location_histories_pkey               |     f      |            5 | long             | N/A       |    t    |    f     |    t
  vehicles                   | vehicles_auto_index_fk_city_ref_users         |     t      |            1 | city             | ASC       |    f    |    f     |    t
  vehicles                   | vehicles_auto_index_fk_city_ref_users         |     t      |            2 | owner_id         | ASC       |    f    |    f     |    t
  vehicles                   | vehicles_auto_index_fk_city_ref_users         |     t      |            3 | id               | ASC       |    f    |    t     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            1 | city             | ASC       |    f    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            2 | id               | ASC       |    f    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            3 | type             | N/A       |    t    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            4 | owner_id         | N/A       |    t    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            5 | creation_time    | N/A       |    t    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            6 | status           | N/A       |    t    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            7 | current_location | N/A       |    t    |    f     |    t
  vehicles                   | vehicles_pkey                                 |     f      |            8 | ext              | N/A       |    t    |    f     |    t
(51 rows)
~~~

## See also

- [`CREATE INDEX`](create-index.html)
- [`COMMENT ON`](comment-on.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [Information Schema](information-schema.html)
- [SQL Statements](sql-statements.html)
