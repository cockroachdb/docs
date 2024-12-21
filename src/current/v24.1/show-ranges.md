---
title: SHOW RANGES
summary: The SHOW RANGES statement shows information about the ranges that comprise the data for a table, index, or entire database.
toc: true
docs_area: reference.sql
---

The `SHOW RANGES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) shows information about the [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that comprise the data for a table, index, database, or the current catalog. This information is useful for verifying how SQL data maps to underlying [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range), and where the [replicas]({% link {{ page.version.version }}/architecture/glossary.md %}#replica) for those ranges are located.

{{site.data.alerts.callout_success}}
To show range information for a specific row in a table or index, use the [`SHOW RANGE ... FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %}) statement.
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_ranges.html %}
</div>

## Required privileges

To use the `SHOW RANGES` statement, a user must either be a member of the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) role (the `root` user belongs to the `admin` role by default) or have the `ZONECONFIG` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) defined.

## Parameters

Parameter | Description
----------|------------
[`table_name`]({% link {{ page.version.version }}/sql-grammar.md %}#table_name) | The name of the [table]({% link {{ page.version.version }}/show-tables.md %}) you want [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) information about.
[`table_index_name`]({% link {{ page.version.version }}/sql-grammar.md %}#table_index_name) | The name of the [index]({% link {{ page.version.version }}/indexes.md %}) you want [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) information about.
[`database_name`]({% link {{ page.version.version }}/sql-grammar.md %}#database_name) | The name of the [database]({% link {{ page.version.version }}/show-databases.md %}) you want [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) information about.
[`opt_show_ranges_options`]({% link {{ page.version.version }}/sql-grammar.md %}#show_ranges_options) | The [options](#options) used to configure what fields appear in the [response](#response).

## Options

The following [options]({% link {{ page.version.version }}/sql-grammar.md %}#show_ranges_options) are available to affect the output. Multiple options can be passed at once, separated by commas.

- `TABLES`:  List [tables]({% link {{ page.version.version }}/show-tables.md %}) contained per [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range).
- `INDEXES`: List [indexes]({% link {{ page.version.version }}/indexes.md %}) contained per [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range).
- `DETAILS`: Add [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) size, [leaseholder]({% link {{ page.version.version }}/architecture/glossary.md %}#leaseholder) and other details. Note that this incurs a large computational overhead because it needs to fetch data across nodes.
- `KEYS`:    Include binary [start and end keys](#start-key).

## Response

The specific fields in the response vary depending on the values passed as [options](#options). The following fields may be returned:

Field | Description | Emitted for option(s)
------|-------------|----------------------
`start_key` | <a name="start-key"></a> The start key for the [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range). | Always emitted.
`end_key` | <a name="end-key"></a> The end key for the [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range). | Always emitted.
`raw_start_key` | The start key for the [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range), displayed as a [hexadecimal byte value]({% link {{ page.version.version }}/sql-constants.md %}#string-literals-with-character-escapes). | `KEYS`
`raw_end_key` | The end key for the [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range), displayed as a [hexadecimal byte value]({% link {{ page.version.version }}/sql-constants.md %}#string-literals-with-character-escapes). | `KEYS`
`range_id` | The internal [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) ID. | Always emitted.
`voting_replicas` | The [nodes]({% link {{ page.version.version }}/architecture/glossary.md %}#node) that contain the range's voting replicas (that is, the replicas that participate in [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) elections). | Always emitted.
`non_voting_replicas` | The [nodes]({% link {{ page.version.version }}/architecture/glossary.md %}#node) that contain the range's [non-voting replicas]({% link {{ page.version.version }}/architecture/replication-layer.md %}#non-voting-replicas). | Always emitted.
`replicas` | The [nodes]({% link {{ page.version.version }}/architecture/glossary.md %}#node) that contain the range's [replicas]({% link {{ page.version.version }}/architecture/glossary.md %}#replica). | Always emitted.
`replica_localities` | The [localities]({% link {{ page.version.version }}/cockroach-start.md %}#locality) of the range's [replicas]({% link {{ page.version.version }}/architecture/glossary.md %}#replica). | Always emitted.
`range_size` | The size of the [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) in bytes. | `DETAILS`
`range_size_mb` | The size of the [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) in MiB. | `DETAILS`
`lease_holder` | The  [node]({% link {{ page.version.version }}/architecture/glossary.md %}#node) that contains the range's [leaseholder]({% link {{ page.version.version }}/architecture/glossary.md %}#leaseholder). | `DETAILS`
`lease_holder_locality` | The [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) of the range's [leaseholder]({% link {{ page.version.version }}/architecture/glossary.md %}#leaseholder). | `DETAILS`
`learner_replicas` | The _learner replicas_ of the range. A learner replica is a replica that has just been added to a range, and is thus in an interim state. It accepts messages but doesn't vote in [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) elections. This means it doesn't affect quorum and thus doesn't affect the stability of the range, even if it's very far behind. | Always emitted.
`split_enforced_until` | The time a [range split]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-splits) is enforced until. This can be set using [`ALTER TABLE ... SPLIT AT`]({% link {{ page.version.version }}/alter-table.md %}#split-at) using the [`WITH EXPIRATION` clause]({% link {{ page.version.version }}/alter-table.md %}#set-the-expiration-on-a-split-enforcement). Example: `2262-04-11 23:47:16.854776` (this is a default value which means "never"). | Always emitted.
`schema_name` | The name of the [schema]({% link {{ page.version.version }}/create-schema.md %}) this [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) holds data for. | `TABLES`, `INDEXES`
`table_name` | The name of the [table]({% link {{ page.version.version }}/create-table.md %}) this [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) holds data for. | `TABLES`, `INDEXES`
`table_id` | The internal ID of the [table]({% link {{ page.version.version }}/create-table.md %}) this [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) holds data for. | `TABLES`, `INDEXES`
`table_start_key` | The start key of the first [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that holds data for this table. | `TABLES`
`table_end_key` | The end key of the last [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that holds data for this table. | `TABLES`
`raw_table_start_key` | The start key of the first [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that holds data for this table, expressed as [`BYTES`]({% link {{ page.version.version }}/bytes.md %}). | `TABLES`, `KEYS`
`raw_table_end_key` | The end key of the last [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that holds data for this table, expressed as [`BYTES`]({% link {{ page.version.version }}/bytes.md %}). | `TABLES`, `KEYS`
`index_name` | The name of the [index]({% link {{ page.version.version }}/indexes.md %}) this [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) holds data for. | `INDEXES`
`index_id` | The internal ID of the [index]({% link {{ page.version.version }}/indexes.md %}) this [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) holds data for. | `INDEXES`
`index_start_key` | The start key of the first [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) of [index]({% link {{ page.version.version }}/indexes.md %}) data. | `INDEXES`
`index_end_key` | The end key of the last [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) of [index]({% link {{ page.version.version }}/indexes.md %}) data. | `INDEXES`
`raw_index_start_key` | The start key of the first [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) of [index]({% link {{ page.version.version }}/indexes.md %}) data, expressed as [`BYTES`]({% link {{ page.version.version }}/bytes.md %}). | `INDEXES`, `KEYS`
`raw_index_end_key` | The end key of the last [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) of [index]({% link {{ page.version.version }}/indexes.md %}) data, expressed as [`BYTES`]({% link {{ page.version.version }}/bytes.md %}). | `INDEXES`, `KEYS`
`span_stats` | A `JSON` object containing span statistics. For more details, see [Span Statistics](#span-statistics). | `DETAILS`

### Span Statistics

CockroachDB stores all user data in a sorted map of key-value pairs, also known as a keyspace. A span refers to an interval within this keyspace.

The `SHOW RANGES` command emits span statistics when the `DETAILS` option is specified. The statistics are included in a column named `span_stats`, as a `JSON` object.

The statistics are calculated for the identifier of each row. For example:

- `SHOW RANGES WITH DETAILS` will compute span statistics for each [range]({% link {{ page.version.version }}/ui-replication-dashboard.md %}#review-of-cockroachdb-terminology).
- `SHOW RANGES WITH TABLES, DETAILS` will compute span statistics for each table.
 
The `span_stats` `JSON` object has the following keys:

 Key | Description
-----|-------------
`approximate_disk_bytes` | An approximation of the total on-disk size of the given object, across all [replicas]({% link {{ page.version.version }}/architecture/glossary.md %}#replica) (after compression).
`key_count` | The number of non-system keys, including live and deleted keys, as well as new, uncommitted keys.
`key_bytes` | The total key size (in bytes) of the keys tracked in `key_count`.
`val_count` | The number of values, or versions, of the keys tracked in `key_count`, including deletion tombstones. A key will always have at least one value, but may have several historical values.
`val_bytes` | Total value size (in bytes) of the values tracked in `val_count`.
`sys_count` | The number of system keys, which are not included in `key_count`.
`sys_bytes` | The total size (in bytes) of the keys in `sys_count` and all of their values, or versions.
`live_count` | The number of live (committed and non-deleted) non-system keys.
`live_bytes` | Total size (in bytes) of the keys tracked in `live_count` and their most recent value.
`intent_count` | The number of [intents]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) (keys with new, uncommitted values).
`intent_bytes` | The total size (in bytes) of the keys tracked in `intent_count` and their uncommitted values.

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Show ranges for a database

- [Show ranges for a database (without options)](#show-ranges-for-a-database-without-options)
- [Show ranges for a database (with tables, keys, details)](#show-ranges-for-a-database-with-tables-keys-details)
- [Show ranges for a database (with tables)](#show-ranges-for-a-database-with-tables)
- [Show ranges for a database (with indexes)](#show-ranges-for-a-database-with-indexes)
- [Show ranges for a database (with details)](#show-ranges-for-a-database-with-details)
- [Show ranges for a database (with keys)](#show-ranges-for-a-database-with-keys)
- [SQL query to get database size](#sql-query-to-get-database-size)

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
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |      109 | {2,4,9}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=d"}         | {2,9,4}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      178 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      284 | {1,4,8}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}         | {1,8,4}         | {}                  | {}               | NULL
(175 rows)
~~~

#### Show ranges for a database (with tables, keys, details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH TABLES, KEYS, DETAILS;
~~~

~~~
                                           start_key                                           |                                           end_key                                            |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | schema_name |         table_name         | table_id |                                       table_start_key                                        |                                        table_end_key                                         |                                         raw_table_start_key                                          |                                          raw_table_end_key                                           |       range_size_mb        | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size |                                                                                                              span_stats
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+-------------+----------------------------+----------+----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      109 | public      | users                      |      106 | /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |                          0 |            2 | region=us-east1,az=c     | {2,4,9}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=d"}         | {2,9,4}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 44299, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 1025, "sys_count": 7, "val_bytes": 0, "val_count": 0}
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      178 | public      | users                      |      106 | /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |  0.00010300000000000000000 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL                       |        103 | {"approximate_disk_bytes": 52021, "intent_bytes": 0, "intent_count": 0, "key_bytes": 54, "key_count": 1, "live_bytes": 103, "live_count": 1, "sys_bytes": 2190, "sys_count": 7, "val_bytes": 49, "val_count": 1}
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         | \xf66f891277617368696e67746f6e2064630002                                                             | \xffff                                                                                               |      284 | public      | user_promo_codes           |      111 | /Table/111/1/"washington dc"/PrefixEnd                                                       | /Table/112                                                                                   | \xf66f891277617368696e67746f6e2064630002                                                             | \xf670                                                                                               |                          0 |            4 | region=us-west1,az=a     | {1,4,8}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}         | {1,8,4}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 0, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
(178 rows)
~~~

#### Show ranges for a database (with tables)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH TABLES;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id | schema_name |         table_name         | table_id |                                       table_start_key                                        |                                        table_end_key                                         | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+-------------+----------------------------+----------+----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |      109 | public      | users                      |      106 | /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     | {2,4,9}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=d"}         | {2,9,4}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      178 | public      | users                      |      106 | /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      284 | public      | user_promo_codes           |      111 | /Table/111/1/"washington dc"/PrefixEnd                                                       | /Table/112                                                                                   | {1,4,8}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}         | {1,8,4}         | {}                  | {}               | NULL
(178 rows)
~~~

#### Show ranges for a database (with indexes)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH INDEXES;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id | schema_name |         table_name         | table_id |                  index_name                   | index_id |                                       index_start_key                                        |                                        index_end_key                                         | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+-------------+----------------------------+----------+-----------------------------------------------+----------+----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |      109 | public      | users                      |      106 | users_pkey                                    |        1 | /Table/106/1                                                                                 | /Table/106/1/"amsterdam"                                                                     | {2,4,9}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=d"}         | {2,9,4}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      178 | public      | users                      |      106 | users_pkey                                    |        1 | /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      284 | public      | user_promo_codes           |      111 | user_promo_codes_pkey                         |        1 | /Table/111/1/"washington dc"/PrefixEnd                                                       | /Table/111/2                                                                                 | {1,4,8}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}         | {1,8,4}         | {}                  | {}               | NULL
(179 rows)
~~~

#### Show ranges for a database (with details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH DETAILS;
~~~

~~~
                                           start_key                                           |                                           end_key                                            | range_id |       range_size_mb        | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size |                                                                                                              span_stats
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+----------+----------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     |      109 |                          0 |            2 | region=us-east1,az=c     | {2,4,9}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=d"}         | {2,9,4}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 42328, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 1025, "sys_count": 7, "val_bytes": 0, "val_count": 0}
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      178 |  0.00010300000000000000000 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL                       |        103 | {"approximate_disk_bytes": 48533, "intent_bytes": 0, "intent_count": 0, "key_bytes": 54, "key_count": 1, "live_bytes": 103, "live_count": 1, "sys_bytes": 2190, "sys_count": 7, "val_bytes": 49, "val_count": 1}
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         |      284 |                          0 |            4 | region=us-west1,az=a     | {1,4,8}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}         | {1,8,4}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 0, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 1144, "sys_count": 7, "val_bytes": 0, "val_count": 0}
(175 rows)
~~~

#### Show ranges for a database (with keys)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM DATABASE movr WITH KEYS;
~~~

~~~
                                           start_key                                           |                                           end_key                                            |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
-----------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  /Table/106                                                                                   | /Table/106/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      109 | {2,4,9}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=d"}         | {2,9,4}         | {}                  | {}               | NULL
  /Table/106/1/"amsterdam"                                                                     | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      178 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  /Table/111/1/"washington dc"/PrefixEnd                                                       | /Max                                                                                         | \xf66f891277617368696e67746f6e2064630002                                                             | \xffff                                                                                               |      284 | {1,4,8}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}         | {1,8,4}         | {}                  | {}               | NULL
(175 rows)
~~~

#### SQL query to get database size

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW RANGES FROM DATABASE movr WITH DETAILS)
SELECT 'movr' AS database_name, SUM(CAST(span_stats->'live_bytes' AS INT)) AS database_size_bytes FROM x;
~~~

~~~
  database_name | database_size_bytes
----------------+----------------------
  movr          |              976458
(1 row)
~~~

### Show ranges for a table

- [Show ranges for a table (without options)](#show-ranges-for-a-table-without-options)
- [Show ranges for a table (with indexes, keys, details)](#show-ranges-for-a-table-with-indexes-keys-details)
- [Show ranges for a table (with indexes)](#show-ranges-for-a-table-with-indexes)
- [Show ranges for a table (with details)](#show-ranges-for-a-table-with-details)
- [Show ranges for a table (with keys)](#show-ranges-for-a-table-with-keys)
- [SQL query to get table size](#sql-query-to-get-table-size)

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
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     |      178 | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      181 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  …/1/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                    |       94 | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL
(27 rows)
~~~

#### Show ranges for a table (with indexes, keys, details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users with INDEXES, KEYS, DETAILS;
~~~

~~~
                                       start_key                                      |                                       end_key                                       |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id | index_name | index_id |                                   index_start_key                                   |                                    index_end_key                                    |                                         raw_index_start_key                                          |                                          raw_index_end_key                                           |       range_size_mb       | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size |                                                                                                     span_stats
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+------------+----------+-------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+---------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      178 | users_pkey |        1 | …/1                                                                                 | …/1/"amsterdam"                                                                     | \xf289                                                                                               | \xf28912616d7374657264616d0001                                                                       |                         0 |            2 | region=us-east1,az=c     | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 42077, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      181 | users_pkey |        1 | …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   | 0.00011300000000000000000 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL                       |        113 | {"approximate_disk_bytes": 40626, "intent_bytes": 0, "intent_count": 0, "key_bytes": 54, "key_count": 1, "live_bytes": 113, "live_count": 1, "sys_bytes": 1698, "sys_count": 7, "val_bytes": 59, "val_count": 1}
  ...
  …/1/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                    | \xf2891277617368696e67746f6e2064630002                                                               | \xf38912616d7374657264616d0001                                                                       |       94 | users_pkey |        1 | …/1/"washington dc"/PrefixEnd                                                       | …/2                                                                                 | \xf2891277617368696e67746f6e2064630002                                                               | \xf28a                                                                                               |                         0 |            5 | region=us-west1,az=b     | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 42077, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
(27 rows)
~~~

#### Show ranges for a table (with indexes)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users WITH INDEXES;
~~~

~~~
                                       start_key                                      |                                       end_key                                       | range_id | index_name | index_id |                                   index_start_key                                   |                                    index_end_key                                    | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+----------+------------+----------+-------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     |      178 | users_pkey |        1 | …/1                                                                                 | …/1/"amsterdam"                                                                     | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      181 | users_pkey |        1 | …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  …/1/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                    |       94 | users_pkey |        1 | …/1/"washington dc"/PrefixEnd                                                       | …/2                                                                                 | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL
(27 rows)
~~~

#### Show ranges for a table (with details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM TABLE movr.users WITH DETAILS;
~~~

~~~
                                       start_key                                      |                                       end_key                                       | range_id |       range_size_mb       | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size |                                                                                                     span_stats
--------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------+----------+---------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     |      178 |                         0 |            2 | region=us-east1,az=c     | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 44716, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 919, "sys_count": 5, "val_bytes": 0, "val_count": 0}
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |      181 | 0.00011300000000000000000 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL                       |        113 | {"approximate_disk_bytes": 42734, "intent_bytes": 0, "intent_count": 0, "key_bytes": 54, "key_count": 1, "live_bytes": 113, "live_count": 1, "sys_bytes": 1698, "sys_count": 7, "val_bytes": 59, "val_count": 1}
  ...
  …/1/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                    |       94 |                         0 |            5 | region=us-west1,az=b     | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 44716, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 794, "sys_count": 5, "val_bytes": 0, "val_count": 0}
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
  …/<TableMin>                                                                        | …/1/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |      178 | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL
  …/1/"amsterdam"                                                                     | …/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |      181 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,9,7}         | {}                  | {}               | NULL
  ...
  …/1/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                    | \xf2891277617368696e67746f6e2064630002                                                               | \xf38912616d7374657264616d0001                                                                       |       94 | {2,5,7}  | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=b"}         | {2,7,5}         | {}                  | {}               | NULL
(27 rows)
~~~

#### SQL query to get table size

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW RANGES FROM TABLE movr.users WITH DETAILS)
SELECT 'movr.users' AS table_name, SUM(CAST(span_stats->'live_bytes' AS INT)) AS table_size_bytes FROM x;
~~~

~~~
  table_name | table_size_bytes
-------------+-------------------
  movr.users |             5578
(1 row)
~~~

### Show ranges for an index

- [Show ranges for an index (without options)](#show-ranges-for-an-index-without-options)
- [Show ranges for an index (with keys, details)](#show-ranges-for-an-index-with-keys-details)
- [Show ranges for an index (with details)](#show-ranges-for-an-index-with-details)
- [Show ranges for an index (with keys)](#show-ranges-for-an-index-with-keys)
- [SQL query to get index size](#sql-query-to-get-index-size)

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
  …/TableMin                                                                        | …/"amsterdam"                                                                     |       72 | {3,5,8}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=c"}         | {3,5,8}         | {}                  | {}               | NULL
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       73 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,7,9}         | {}                  | {}               | NULL
  ...
  …/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                  |       96 | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

#### Show ranges for an index (with keys, details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX movr.users_pkey WITH KEYS, DETAILS;
~~~

~~~
                                      start_key                                     |                                      end_key                                      |                                            raw_start_key                                             |                                             raw_end_key                                              | range_id |       range_size_mb       | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size |                                                                                                     span_stats
------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------+---------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  …/TableMin                                                                        | …/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |       72 |                         0 |            3 | region=us-east1,az=d     | {3,5,8}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=c"}         | {3,5,8}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 46895, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |       73 | 0.00010500000000000000000 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,7,9}         | {}                  | {}               | NULL                       |        105 | {"approximate_disk_bytes": 44545, "intent_bytes": 0, "intent_count": 0, "key_bytes": 54, "key_count": 1, "live_bytes": 105, "live_count": 1, "sys_bytes": 2172, "sys_count": 7, "val_bytes": 51, "val_count": 1}
  ...
  …/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                  | \xf2891277617368696e67746f6e2064630002                                                               | \xf38912616d7374657264616d0001                                                                       |       96 |                         0 |            2 | region=us-east1,az=c     | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 49218, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
(27 rows)
~~~

#### Show ranges for an index (with details)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX movr.users_pkey WITH DETAILS;
~~~

~~~
                                      start_key                                     |                                      end_key                                      | range_id |       range_size_mb       | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities                                 | voting_replicas | non_voting_replicas | learner_replicas |    split_enforced_until    | range_size |                                                                                                     span_stats
------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+----------+---------------------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+-----------------+---------------------+------------------+----------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  …/TableMin                                                                        | …/"amsterdam"                                                                     |       72 |                         0 |            3 | region=us-east1,az=d     | {3,5,8}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=c"}         | {3,5,8}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 46895, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       73 | 0.00010500000000000000000 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,7,9}         | {}                  | {}               | NULL                       |        105 | {"approximate_disk_bytes": 44545, "intent_bytes": 0, "intent_count": 0, "key_bytes": 54, "key_count": 1, "live_bytes": 105, "live_count": 1, "sys_bytes": 2172, "sys_count": 7, "val_bytes": 51, "val_count": 1}
  ...
  …/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                  |       96 |                         0 |            2 | region=us-east1,az=c     | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL                       |          0 | {"approximate_disk_bytes": 49218, "intent_bytes": 0, "intent_count": 0, "key_bytes": 0, "key_count": 0, "live_bytes": 0, "live_count": 0, "sys_bytes": 0, "sys_count": 0, "val_bytes": 0, "val_count": 0}
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
  …/TableMin                                                                        | …/"amsterdam"                                                                     | \xf2                                                                                                 | \xf28912616d7374657264616d0001                                                                       |       72 | {3,5,8}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=c"}         | {3,5,8}         | {}                  | {}               | NULL
  …/"amsterdam"                                                                     | …/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | \xf28912616d7374657264616d0001                                                                       | \xf28912616d7374657264616d000112b333333333334000ff8000ff00ff00ff00ff00ff00ff230001                   |       73 | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,7,9}         | {}                  | {}               | NULL
  ...
  …/"washington dc"/PrefixEnd                                                       | <after:/Table/107/1/"amsterdam">                                                  | \xf2891277617368696e67746f6e2064630002                                                               | \xf38912616d7374657264616d0001                                                                       |       96 | {2,4,7}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=b"}         | {2,4,7}         | {}                  | {}               | NULL
(27 rows)
~~~

#### SQL query to get index size

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW RANGES FROM INDEX movr.users_pkey WITH DETAILS)
SELECT 'movr.users_pkey' AS index_name, SUM(CAST(span_stats->'live_bytes' AS INT)) AS index_size_bytes FROM x;
~~~

~~~
    index_name    | index_size_bytes
------------------+-------------------
  movr.users_pkey |             5578
(1 row)
~~~

### Video Demo

For a deep dive demo on ranges and how data is stored within them, watch the following video:

{% include_cached youtube.html video_id="BVqnI4tnLA8" %}

## See also

- [`SHOW RANGE ... FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %})
- [`ALTER TABLE ... SPLIT AT`]({% link {{ page.version.version }}/alter-table.md %}#split-at)
- [`ALTER INDEX ... SPLIT AT`]({% link {{ page.version.version }}/alter-index.md %}#split-at)
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %})
- [Indexes]({% link {{ page.version.version }}/indexes.md %})
- [Partitioning tables]({% link {{ page.version.version }}/partitioning.md %})
- [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %})
