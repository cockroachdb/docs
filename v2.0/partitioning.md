---
title: Define Table Partitions
summary: Partitioning is an enterprise feature that gives you row-level control of how and where your data is stored.
toc: true
---

<span class="version-tag">New in v2.0</span> CockroachDB allows you to define table partitions, thus giving you row-level control of how and where your data is stored. Partitioning enables you to reduce latencies and costs and can assist in meeting regulatory requirements for your data.

{{site.data.alerts.callout_info}}Table partitioning is an <a href="enterprise-licensing.html">enterprise-only</a> feature.{{site.data.alerts.end}}


## Why Use Table Partitioning

Table partitioning helps you reduce latency and cost:

- **Geo-partitioning** allows you to keep user data close to the user, which reduces the distance that the data needs to travel, thereby **reducing latency**. To geo-partition a table, define location-based partitions while creating a table, create location-specific zone configurations, and apply the zone configurations to the corresponding partitions.
- **Archival-partitioning** allows you to store infrequently-accessed data on slower and cheaper storage, thereby **reducing costs**. To archival-partition a table, define frequency-based partitions while creating a table, create frequency-specific zone configurations with appropriate storage devices constraints, and apply the zone configurations to the corresponding partitions.

## How It Works

Table partitioning involves a combination of CockroachDB features:

