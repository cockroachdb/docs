---
title: SHOW RANGES
summary: The SHOW RANGES statement shows information about the ranges that comprise the data for a table, index, or entire database.
toc: true
docs_area: reference.sql
---

The `SHOW RANGES` [statement](sql-statements.html) shows information about the [ranges](architecture/overview.html#architecture-range) that comprise the data for a table, index, database, or the current catalog. This information is useful for verifying how SQL data maps to underlying [ranges](architecture/overview.html#architecture-range), and where the [replicas](architecture/glossary.html#replica) for those ranges are located.

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/sql/show-ranges-output-deprecation-notice.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
To show range information for a specific row in a table or index, use the [`SHOW RANGE ... FOR ROW`](show-range-for-row.html) statement.
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_ranges.html %}
</div>

## Required privileges

To use the `SHOW RANGES` statement, a user must either be a member of the [`admin`](security-reference/authorization.html#admin-role) role (the `root` user belongs to the `admin` role by default) or have the `ZONECONFIG` [privilege](security-reference/authorization.html#managing-privileges) defined.

## Parameters

Parameter | Description
----------|------------
[`table_name`](sql-grammar.html#table_name) | The name of the [table](show-tables.html) you want [range](architecture/overview.html#architecture-range) information about.
[`table_index_name`](sql-grammar.html#table_index_name) | The name of the [index](indexes.html) you want [range](architecture/overview.html#architecture-range) information about.
[`database_name`](sql-grammar.html#database_name) | The name of the [database](show-databases.html) you want [range](architecture/overview.html#architecture-range) information about.
[`opt_show_ranges_options`](sql-grammar.html#show_ranges_options) | The [options](#options) used to configure what fields appear in the [response](#response).

## Options

The following [options](sql-grammar.html#show_ranges_options) are available to affect the output. Multiple options can be passed at once, separated by commas.

- `TABLES`:  List [tables](show-tables.html) contained per [range](architecture/overview.html#architecture-range).
- `INDEXES`: List [indexes](indexes.html) contained per [range](architecture/overview.html#architecture-range).
- `DETAILS`: Add [range](architecture/overview.html#architecture-range) size, [leaseholder](architecture/glossary.html#leaseholder) and other details. Note that this incurs a large computational overhead because it needs to fetch data across nodes.
- `KEYS`:    Include binary [start and end keys](#start-key).

## Response

The specific fields in the response vary depending on the values passed as [options](#options). The following fields may be returned:

Field | Description | Emitted for option(s)
------|-------------|----------------------
`start_key` | <a name="start-key"></a> The start key for the [range](architecture/overview.html#architecture-range). | Always emitted.
`end_key` | The end key for the [range](architecture/overview.html#architecture-range). | Always emitted.
`raw_start_key` | The start key for the [range](architecture/overview.html#architecture-range), displayed as a [hexadecimal byte value](sql-constants.html#string-literals-with-character-escapes). | `KEYS`
`raw_end_key` | The end key for the [range](architecture/overview.html#architecture-range), displayed as a [hexadecimal byte value](sql-constants.html#string-literals-with-character-escapes). | `KEYS`
`range_id` | The internal [range](architecture/overview.html#architecture-range) ID. | Always emitted.
`voting_replicas` | The [nodes](architecture/glossary.html#node) that contain the range's voting replicas (that is, the replicas that participate in [Raft](architecture/replication-layer.html#raft) elections). | Always emitted.
`non_voting_replicas` | The [nodes](architecture/glossary.html#node) that contain the range's [non-voting replicas](architecture/replication-layer.html#non-voting-replicas). | Always emitted.
`replicas` | The [nodes](architecture/glossary.html#node) that contain the range's [replicas](architecture/glossary.html#replica). | Always emitted.
`replica_localities` | The [localities](cockroach-start.html#locality) of the range's [replicas](architecture/glossary.html#replica). | Always emitted.
`range_size` | The size of the [range](architecture/overview.html#architecture-range) in bytes. | `DETAILS`
`range_size_mb` | The size of the [range](architecture/overview.html#architecture-range) in MiB. | `DETAILS`
`lease_holder` | The  [node](architecture/glossary.html#node) that contains the range's [leaseholder](architecture/glossary.html#leaseholder). | `DETAILS`
`lease_holder_locality` | The [locality](cockroach-start.html#locality) of the range's [leaseholder](architecture/glossary.html#leaseholder). | `DETAILS`
`learner_replicas` | The _learner replicas_ of the range. A learner replica is a replica that has just been added to a range, and is thus in an interim state. It accepts messages but doesn't vote in [Raft](architecture/replication-layer.html#raft) elections. This means it doesn't affect quorum and thus doesn't affect the stability of the range, even if it's very far behind. | Always emitted.
`split_enforced_until` | The time a [range split](architecture/distribution-layer.html#range-splits) is enforced until. This can be set using [`ALTER TABLE ... SPLIT AT`](alter-table.html#split-at) using the [`WITH EXPIRATION` clause](alter-table.html#set-the-expiration-on-a-split-enforcement). Example: `2262-04-11 23:47:16.854776` (this is a default value which means "never"). | Always emitted.
`schema_name` | The name of the [schema](create-schema.html) this [range](architecture/overview.html#architecture-range) holds data for. | `TABLES`, `INDEXES`
`table_name` | The name of the [table](create-table.html) this [range](architecture/overview.html#architecture-range) holds data for. | `TABLES`, `INDEXES`
`table_id` | The internal ID of the [table](create-table.html) this [range](architecture/overview.html#architecture-range) holds data for. | `TABLES`, `INDEXES`
`table_start_key` | The start key of the first [range](architecture/overview.html#architecture-range) that holds data for this table. | `TABLES`
`table_end_key` | The end key of the last [range](architecture/overview.html#architecture-range) that holds data for this table. | `TABLES`
`raw_table_start_key` | The start key of the first [range](architecture/overview.html#architecture-range) that holds data for this table, expressed as [`BYTES`](bytes.html). | `TABLES`, `KEYS`
`raw_table_end_key` | The end key of the last [range](architecture/overview.html#architecture-range) that holds data for this table, expressed as [`BYTES`](bytes.html). | `TABLES`, `KEYS`
`index_name` | The name of the [index](indexes.html) this [range](architecture/overview.html#architecture-range) holds data for. | `INDEXES`
`index_id` | The internal ID of the [index](indexes.html) this [range](architecture/overview.html#architecture-range) holds data for. | `INDEXES`
`index_start_key` | The start key of the first [range](architecture/overview.html#architecture-range) of [index](indexes.html) data. | `INDEXES`
`index_end_key` | The end key of the last [range](architecture/overview.html#architecture-range) of [index](indexes.html) data. | `INDEXES`
`raw_index_start_key` | The start key of the first [range](architecture/overview.html#architecture-range) of [index](indexes.html) data, expressed as [`BYTES`](bytes.html). | `INDEXES`, `KEYS`
`raw_index_end_key` | The end key of the last [range](architecture/overview.html#architecture-range) of [index](indexes.html) data, expressed as [`BYTES`](bytes.html). | `INDEXES`, `KEYS`

## Examples

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/sql/show-ranges-output-deprecation-notice.md %}
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Show ranges for a database

- [Show ranges for a database (without options)](#show-ranges-for-a-database-without-options)
- [Show ranges for a database (with tables, keys, details)](#show-ranges-for-a-database-with-tables-keys-details)
- [Show ranges for a database (with tables)](#show-ranges-for-a-database-with-tables)
- [Show ranges for a database (with indexes)](#show-ranges-for-a-database-with-indexes)
- [Show ranges for a database (with details)](#show-ranges-for-a-database-with-details)
- [Show ranges for a database (with keys)](#show-ranges-for-a-database-with-keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DATABASES;
~~~

~~~
  database_name | owner | primary_region | secondary_region | regions | survival_goal
----------------+-------+----------------+------------------+---------+----------------
  defaultdb     | root  | NULL           | NULL             | {}      | NULL
  movr          | demo  | NULL           | NULL             | {}      | NULL
  postgres      | root  | NULL           | NULL             | {}      | NULL
  system        | node  | NULL           | NULL             | {}      | NULL
(4 rows)
~~~

#### Show ranges for a database (without options)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |       70 | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      309 | {3,5,9}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=d"}         | {3,5,9}         | {}                  | {}               | NULL
(178 rows)
~~~

#### Show ranges for a database (with tables, keys, details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH TABLES, KEYS, DETAILS;
~~~

~~~
                                           start_key                                           |                                           end_key                                            |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | schema_name |         table_name         | table_id | table_start_key |    table_end_key     | raw_table_start_key | raw_table_end_key |       range_size_mb        | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+-------------+----------------------------+----------+-----------------+----------------------+---------------------+-------------------+----------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+-------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      174 | public      | users                      |      106 | /Table/106      | /Table/107           | \xf2                | \xf3              |                          0 |            3 | region=us-east1,az=d     | {3,6,9}  | {"region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=d"}         | {3,9,6}         | {}                  | {}               | NULL                       |          0
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      175 | public      | users                      |      106 | /Table/106      | /Table/107           | \xf2                | \xf3              |  0.00011900000000000000000 |            3 | region=us-east1,az=d     | {3,7,8}  | {"region=us-east1,az=d","region=europe-west1,az=b","region=europe-west1,az=c"}     | {3,7,8}         | {}                  | {}               | NULL                       |        119
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         | \xf66f891277617368696e67746f6e2064630002                                                             | \xffff                                                                                               |      295 | public      | user_promo_codes           |      111 | /Table/111      | /Table/112           | \xf66f              | \xf670            |                          0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}         | {3,8,4}         | {}                  | {}               | NULL                       |          0
(145 rows)
~~~

#### Show ranges for a database (with tables)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH TABLES;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id | schema_name |         table_name         | table_id | table_start_key |    table_end_key     | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+-------------+----------------------------+----------+-----------------+----------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |       67 | public      | users                      |      106 | /Table/106      | /Table/107           | {1,4,9}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=d"}         | {1,9,4}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       68 | public      | users                      |      106 | /Table/106      | /Table/107           | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {7,9,8}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      311 | public      | user_promo_codes           |      111 | /Table/111      | /Table/112           | {1,5,7}  | {"region=us-east1,az=b","region=us-west1,az=b","region=europe-west1,az=b"}         | {1,7,5}         | {}                  | {}               | NULL
(178 rows)
~~~

#### Show ranges for a database (with indexes)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH INDEXES;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id | schema_name |         table_name         | table_id |                  index_name                   | index_id | index_start_key | index_end_key | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+-------------+----------------------------+----------+-----------------------------------------------+----------+-----------------+---------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |       70 | public      | users                      |      106 | users_pkey                                    |        1 | /Table/106/1    | /Table/106/2  | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 | public      | users                      |      106 | users_pkey                                    |        1 | /Table/106/1    | /Table/106/2  | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      309 | public      | user_promo_codes           |      111 | user_promo_codes_pkey                         |        1 | /Table/111/1    | /Table/111/2  | {3,5,9}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=d"}         | {3,5,9}         | {}                  | {}               | NULL
(179 rows)
~~~

#### Show ranges for a database (with details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH DETAILS;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id |       range_size_mb        | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+----------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+-------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |       70 |                          0 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL                       |          0
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 |  0.00011800000000000000000 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL                       |        118
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      309 |                          0 |            9 | region=europe-west1,az=d | {3,5,9}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=d"}         | {3,5,9}         | {}                  | {}               | NULL                       |          0
(178 rows)
~~~

#### Show ranges for a database (with keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH KEYS;
~~~

~~~
                                           start_key                                           |                                           end_key                                            |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |       70 | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |       71 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         | \xf66f891277617368696e67746f6e2064630002                                                             | \xffff                                                                                               |      309 | {3,5,9}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=d"}         | {3,5,9}         | {}                  | {}               | NULL
(178 rows)
~~~

### Show ranges for a table

- [Show ranges for a table (without options)](#show-ranges-for-a-table-without-options)
- [Show ranges for a table (with indexes, keys, details)](#show-ranges-for-a-table-with-indexes-keys-details)
- [Show ranges for a table (with indexes)](#show-ranges-for-a-table-with-indexes)
- [Show ranges for a table (with details)](#show-ranges-for-a-table-with-details)
- [Show ranges for a table (with keys)](#show-ranges-for-a-table-with-keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | owner | estimated_row_count | locality
--------------+----------------------------+-------+-------+---------------------+-----------
  public      | promo_codes                | table | demo  |                1000 | NULL
  public      | rides                      | table | demo  |                 500 | NULL
  public      | user_promo_codes           | table | demo  |                   5 | NULL
  public      | users                      | table | demo  |                  50 | NULL
  public      | vehicle_location_histories | table | demo  |                1000 | NULL
  public      | vehicles                   | table | demo  |                  15 | NULL
(6 rows)
~~~

#### Show ranges for a table (without options)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users;
~~~

~~~
                                       start_key                                      |                                       end_key                                       | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     |       70 | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  …/1/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                        |      154 | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

#### Show ranges for a table (with indexes, keys, details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users with INDEXES, KEYS, DETAILS;
~~~

~~~
                                       start_key                                      |                                       end_key                                       |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | index_name | index_id | index_start_key | index_end_key | raw_index_start_key | raw_index_end_key |       range_size_mb       | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+------------+----------+-----------------+---------------+---------------------+-------------------+---------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+-------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      174 | users_pkey |        1 | …/1             | …/2           | \xf289              | \xf28a            |                         0 |            3 | region=us-east1,az=d     | {3,6,9}  | {"region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=d"}         | {3,9,6}         | {}                  | {}               | NULL                       |          0
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      175 | users_pkey |        1 | …/1             | …/2           | \xf289              | \xf28a            | 0.00011900000000000000000 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL                       |        119
  ...
  …/1/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                        | \xf2891277617368696e67746f6e2064630002                                                               | \xf3                                                                                                 |      111 | users_pkey |        1 | …/1             | …/2           | \xf289              | \xf28a            |                         0 |            9 | region=europe-west1,az=d | {1,5,9}  | {"region=us-east1,az=b","region=us-west1,az=b","region=europe-west1,az=d"}         | {1,9,5}         | {}                  | {}               | NULL                       |          0
(27 rows)
~~~

#### Show ranges for a table (with indexes)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users WITH INDEXES;
~~~

~~~
                                       start_key                                      |                                       end_key                                       | range_id | index_name | index_id | index_start_key | index_end_key | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+----------+------------+----------+-----------------+---------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     |       70 | users_pkey |        1 | …/1             | …/2           | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 | users_pkey |        1 | …/1             | …/2           | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  …/1/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                        |      154 | users_pkey |        1 | …/1             | …/2           | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

#### Show ranges for a table (with details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users WITH DETAILS;
~~~

~~~
                                       start_key                                      |                                       end_key                                       | range_id |       range_size_mb        | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+----------+----------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+-------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     |       70 |                          0 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL                       |          0
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 |  0.00011800000000000000000 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL                       |        118
  ...
  …/1/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                        |      154 |                          0 |            4 | region=us-west1,az=a     | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL                       |          0
(27 rows)
~~~

#### Show ranges for a table (with keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users WITH KEYS;
~~~

~~~
                                       start_key                                      |                                       end_key                                       |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |       70 | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |       71 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  …/1/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                        | \xf2891277617368696e67746f6e2064630002                                                               | \xf3                                                                                                 |      154 | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

### Show ranges for an index

- [Show ranges for an index (without options)](#show-ranges-for-an-index-without-options)
- [Show ranges for an index (with keys, details)](#show-ranges-for-an-index-with-keys-details)
- [Show ranges for an index (with details)](#show-ranges-for-an-index-with-details)
- [Show ranges for an index (with keys)](#show-ranges-for-an-index-with-keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM movr.users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | definition  | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-------------+-----------+---------+----------+----------
  users      | users_pkey |     f      |            1 | city        | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | credit_card | N/A       |    t    |    f     |    t
(5 rows)
~~~

#### Show ranges for an index (without options)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX movr.users_pkey;
~~~

~~~
                                      start_key                                     |                                      end_key                                      | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  …/TableMin                                                                        | …/"amsterdam"                                                                     |       70 | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  …/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                      |      154 | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

#### Show ranges for an index (with keys, details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX movr.users_pkey WITH KEYS, DETAILS;
~~~

~~~
                                      start_key                                     |                                      end_key                                      |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id |       range_size_mb       | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size
------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+---------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+-------------
  …/TableMin                                                                        | …/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      174 |                         0 |            3 | region=us-east1,az=d     | {3,6,9}  | {"region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=d"}         | {3,9,6}         | {}                  | {}               | NULL                       |          0
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      175 | 0.00011900000000000000000 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL                       |        119
  ...
  …/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                      | \xf2891277617368696e67746f6e2064630002                                                               | \xf3                                                                                                 |      111 |                         0 |            9 | region=europe-west1,az=d | {1,5,9}  | {"region=us-east1,az=b","region=us-west1,az=b","region=europe-west1,az=d"}         | {1,9,5}         | {}                  | {}               | NULL                       |          0
(27 rows)
~~~

#### Show ranges for an index (with details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX movr.users_pkey WITH DETAILS;
~~~

~~~
                                      start_key                                     |                                      end_key                                      | range_id |       range_size_mb        | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size
------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+----------+----------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+-------------
  …/TableMin                                                                        | …/"amsterdam"                                                                     |       70 |                          0 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL                       |          0
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       71 |  0.00011800000000000000000 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL                       |        118
  ...
  …/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                      |      154 |                          0 |            4 | region=us-west1,az=a     | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL                       |          0
(27 rows)
~~~

#### Show ranges for an index (with keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX movr.users_pkey WITH KEYS;
~~~

~~~
                                      start_key                                     |                                      end_key                                      |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  …/TableMin                                                                        | …/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |       70 | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}         | {1,6,8}         | {}                  | {}               | NULL
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |       71 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {9,7,8}         | {}                  | {}               | NULL
  ...
  …/"washington dc"/PrefixEnd                                                       | …/<TableMax>                                                                      | \xf2891277617368696e67746f6e2064630002                                                               | \xf3                                                                                                 |      154 | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

## See also

- [`SHOW RANGE ... FOR ROW`](show-range-for-row.html)
- [`ALTER TABLE ... SPLIT AT`](alter-table.html#split-at)
- [`ALTER INDEX ... SPLIT AT`](alter-index.html#split-at)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Partitioning tables](partitioning.html)
- [Architecture Overview](architecture/overview.html)
