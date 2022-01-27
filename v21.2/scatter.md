---
title: SCATTER
summary: The SCATTER statement redistributes the leaseholders.
toc: true
---

The `SCATTER` [statement](sql-statements.html) runs a specified set of ranges for a table or index through the [replication](architecture/replication-layer.html) queue. If a lot of ranges have been created recently, the replication queue may transfer some leases to other replicas to balance the load across the cluster. Some leaseholders may not update as a result of this command.

{{site.data.alerts.callout_info}}
`SCATTER` has the potential to result in data movement proportional in size to the size of the table or index being scattered, thus taking additional time and resources to complete.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/alter_scatter.html %}
</div>
<br/>
<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/alter_scatter_index.html %}
</div>

## Required privileges

The user must have the `INSERT` [privilege](authorization.html#assign-privileges) on the table or index.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table that you want to scatter.
 `table_index_name` | The name of the index that you want to scatter.
 `expr_list` | A list of [scalar expressions](scalar-expressions.html) in the form of the primary key of the table or the specified index.

## Examples

{% include {{page.version.version}}/sql/movr-statements-partitioning.md %}

### Scatter an entire table

The `crdb_internal.ranges` view contains information about ranges in your CockroachDB cluster. The below command shows each of the ranges on the `users` table and their associated leaseholder and replicas:

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, lease_holder, replicas FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          | lease_holder | replicas
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------+-----------
        44 | /Table/53                                                                                   | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |            8 | {1,6,8}
        53 | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |            8 | {3,6,8}
        52 | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |            8 | {3,4,8}
        51 | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |            8 | {3,6,8}
        66 | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |            8 | {1,6,8}
        50 | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |            8 | {2,5,8}
        67 | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |            5 | {2,5,8}
        64 | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |            5 | {3,5,8}
        65 | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | /Table/54                                                                                   |            8 | {1,5,8}
(9 rows)
~~~

Node 8 seems to be used more heavily than the rest of the nodes. You can `SCATTER` the table to rebalance all ranges:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SCATTER;
~~~
~~~
                                                                             key                                                                             |                                           pretty
-------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------
  \xbd                                                                                                                                                       | /Table/53
  \xbd\x89\x12amsterdam\x00\x01\x12\xb333333@\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff#\x00\x01                                           | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"
  \xbd\x89\x12boston\x00\x01\x12333333D\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\n\x00\x01                                                | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"
  \xbd\x89\x12los angeles\x00\x01\x12\x99\x99\x99\x99\x99\x99H\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x1e\x00\x01                       | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"
  \xbd\x89\x12new york\x00\x01\x12\x19\x99\x99\x99\x99\x99J\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x05\x00\x01                          | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"
  \xbd\x89\x12paris\x00\x01\x12\xcc\xcc\xcc\xcc\xcc\xcc@\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff(\x00\x01                                | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("
  \xbd\x89\x12san francisco\x00\x01\x12\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff@\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x19\x00\x01 | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19"
  \xbd\x89\x12seattle\x00\x01\x12ffffffH\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x14\x00\x01                                             | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"
  \xbd\x89\x12washington dc\x00\x01\x12L\xcc\xcc\xcc\xcc\xccL\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x0f\x00\x01                        | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"
(9 rows)
~~~

The leaseholders should now be updated ranges in the `crdb_internal.ranges` view:

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, lease_holder, replicas FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
range_id |                                        start_pretty                                         |                                         end_pretty                                          | lease_holder | replicas
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------+-----------
      44 | /Table/53                                                                                   | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |            1 | {1,6,8}
      53 | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |            3 | {3,6,8}
      52 | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |            4 | {3,4,8}
      51 | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |            3 | {3,6,8}
      66 | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |            1 | {1,6,8}
      50 | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |            8 | {2,5,8}
      67 | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |            8 | {2,5,8}
      64 | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |            5 | {3,5,8}
      65 | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | /Table/54                                                                                   |            5 | {1,5,8}
(9 rows)
~~~

### Scatter a set of ranges in a table

In the above example, we see that node 6 is underutilized. You can attempt to set it as a leaseholder by running `SCATTER` over a set of range ranges where node 6 is a replica:


{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SCATTER FROM ('new york') TO ('paris');
~~~
~~~
                                                                  key                                                                  |                                          pretty
---------------------------------------------------------------------------------------------------------------------------------------+--------------------------------------------------------------------------------------------
  \xbd\x89\x12los angeles\x00\x01\x12\x99\x99\x99\x99\x99\x99H\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x1e\x00\x01 | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"
  \xbd\x89\x12new york\x00\x01\x12\x19\x99\x99\x99\x99\x99J\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x05\x00\x01    | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, lease_holder, replicas FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
range_id |                                        start_pretty                                         |                                         end_pretty                                          | lease_holder | replicas
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------+-----------
      44 | /Table/53                                                                                   | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |            1 | {1,6,8}
      53 | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |            3 | {3,6,8}
      52 | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |            4 | {3,4,8}
      51 | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |            6 | {3,6,8}
      66 | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |            6 | {1,6,8}
      50 | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |            8 | {2,5,8}
      67 | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |            8 | {2,5,8}
      64 | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |            5 | {3,5,8}
      65 | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | /Table/54                                                                                   |            5 | {1,5,8}
(9 rows)
~~~

The leaseholders of the `new york` and `paris` ranges updated to node 6.

It is also possible to pass in cells of data ordered by the primary index in the `FROM` and `TO` clauses for more fine-tuned control:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SCATTER FROM ('amsterdam', 'ae147ae1-47ae-4800-8000-000000000022') TO ('los angeles', '99999999-9999-4800-8000-00000000001e');
~~~
~~~
                                                        key                                                        |                                pretty
-------------------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------
  \xbd                                                                                                             | /Table/53
  \xbd\x89\x12amsterdam\x00\x01\x12\xb333333@\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff#\x00\x01 | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"
  \xbd\x89\x12boston\x00\x01\x12333333D\x00\xff\x80\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\n\x00\x01      | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"
(3 rows)
~~~
{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, lease_holder, replicas FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          | lease_holder | replicas
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------+-----------
        44 | /Table/53                                                                                   | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |            8 | {1,6,8}
        53 | /Table/53/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |            6 | {3,6,8}
        52 | /Table/53/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |            8 | {3,4,8}
        51 | /Table/53/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |            6 | {3,6,8}
        66 | /Table/53/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |            6 | {1,6,8}
        50 | /Table/53/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |            8 | {2,5,8}
        67 | /Table/53/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |            8 | {2,5,8}
        64 | /Table/53/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |            5 | {3,5,8}
        65 | /Table/53/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | /Table/54                                                                                   |            5 | {1,5,8}
(9 rows)
~~~

### Scatter an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column, then view the ranges to see the index has been added:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~
{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, lease_holder, replicas, index_name FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          | lease_holder | replicas | index_name
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------+----------+--------------
        46 | /Table/55                                                                                   | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        |            1 | {1,6,9}  |
        61 | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 |            3 | {3,6,9}  |
        60 | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             |            3 | {3,6,9}  |
        59 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                |            2 | {2,5,9}  |
       115 | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               |            2 | {2,4,9}  |
        58 | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" |            2 | {2,6,9}  |
       116 | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  |            2 | {2,6,9}  |
       114 | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          |            9 | {2,6,9}  |
       124 | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | /Table/55/4                                                                                 |            9 | {2,5,9}  |
       117 | /Table/55/4                                                                                 | /Table/56                                                                                   |            9 | {2,5,9}  | revenue_idx
(10 rows)
~~~

`SCATTER` the index:


{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx SCATTER;
~~~
~~~
    key    |   pretty
-----------+--------------
  \xbf\x8c | /Table/55/4
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, lease_holder, replicas, index_name FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          | lease_holder | replicas | index_name
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------+----------+--------------
        46 | /Table/55                                                                                   | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        |            1 | {1,6,9}  |
        61 | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 |            3 | {3,6,9}  |
        60 | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             |            3 | {3,6,9}  |
        59 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                |            2 | {2,5,9}  |
       115 | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               |            2 | {2,4,9}  |
        58 | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" |            2 | {2,6,9}  |
       116 | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  |            2 | {2,6,9}  |
       114 | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          |            9 | {2,6,9}  |
       124 | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | /Table/55/4                                                                                 |            9 | {2,5,9}  |
       117 | /Table/55/4                                                                                 | /Table/56                                                                                   |            5 | {2,5,9}  | revenue_idx
(10 rows)
~~~

The leaseholder of the index is now node 5.

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER INDEX`](alter-index.html)
- [Replication Layer](architecture/replication-layer.html)
- [SQL Statements](sql-statements.html)