- [Node Attributes](#node-attributes)
- [Enterprise License](#enterprise-license)
- [Table Creation](#table-creation)
- [Replication Zones](#replication-zones)

### Node Attributes

To store partitions in specific locations (e.g., geo-partitioning), or on machines with specific attributes (e.g., archival-partitioning), the nodes of your cluster must be [started](start-a-node.html) with the relevant flags:

- Use the `--locality` flag to assign key-value pairs that describe the location of a node, for example, `--locality=region=east,datacenter=us-east-1`.
- Use the `--attrs` flag to specify node capability, which might include specialized hardware or number of cores, for example, `--attrs=ram:64gb`.
- Use the `attrs` field of the `--store` flag to specify disk type or capability, for example,`--store=path=/mnt/ssd01,attrs=ssd`.

For more details about these flags, see the [`cockroach start`](start-a-node.html) documentation.

### Enterprise License

You must have a valid enterprise license to use table partitioning features. For details about requesting and setting a trial or full enterprise license, see [Enterprise Licensing](enterprise-licensing.html).

Note that the following features do not work with an **expired license**:

- Creating new table partitions or adding new zone configurations for partitions
- Changing the partitioning scheme on any table or index
- Changing the zone config for a partition

However, the following features continue to work even with an expired enterprise license:

- Querying a partitioned table (for example, `SELECT foo PARTITION`)
- Inserting or updating data in a partitioned table
- Dropping a partitioned table
- Unpartitioning a partitioned table
- Making non-partitioning changes to a partitioned table (for example, adding a column/index/foreign key/check constraint)

### Table Creation

You can define partitions and subpartitions over one or more columns of a table. During [table creation](create-table.html), you declare which values belong to each partition in one of two ways:

- **List partitioning**: Enumerate all possible values for each partition. List partitioning is a good choice when the number of possible values is small. List partitioning is well-suited for geo-partitioning.
- **Range partitioning**: Specify a contiguous range of values for each partition by specifying lower and upper bounds. Range partitioning is a good choice when the number of possible values is too large to explicitly list out. Range partitioning is well-suited for archival-partitioning.

#### Partition by List

[`PARTITION BY LIST`](partition-by.html) lets you map one or more tuples to a partition.

To partition a table by list, use the [`PARTITION BY LIST`](partition-by.html) syntax while creating the table. While defining a list partition, you can also set the `DEFAULT` partition that acts as a catch-all if none of the rows match the requirements for the defined partitions.

See [Partition by List](#define-table-partitions-by-list) example below for more details.

#### Partition by Range

[`PARTITION BY RANGE`](partition-by.html) lets you map ranges of tuples to a partition.

To define a table partition by range, use the [`PARTITION BY RANGE`](partition-by.html) syntax while creating the table.  While defining a range partition, you can use CockroachDB-defined `MINVALUE` and `MAXVALUE` parameters to define the lower and upper bounds of the ranges respectively.

{{site.data.alerts.callout_info}}The lower bound of a range partition is inclusive, while the upper bound is exclusive. For range partitions, <code>NULL</code> is considered less than any other data, which is consistent with our key encoding ordering and <code>ORDER BY</code> behavior.{{site.data.alerts.end}}

Partition values can be any SQL expression, but it’s only evaluated once. If you create a partition with value `< (now() - '1d')` on 2017-01-30, it would be contain all values less than 2017-01-29. It would not update the next day, it would continue to contain values less than 2017-01-29.

See [Partition by Range](#define-table-partitions-by-range) example below for more details.

#### Partition using Primary Key

The primary key required for partitioning is different from the conventional primary key. To define the primary key for partitioning, prefix the unique identifier(s) in the primary key with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions.

For instance, consider the database of a global online learning portal that has a table for students of all the courses across the world. If you want to geo-partition the table based on the countries of the students, then the primary key needs to be defined as:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students (
    id INT DEFAULT unique_rowid(),
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,   
    PRIMARY KEY (country, id));
~~~

**Primary Key Considerations**

- For v2.0, you cannot change the primary key after you create the table. Provision for all future subpartitions by including those columns in the primary key. In the example of the online learning portal, if you think you might want to subpartition based on `expected_graduation_date` in the future, define the primary key as `(country, expected_graduation_date, id)`. v2.1 will allow you to change the primary key.
- The order in which the columns are defined in the primary key is important. The partitions and subpartitions need to follow that order. In the example of the online learning portal, if you define the primary key as `(country, expected_graduation_date, id)`, the primary partition is by `country`, and then subpartition is by `expected_graduation_date`. You can’t skip `country` and partition by `expected_graduation_date`.

#### Partition using Secondary Index

The primary key discussed above has two drawbacks:

- It does not enforce that the identifier column is globally unique.
- It does not provide fast lookups on the identifier.

To ensure uniqueness or fast lookups, create a unique, unpartitioned secondary index on the identifier.

Indexes can also be partitioned, but are not required to be. Each partition is required to have a name that is unique among all partitions on that table and its indexes. For example, the following `CREATE INDEX` scenario will fail because it reuses the name of a partition of the primary key:

~~~ sql
CREATE TABLE foo (a STRING PRIMARY KEY, b STRING) PARTITION BY LIST (a) (
    PARTITION bar VALUES IN ('bar'),
    PARTITION default VALUES IN (DEFAULT)
);
CREATE INDEX foo_b_idx ON foo (b) PARTITION BY LIST (b) (
    PARTITION baz VALUES IN ('baz'),
    PARTITION default VALUES IN (DEFAULT)
);
~~~

Consider using a naming scheme that uses the index name to avoid conflicts. For example, the partitions above could be named `primary_idx_bar`, `primary_idx_default`, `b_idx_baz`, `b_idx_default`.

#### Define Partitions on Interleaved Tables

For [interleaved tables](interleave-in-parent.html), partitions can be defined only on the root table of the interleave hierarchy, while children are interleaved the same as their parents.

### Replication Zones

On their own, partitions are inert and simply apply a label to the rows of the table that satisfy the criteria of the defined partitions. Applying functionality to a partition requires creating and applying [replication zone](configure-replication-zones.html) to the corresponding partitions.

CockroachDB uses the most granular zone config available. Zone configs that target a partition are considered more granular than those that target a table or index, which in turn are considered more granular than those that target a database.

## Examples

### Define Table Partitions by List

Consider a global online learning portal, RoachLearn, that has a database containing a table of students across the world. Suppose we have two datacenters: one in the United States and another in Australia. To reduce latency, we want to keep the students' data closer to their locations:

- We want to keep the data of the students located in the United States and Canada in the United States datacenter.
- We want to keep the data of students located in Australia and New Zealand in the Australian datacenter.

#### Step 1. Identify the partitioning method

We want to geo-partition the table to keep the students' data closer to their locations. We can achieve this by partitioning on `country` and using the `PARTITION BY LIST` syntax.

#### Step 2. Start each node with its datacenter location specified in the `--locality` flag

{% include_cached copy-clipboard.html %}
~~~ shell
# Start the node in the US datacenter:
$ cockroach start --insecure \
--locality=datacenter=us1  \
--store=node1 \
--host=<node1 hostname> \
--port=26257 \
--http-port=8080 \
--join=<node1 hostname>:26257,<node2 hostname>:26258
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# Start the node in the AUS datacenter:
$ cockroach start --insecure \
--locality=datacenter=au1 \
--store=node2 \
--host=<node2 hostname> \
--port=26258 \
--http-port=8081 \
--join=<node1 hostname>:26257,<node2 hostname>:26258
~~~

#### Step 3. Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key).

#### Step 4. Create a table with the appropriate partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students_by_list (
    id INT DEFAULT unique_rowid(),
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,   
    PRIMARY KEY (country, id))
    PARTITION BY LIST (country)
      (PARTITION north_america VALUES IN ('CA','US'),
      PARTITION australia VALUES IN ('AU','NZ'),
      PARTITION DEFAULT VALUES IN (default));
~~~

#### Step 5. Create and apply corresponding zone configurations

Create appropriate zone configurations:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > north_america.zone.yml
constraints: [+datacenter=us1]
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > australia.zone.yml
constraints: [+datacenter=au1]
~~~

Apply zone configurations to corresponding partitions:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students_by_list.north_america --insecure  -f north_america.zone.yml
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students_by_list.australia --insecure  -f australia.zone.yml
~~~

#### Step 6. Verify table partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE students_by_list;
~~~

You should see the following output:

~~~ sql
+-----------------+-----------------+----------+----------+--------------+
|    Start Key    |     End Key     | Range ID | Replicas | Lease Holder |
+-----------------+-----------------+----------+----------+--------------+
| NULL            | /"AU"           |      251 | {1,2,3}  |            1 |
| /"AU"           | /"AU"/PrefixEnd |      257 | {1,2,3}  |            1 |
| /"AU"/PrefixEnd | /"CA"           |      258 | {1,2,3}  |            1 |
| /"CA"           | /"CA"/PrefixEnd |      252 | {1,2,3}  |            1 |
| /"CA"/PrefixEnd | /"NZ"           |      253 | {1,2,3}  |            1 |
| /"NZ"           | /"NZ"/PrefixEnd |      256 | {1,2,3}  |            1 |
| /"NZ"/PrefixEnd | /"US"           |      259 | {1,2,3}  |            1 |
| /"US"           | /"US"/PrefixEnd |      254 | {1,2,3}  |            1 |
| /"US"/PrefixEnd | NULL            |      255 | {1,2,3}  |            1 |
+-----------------+-----------------+----------+----------+--------------+
(9 rows)

Time: 7.209032ms
~~~

### Define Table Partitions by Range

Suppose we want to store the data of current students on fast and expensive storage devices (e.g., SSD) and store the data of the graduated students on slower, cheaper storage devices (e.g., HDD).

#### Step 1. Identify the partitioning method

We want to archival-partition the table to keep newer data on faster devices and older data on slower devices. We can achieve this by partitioning the table by date and using the `PARTITION BY RANGE` syntax.

#### Step 2. Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key).

#### Step 3. Start each node with the appropriate storage device specified in the `--store` flag

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--store=path=/mnt/1,attrs=ssd \
--host=<node1 hostname> \
--port=26257 \
--http-port=8080 \
--join=<node1 hostname>:26257,<node2 hostname>:26258
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--store=path=/mnt/2,attrs=hdd \
--host=<node2 hostname> \
--port=26258 \
--http-port=8081 \
--join=<node1 hostname>:26257,<node2 hostname>:26258
~~~

#### Step 4. Create a table with the appropriate partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students_by_range (
   id INT DEFAULT unique_rowid(),
   name STRING,
   email STRING,                                                                                           
   country STRING,
   expected_graduation_date DATE,                                                                                      
   PRIMARY KEY (expected_graduation_date, id))
   PARTITION BY RANGE (expected_graduation_date)
      (PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE));
~~~

#### Step 5. Create and apply corresponding zone configurations

Create appropriate zone configurations:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > current.zone.yml
constraints: [+ssd]
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > graduated.zone.yml
constraints: [+hdd]
~~~

Apply zone configurations to corresponding partitions:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students_by_range.current --insecure  -f current.zone.yml
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students_by_range.graduated --insecure  -f graduated.zone.yml
~~~

#### Step 6. Verify table partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE students_by_range;
~~~

You should see the following output:

~~~ sql
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /17393  |      244 | {1,2,3}  |            1 |
| /17393    | NULL    |      242 | {1,2,3}  |            1 |
+-----------+---------+----------+----------+--------------+
(2 rows)

Time: 5.850903ms
~~~

### Define Subpartitions on a Table

A list partition can itself be partitioned, forming a subpartition. There is no limit on the number of levels of subpartitioning; that is, list partitions can be infinitely nested.

{{site.data.alerts.callout_info}}Range partitions cannot be subpartitioned.{{site.data.alerts.end}}

Going back to RoachLearn's scenario, suppose we want to do all of the following:

- Keep the students' data close to their location.
- Store the current students' data on faster storage devices.
- Store the graduated students' data on slower, cheaper storage devices (example: HDD).

#### Step 1. Identify the Partitioning method

We want to geo-partition as well as archival-partition the table. We can achieve this by partitioning the table first by location and then by date.

#### Step 2. Start each node with the appropriate storage device specified in the `--store` flag

Start a node in the US datacenter:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--host=<node1 hostname> \
--locality=datacenter=us1 \
--store=path=/mnt/1,attrs=ssd \
--store=path=/mnt/2,attrs=hdd \
~~~

Start a node in the AUS datacenter:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--host=<node2 hostname> \
--locality=datacenter=au1 \
--store=path=/mnt/3,attrs=ssd \
--store=path=/mnt/4,attrs=hdd \
--join=<node1 hostname>:26257
~~~

Initialize the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=<node1 hostname>
~~~

#### Step 3. Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key).

#### Step 4. Create a table with the appropriate partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students (
    id INT DEFAULT unique_rowid(),
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,
    PRIMARY KEY (country, expected_graduation_date, id))
    PARTITION BY LIST (country)(
        PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date)(PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'), PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)),
        PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date)(PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'), PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE))
    );
~~~

Subpartition names must be unique within a table. In our example, even though `graduated` and `current` are sub-partitions of distinct partitions, they still need to be uniquely named. Hence the names `graduated_au`, `graduated_us`, and `current_au` and `current_us`.

#### Step 5. Create and apply corresponding zone configurations

Create appropriate zone configurations:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > current_us.zone.yml
constraints: [+ssd,+datacenter=us1]
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > graduated_us.zone.yml
constraints: [+hdd,+datacenter=us1]
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > current_au.zone.yml
constraints: [+ssd,+datacenter=au1]
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > graduated_au.zone.yml
constraints: [+hdd,+datacenter=au1]
~~~

Apply zone configurations to corresponding partitions:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students.current_us --insecure -f current_us.zone.yml
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students.graduated_us --insecure -f graduated_us.zone.yml
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students.current_au --insecure -f current_au.zone.yml
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students.graduated_au --insecure -f graduated_au.zone.yml
~~~

#### Step 6. Verify table partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE students;
~~~

You should see the following output:

~~~ sql
+-----------------+-----------------+----------+----------+--------------+
|    Start Key    |     End Key     | Range ID | Replicas | Lease Holder |
+-----------------+-----------------+----------+----------+--------------+
| NULL            | /"AU"           |      260 | {1,2,3}  |            1 |
| /"AU"           | /"AU"/17393     |      268 | {1,2,3}  |            1 |
| /"AU"/17393     | /"AU"/PrefixEnd |      266 | {1,2,3}  |            1 |
| /"AU"/PrefixEnd | /"CA"           |      267 | {1,2,3}  |            1 |
| /"CA"           | /"CA"/17393     |      265 | {1,2,3}  |            1 |
| /"CA"/17393     | /"CA"/PrefixEnd |      261 | {1,2,3}  |            1 |
| /"CA"/PrefixEnd | /"NZ"           |      262 | {1,2,3}  |            3 |
| /"NZ"           | /"NZ"/17393     |      284 | {1,2,3}  |            3 |
| /"NZ"/17393     | /"NZ"/PrefixEnd |      282 | {1,2,3}  |            3 |
| /"NZ"/PrefixEnd | /"US"           |      283 | {1,2,3}  |            3 |
| /"US"           | /"US"/17393     |      281 | {1,2,3}  |            3 |
| /"US"/17393     | /"US"/PrefixEnd |      263 | {1,2,3}  |            1 |
| /"US"/PrefixEnd | NULL            |      264 | {1,2,3}  |            1 |
+-----------------+-----------------+----------+----------+--------------+
(13 rows)

Time: 11.586626ms
~~~

### Repartition a Table

Consider the partitioned table of students of RoachLearn. Suppose the table has been partitioned on range to store the current students on fast and expensive storage devices (example: SSD) and store the data of the graduated students on slower, cheaper storage devices(example: HDD). Now suppose we want to change the date after which the students will be considered current to `2018-08-15`. We can achieve this by using the [`PARTITION BY`](partition-by.html) subcommand of the [`ALTER TABLE`](alter-table.html) command.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE));
~~~

