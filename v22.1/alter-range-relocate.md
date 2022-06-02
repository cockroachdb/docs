---
title: ALTER RANGE ... RELOCATE
summary: Use the ALTER RANGE ... RELOCATE statement to move a lease or replica between stores in an emergency situation.
toc: true
docs_area: reference.sql
---

<span class="version-tag">New in v22.1:</span> The `ALTER RANGE ... RELOCATE` statement is a subcommand of [`ALTER RANGE`](alter-range.html). It is used to move a lease or [replica](architecture/overview.html#architecture-replica) between [stores](cockroach-start.html#store). This is helpful in an emergency situation to relocate data in the cluster.

{{site.data.alerts.callout_danger}}
Most users should not need to use this statement; it is for use in emergency situations. If you are in an emergency situation where you think using this statement may help, Cockroach Labs recommends contacting [support](support-resources.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{{site.data.alerts.callout_info}}
If you prefer to use a key based approach to relocating replicas and leases, see the experimental [`ALTER TABLE ... EXPERIMENTAL_RELOCATE`](experimental-features.html#relocate-leases-and-replicas) statement.
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/alter_range_relocate.html %}
</div>

## Required privileges

To alter a range and move a lease or replica between stores, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#admin-role) role for the cluster.

## Examples

### Find the cluster store IDs

To use `ALTER RANGE ... RELOCATE`, you will need to know your cluster's store IDs. To get the store IDs, run the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT store_id FROM crdb_internal.kv_store_status;
~~~

~~~
 store_id
-----------
       1
       2
       3
       4
       5
       6
       7
       8
       9
(9 rows)
~~~

### Find range ID and leaseholder information

To use `ALTER RANGE ... RELOCATE`, you need to know how to find the range ID, leaseholder, and other information for a [table](show-ranges.html#show-ranges-for-a-table-primary-index), [index](show-ranges.html#show-ranges-for-an-index), or [database](show-ranges.html#show-ranges-for-a-database). You can find this information using the [`SHOW RANGES`](show-ranges.html) statement.

For example, to get all range IDs, leaseholder store IDs, and leaseholder localities for the [`movr.users`](movr.html) table, use the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH user_info AS (SHOW RANGES FROM TABLE users) SELECT range_id, lease_holder, lease_holder_locality FROM user_info;
~~~

~~~
  range_id | lease_holder |  lease_holder_locality
-----------+--------------+---------------------------
        70 |            3 | region=us-east1,az=d
        67 |            9 | region=europe-west1,az=d
        66 |            3 | region=us-east1,az=d
        65 |            3 | region=us-east1,az=d
        69 |            3 | region=us-east1,az=d
        45 |            2 | region=us-east1,az=c
        50 |            2 | region=us-east1,az=c
        46 |            2 | region=us-east1,az=c
        49 |            2 | region=us-east1,az=c
(9 rows)
~~~

<!-- WITH user_info AS (SHOW RANGES FROM TABLE users) SELECT range_id, lease_holder, lease_holder_locality FROM user_info WHERE lease_holder_locality::STRING ~ "region=us-.+"; -->

### Move the lease for a range to a specified store

To move the lease for range ID 70 to store ID 4:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER RANGE 70 RELOCATE LEASE TO 4;
~~~

~~~
  range_id |   pretty   | result
-----------+------------+---------
        70 | /Table/106 | ok
(1 row)
~~~

### Move the lease for all of a table's ranges to a store

To move the leases for all data in the [`movr.users`](movr.html) table to a specific store:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER RANGE RELOCATE LEASE TO 2 FOR SELECT range_id from crdb_internal.ranges where table_name = 'users'
~~~

~~~
  range_id |                                            pretty                                            |                                                                                                                                                result
-----------+----------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        70 | /Table/106                                                                                   | unable to find store 2 in range r70:/Table/106{-/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"} [(n7,s7):1, (n3,s3):4, (n4,s4):5, next=6, gen=27]
        67 | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | unable to find store 2 in range r67:/Table/106/1/"{amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"-boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"} [(n3,s3):4, (n9,s9):6, (n6,s6):7, next=8, gen=34, sticky=9223372036.854775807,2147483647]
        66 | /Table/106/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | unable to find store 2 in range r66:/Table/106/1/"{boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"-los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"} [(n7,s7):1, (n3,s3):4, (n4,s4):5, next=6, gen=25, sticky=9223372036.854775807,2147483647]
        65 | /Table/106/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | unable to find store 2 in range r65:/Table/106/1/"{los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"-new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"} [(n7,s7):1, (n3,s3):4, (n4,s4):5, next=6, gen=25, sticky=9223372036.854775807,2147483647]
        69 | /Table/106/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | unable to find store 2 in range r69:/Table/106/1/"{new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"-paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("} [(n9,s9):5, (n3,s3):4, (n4,s4):3, next=6, gen=29, sticky=9223372036.854775807,2147483647]
        45 | /Table/106/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | ok
        50 | /Table/106/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | ok
        46 | /Table/106/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | ok
        49 | /Table/106/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | ok
(9 rows)
~~~

When it isn't possible to move a lease for a range to the specified store, the `result` column will show the message `unable to find store ...` as shown above.

### Move a replica from one store to another store

If you know the store where a range's replica is located, you can move it to another store:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER RANGE 45 RELOCATE FROM 2 to 4;
~~~

~~~
  range_id |                                      pretty                                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                  result
-----------+-----------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        45 | /Table/106/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00(" | removing learners from r45:/Table/106/1/"{paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("-san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19"} [(n2,s2):1LEARNER, (n8,s8):2, (n5,s5):3, (n4,s4):4, next=5, gen=14, sticky=9223372036.854775807,2147483647]: change replicas of r45 failed: descriptor changed: [expected] r45:/Table/106/1/"{paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("-san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19"} [(n2,s2):1LEARNER, (n8,s8):2, (n5,s5):3, (n4,s4):4, next=5, gen=14, sticky=9223372036.854775807,2147483647] != [actual] r45:/Table/106/1/"{paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("-san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19"} [(n4,s4):4, (n8,s8):2, (n5,s5):3, next=5, gen=15, sticky=9223372036.854775807,2147483647]
(1 row)
~~~

### Move all of a table's replicas on one store to another store

To move the replicas for all data in the [`movr.users`](movr.html) table on one store to another store:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER RANGE RELOCATE FROM 2 TO 7 FOR SELECT range_id from crdb_internal.ranges where table_name = 'users';
~~~

~~~
  range_id |                                            pretty                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                          result
-----------+----------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        70 | /Table/106                                                                                   | trying to add a voter to a store that already has a VOTER_FULL
        67 | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_VOTER Target:n2,s2}
        66 | /Table/106/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | trying to add a voter to a store that already has a VOTER_FULL
        65 | /Table/106/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | trying to add a voter to a store that already has a VOTER_FULL
        69 | /Table/106/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_VOTER Target:n2,s2}
        45 | /Table/106/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_VOTER Target:n2,s2}
        50 | /Table/106/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | change replicas of r50 failed: descriptor changed: [expected] r50:/Table/106/1/"s{an francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19"-eattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"} [(n2,s2):1, (n8,s8):2, (n5,s5):3, (n7,s7):4LEARNER, next=5, gen=12, sticky=9223372036.854775807,2147483647] != [actual] r50:/Table/106/1/"s{an francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19"-eattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"} [(n2,s2):1, (n8,s8):2, (n5,s5):3, next=5, gen=13, sticky=9223372036.854775807,2147483647]
        46 | /Table/106/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | removing learners from r46:/Table/106/1/"{seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"-washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"} [(n2,s2):1LEARNER, (n8,s8):2, (n5,s5):3, (n7,s7):4, next=5, gen=14, sticky=9223372036.854775807,2147483647]: change replicas of r46 failed: descriptor changed: [expected] r46:/Table/106/1/"{seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"-washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"} [(n2,s2):1LEARNER, (n8,s8):2, (n5,s5):3, (n7,s7):4, next=5, gen=14, sticky=9223372036.854775807,2147483647] != [actual] r46:/Table/106/1/"{seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"-washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"} [(n7,s7):4, (n8,s8):2, (n5,s5):3, next=5, gen=15, sticky=9223372036.854775807,2147483647]
        49 | /Table/106/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | ok
(9 rows)
~~~

See the `result` column in the output for the status of the operation. If it's `ok`, the replica was moved with no issues. Other messages will indicate whether the target store is already full (`VOTER_FULL`), or if the replica you're trying to remove doesn't exist.

### Move all of a range's voting replicas from one store to another store

To move all of a range's voting replicas from one store to another store:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER RANGE RELOCATE VOTERS FROM 7 TO 2 FOR SELECT range_id from crdb_internal.ranges where table_name = 'users';
~~~

~~~
  range_id |                                            pretty                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                       result
-----------+----------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        70 | /Table/106                                                                                   | ok
        67 | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_VOTER Target:n7,s7}
        66 | /Table/106/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | removing learners from r66:/Table/106/1/"{boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"-los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"} [(n7,s7):1LEARNER, (n3,s3):4, (n4,s4):5, (n2,s2):6, next=7, gen=28, sticky=9223372036.854775807,2147483647]: change replicas of r66 failed: descriptor changed: [expected] r66:/Table/106/1/"{boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"-los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"} [(n7,s7):1LEARNER, (n3,s3):4, (n4,s4):5, (n2,s2):6, next=7, gen=28, sticky=9223372036.854775807,2147483647] != [actual] r66:/Table/106/1/"{boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"-los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"} [(n2,s2):6, (n3,s3):4, (n4,s4):5, next=7, gen=29, sticky=9223372036.854775807,2147483647]
        65 | /Table/106/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | ok
        69 | /Table/106/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_VOTER Target:n7,s7}
        45 | /Table/106/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_VOTER Target:n7,s7}
        50 | /Table/106/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | trying to add a voter to a store that already has a VOTER_FULL
        46 | /Table/106/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | trying to add a voter to a store that already has a VOTER_FULL
        49 | /Table/106/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | trying to add a voter to a store that already has a VOTER_FULL
(9 rows)
~~~

See the `result` column in the output for the status of the operation. If it's `ok`, the replica was moved with no issues. Other messages will indicate whether the target store is already full (`VOTER_FULL`), or if the replica you're trying to remove doesn't exist.

### Move all of a range's non-voting replicas from one store to another store

To move a range's [non-voting replicas](architecture/replication-layer.html#non-voting-replicas), use the statement below.

{{site.data.alerts.callout_info}}
This statement will only have an effect on clusters that have non-voting replicas configured, such as [multiregion clusters](multiregion-overview.html). If your cluster is not a multiregion cluster, it doesn't do anything, and will display errors in the `result` field as shown below.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER RANGE RELOCATE NONVOTERS FROM 7 TO 2 FOR SELECT range_id from crdb_internal.ranges where table_name = 'users';
~~~

~~~
  range_id |                                            pretty                                            |                                                            result
-----------+----------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------
        70 | /Table/106                                                                                   | type of replica being removed (VOTER_FULL) does not match expectation for change: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        67 | /Table/106/1/"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        66 | /Table/106/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | type of replica being removed (VOTER_FULL) does not match expectation for change: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        65 | /Table/106/1/"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | type of replica being removed (VOTER_FULL) does not match expectation for change: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        69 | /Table/106/1/"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        45 | /Table/106/1/"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        50 | /Table/106/1/"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        46 | /Table/106/1/"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
        49 | /Table/106/1/"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | trying to remove a replica that doesn't exist: {ChangeType:REMOVE_NON_VOTER Target:n7,s7}
(9 rows)
~~~

## See also

- [`ALTER RANGE`](alter-range.html)
- [`SHOW RANGES`](show-ranges.html)
- [`SHOW RANGE FOR ROW`](show-range-for-row.html)
- [Troubleshoot cluster setup](cluster-setup-troubleshooting.html)
- [Replication Layer](architecture/replication-layer.html)
- [Multiregion Capabilities Overview](multiregion-overview.html)
- [SQL Statements](sql-statements.html)