### Unpartition a Table

You can remove the partitions on a table by using the [`PARTITION BY NOTHING`](partition-by.html) syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~

## Locality–Resilience Tradeoff

There is a tradeoff between making reads/writes fast and surviving failures. Consider a partition with three replicas of `roachlearn.students` for Australian students.

- If only one replica is pinned to an Australian datacenter, then reads may be fast (via leases follow the workload) but writes will be slow.
- If two replicas are pinned to an Australian datacenter, then reads and writes will be fast (as long as the cross-ocean link has enough bandwidth that the third replica doesn’t fall behind). If those two replicas are in the same datacenter, then the loss of one datacenter can lead to data unavailability, so some deployments may want two separate Australian datacenters.
- If all three replicas are in Australian datacenters, then three Australian datacenters are needed to be resilient to a datacenter loss.

## How CockroachDB's Partitioning Differs from Other Databases

Other databases use partitioning for three additional use cases: secondary indexes, sharding, and bulk loading/deleting. CockroachDB addresses these use-cases not by using partitioning, but in the following ways:

- **Changes to secondary indexes:** CockroachDB solves these changes through online schema changes. Online schema changes are a superior feature to partitioning because they require zero-downtime and eliminate the potential for consistency problems.
- **Sharding:** CockroachDB automatically shards data as a part of its distributed database architecture.
- **Bulk Loading & Deleting:** CockroachDB does not have a feature that supports this use case as of now.

## Known Limitations

{% include {{ page.version.version }}/known-limitations/partitioning-with-placeholders.md %}

## See Also

- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [Computed Columns](computed-columns.html)
