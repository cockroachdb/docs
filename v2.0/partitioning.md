---
title: Partition Tables 
summary: Partitioning is an enterprise feature that gives you row-level control of how and where your data is stored.
toc: false
---

CockroachDB's partitioning feature gives you row-level control of how and where your data is stored. Partitioning enables you to reduce latencies and costs, and can assist in meeting regulatory requirements for your data. 

{{site.data.alerts.callout_info}}The Partitioning feature is only available to <a href="enterprise-licensing.html">enterprise</a> users. {{site.data.alerts.end}}

<div id="toc"></div>

## Overview

Partitioning allows you to meet your latency and cost requirements:

- **Reduce latency**: Geo-partitioning allows you to keep user data close to the user, which reduces the distance that the data needs to travel, thereby reducing latency and improving user experience. To geo-partition a table, define location-based partitions while creating a table, create location-specific zone configurations, and apply the zone configurations to the corresponding partitions. 
- **Reduce costs**: Archival-partitioning allows you to store infrequently-accessed data on slower and cheaper storage. To archival-partition a table, define frequency-based partitions while creating a table, create frequency-specific zone configurations with appropriate storage devices constraints, and apply the zone configurations to the corresponding partitions.

## Partitioning a Table

You can define partitions and subpartitions over one or more columns of a table. You can repartition and unpartition existing partitions. You can also use partitioning with indexes and interleaved tables. 

To partition a table:

Step 1: Set the enterprise license key. 
Step 2: Start the nodes with the right [constraints](configure-replication-zones.html#replication-constraints) (localities, storage devices, and other constraints).
Step 3: Create table with partitions (and subpartitions) and define the composite primary key.
Step 4: Create appropriate location-specific or storage-specific zone configurations.
Step 5: Apply zone configurations to corresponding partitions.  

### Defining the Primary Key

A table can be partitioned based on either its composite primary key or secondary index. 

The composite primary key required for partitioning is different from the conventional composite primary key. To define the composite primary key for partitioning, prefix the unique identifier(s) in the primary key with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions. 

#### Example

Consider the database of a global online learning portal that has a table for students of all the courses across the world. Suppose you want to geo-partition the table based on the countries of the students. Then the composite primary key needs to be defined as:

~~~ sql
> CREATE TABLE students (
    id SERIAL,
    name STRING,
    email STRING,
    country STRING,
    last_seen DATE,   
    PRIMARY KEY (country, id));
~~~

#### Partitioning Key Considerations

- Once you set the composite primary key, you can’t change it later. So provision for all future subpartitions by including those columns in the composite primary key. In the example of the online learning portal, if you think you might want to subpartition based on `last_seen` in the future, define the composite primary key as `(country, last_seen, id)`.
- The order in which the columns are defined in the composite primary key is important. The partitions and subpartitions need to follow that order. In the example of the online learning portal, if you define the composite primary key as `(country, last_seen, id,)`, the primary partition is by `country`, and then subpartition is by `last_seen`. You can’t skip `country` and partition by `last_seen`.

#### Partitioning and Index Columns

The composite primary key discussed above has two drawbacks: It does not enforce that the identifier column is globally unique, and it does not provide fast lookups on the identifier. To ensure uniqueness or fast lookups, create a unique, unpartitioned secondary index on the identifier.

Indexes can also be partitioned, but are not required to be. Each partition is required to have a name that is unique among all partitions on that table or index.

See [Partitioning Indexes example](#partitioned-secondary-indexes).

### Creating a Table with Partitions

You can partition a table either by list or by range:

#### Partition a table by list

To partition a table by list, use the `PARTITION BY LIST` syntax while creating the table. `PARTITION BY LIST` lets you map one or more tuples to a partition.

While defining a list partition, you can also set the `DEFAULT` partition that acts as a catch-all if none of the rows match the requirements for the defined partitions. 

See [Partition by List example](#partition-by-list).

#### Partition a table by range

To partition a table by range, use `PARTITION BY RANGE` syntax while creating the table. `PARTITION BY LIST` lets you map ranges of tuples to a partition.

While defining a list partition, you can use CockroachDB-defined `MINVALUE` and `MAXVALUE` parameters to define the lower and upper bounds of the ranges respectively. 

{{site.data.alerts.callout_info}}Note that the lower bound of a range partition is inclusive, while the upper bound is exclusive. Note also that a `NULL` value in a range-partitioned column sorts into the first range, which is consistent with our key encoding ordering and `ORDER BY` behavior.{{site.data.alerts.end}}

See [Partition by Range example](#partition-by-range).

Partition values can be any SQL expression, but it’s only evaluated once. so if you create a partition with value `< (now() - '1d')` on 2017-01-30, it would be contain all values less than 2017-01-29. It would not update the next day, it would continue to contain values less than 2017-01-29.

#### Partitioning Interleaved Tables

Partitioning [interleaved tables](interleave-in-parent.html) partitions only the parent table, while children will naturally be interleaved the same as their parents.

### Setting Zone Configurations

On their own, partitions are inert. Applying functionality to a partition requires [zone configs](configure-replication-zones.html).

CockroachDB uses the most granular zone config available. Zone configs that target a partition are considered more granular than those that target a table, which in turn are considered more granular than those that target a database. 

### Synopsis

~~~ shell
# Set enterprise license
$ SET CLUSTER SETTING cluster.organization = 'organization_name';
$ SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx'; 

# Partition a table by list (geo-partitioning)
$ CREATE TABLE <table-name> ( <elements...>, PRIMARY KEY (<primary_keys>))
  PARTITION BY LIST(primary_key_component)<partition-name> VALUES IN ( <list-expr>... )

# Partition a table by range (archival partitioning)
$ CREATE TABLE <table-name> ( <elements...>, PRIMARY KEY (<primary_keys>)) 
  PARTITION BY RANGE(primary_key_component) <partition-name> VALUES FROM <range-expr> TO <range-expr>

# Create/edit the replication zone for a partition:
$ cockroach zone set <database.table.partition> --file=<zone-conent.yaml> <flags>

# Remove the replication zone for a partition:
$ cockroach zone rm <database.table.partition> <flags>
~~~

### Verifying Table Partitions

To verify the table partitions, use the [`SHOW CREATE TABLE`](show-create-table.html) statement.

## Scenario-based Examples

### Partition by List

Consider a table of the users of a global e-commerce website, RoachMart. Suppose we have two datacenters: one in the United States and another in Australia. To reduce latency, we want to keep the users' data closer to their locations: We want to keep data of the users located in United States and Canada in the United States datacenter, and the data of users located in Australia and New Zealand in the Australian datacenter. We can achieve this by partitioning on country and use the `PARTITION BY LIST` syntax. 

#### Step 1: Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key)

#### Step 2: Start each node with its datacenter location specified in the `--locality` flag:

~~~ shell
# Start the node in the US datacenter:
$ cockroach start --insecure --host=node1 --locality=datacenter=us-1

# Start the node in the AUS datacenter:
$ cockroach start --insecure --host=node2 --locality=datacenter=aus-1 \
--join=node1:27257
~~~

#### Step 3: Create a table with the appropriate partitions:

~~~ sql
> CREATE TABLE users_by_list (
    id SERIAL,
    name STRING,
    email STRING,
    country STRING,
    last_seen DATE,   
    PRIMARY KEY (country, last_seen, id))
    PARTITION BY LIST (country)(PARTITION north_america VALUES IN ('CA','US'), PARTITION australia VALUES IN ('AU','NZ'), PARTITION DEFAULT VALUES IN (default));
~~~

#### Step 4: Create corresponding zone configurations:

~~~ shell
$ cat north_america.zone.yml
constraints: [+datacenter=us1]

$ cat australia.zone.yml
constraints: [+datacenter=au1]
~~~

#### Step 5: Apply zone configurations to corresponding partitions:

~~~ shell
$ cockroach zone set blog.users_by_list.north_america --insecure  -f north_america.zone.yml
$ cockroach zone set blog.users_by_list.australia --insecure  -f australia.zone.yml
~~~

### Partitioned secondary indexes

RoachMart’s warehouse team wants to know how many orders are processed for each part they sell. They want a secondary index to make the query efficient. Since the common operation is to look at one country’s orders at a time, they partition the index on the same columns as users.

~~~ sql
> CREATE INDEX part_idx ON roachmart.orders (user_country, part_id)
  PARTITION BY LIST (user_country) (
  ...
  );
 ~~~

### Partition by Range

Consider the table of users of the same global e-commerce website, RoachMart. Suppose we want to store the recent users on fast and expensive storage devices (example: ssd) and store the data of the users who have not been to the website recently on slower, cheaper storage devices(example: hdd). We can achieve this by partitioning the table by date and using the `PARTITION BY RANGE` syntax. 

#### Step 1: Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key)

#### Step 2: Start each node with the appropriate storage device specified in the `--store` flag:

~~~ shell
$ cockroach start --store=path=/mnt/crdb,attrs=ssd
$ cockroach start --store=path=/mnt/crdb,attrs=hdd
~~~

#### Step 3: Create a table with the appropriate partitions:

~~~ sql
> CREATE TABLE users_by_range (
   id SERIAL,
   name STRING,
   email STRING,                                                                                           
   country STRING, 
   last_seen DATE,                                                                                      
   PRIMARY KEY (last_seen, id)) 
   PARTITION BY RANGE (last_seen) (PARTITION archived VALUES FROM (MINVALUE) TO ('2018-02-15'), 
   PARTITION recent VALUES FROM ('2017-02-15') TO (MAXVALUE));
~~~

#### Step 4: Create corresponding zone configurations:

~~~ shell
$ cat recent.zone.yml
constraints: [+ssd]

$ cat archived.zone.yml
constraints: [+hdd]
~~~

#### Step 5: Apply zone configurations to corresponding partitions:

~~~ shell
$ cockroach zone set blog.users_by_range.recent --insecure  -f recent.zone.yml
$ cockroach zone set blog.users_by_range.archived --insecure  -f archived.zone.yml
~~~

### Sub-Partition a Table

The `PARTITION BY` syntax is recursive so that partitions can be themselves partitioned any number of times, using either list or range partitioning. 

Going back to RoachMart's scenario, suppose we want to keep the users' data close to their location, as well as store the recent users' data on faster storage devices and store the data of the users who have not been to the website recently on slower, cheaper storage devices(example: hdd). We can achieve this by partitioning the table first by location and then by date. 

#### Step 1: Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key)

#### Step 2: Start each node with the appropriate storage device specified in the `--store` flag:

~~~ shell
# Start the node in the US datacenter:
$ cockroach start --insecure --host=<node1 hostname> --locality=datacenter=us-1 --store=path=/mnt/crdb,attrs=ssd,hdd

# Start the node in the AUS datacenter:
$ cockroach start --insecure --host=<node2 hostname> --locality=datacenter=aus-1 --store=path=/mnt/crdb,attrs=ssd,hdd \
--join=<node1 hostname>:27257
~~~

#### Step 3: Create a table with the appropriate partitions:

~~~ sql
> CREATE TABLE users (
    id SERIAL, 
    name STRING,
    email STRING,
    country STRING, 
    last_seen DATE, 
    PRIMARY KEY (country, last_seen, id))
    PARTITION BY LIST (country)(
        PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (last_seen)(PARTITION archived_au VALUES FROM (MINVALUE) TO ('2017-06-04'), PARTITION recent_au VALUES FROM ('2017-06-04') TO (MAXVALUE)),
        PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (last_seen)(PARTITION archived_us VALUES FROM (MINVALUE) TO ('2017-06-04'), PARTITION recent_us VALUES FROM ('2017-06-04') TO (MAXVALUE))
    );
~~~

{{site.data.alerts.callout_info}} Subpartition names must be unique within a table. In our example, even though `archived` and `recent` are sub-partitions of distinct partitions, they still need to be uniquely named. Hence the names `archived_au`, `archived_us`, and `recent_au` and `recent_us`).{{site.data.alerts.end}}

#### Step 4: Create corresponding zone configurations:

~~~ shell
$ cat recent_us.zone.yml
constraints: [+ssd]
constraints: [+datacenter=us1]

$ cat archived_us.zone.yml
constraints: [+hdd]
constraints: [+datacenter=us1]

$ cat recent_au.zone.yml
constraints: [+ssd]
constraints: [+datacenter=au1]

$ cat archived_au.zone.yml
constraints: [+hdd]
constraints: [+datacenter=au1]
~~~

#### Step 5: Apply zone configurations to corresponding partitions:

~~~ shell
$ cockroach zone set blog.users.recent_us --insecure  -f recent_us.zone.yml
$ cockroach zone set blog.users.archived_us --insecure  -f archived_us.zone.yml

$ cockroach zone set blog.users.recent_au --insecure  -f recent_au.zone.yml
$ cockroach zone set blog.users.archived_au --insecure  -f archived_au.zone.yml
~~~

### Repartition a Table

Consider the partitioned table of users of RoachMart. Suppose the table has been partitioned on range to store the recent users on fast and expensive storage devices (example: ssd) and store the data of the users who have not been to the website recently on slower, cheaper storage devices(example: hdd). Now suppose we want to change the date after which the users will be considered recent to `2018-03-01`. We can achieve this by using the `ALTER TABLE` command. 

~~~ sql
> ALTER TABLE users_by_range PARTITION BY RANGE (last_seen) (
  PARTITION archived VALUES FROM (MINVALUE) TO ('2018-03-01'), 
  PARTITION recent VALUES FROM ('2018-03-01') TO (MAXVALUE));
~~~

### Unpartition a Table

You can remove the partitions on a table by using the `PARTITION BY NOTHING` syntax with the `ALTER TABLE` command:

~~~ sql
> ALTER TABLE users_by_range PARTITION BY NOTHING;
~~~

## Licensing Requirements

You require an enterprise license to partition or repartition a table, and to add or edit the zone configurations of a partition or an index. To enable partitioning, [set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key).

### Expired License

The following features will no longer work with an expired license:

- Changing the partitioning scheme on any table or index
- Changing the zone config for a partition

However, the following features will continue to work even with an expired enterprise license:

- Querying on a partitioned table (e.g., SELECT foo PARTITION)
- Inserting or updating data in a partitioned table
- Dropping a partitioned table
- Unpartitioning a partitioned table
- Making non-partitioning changes to a partitioned table (e.g., adding a column/index/fk/check constraint) 

## Locality–Resilience Tradeoff

There exists a tradeoff between making reads/writes fast and surviving failures. Consider a partition with three replicas of roachmart.users for Australian users. If only one replica is pinned to an Australian datacenter, then reads may be fast (via leases follow the sun) but writes will be slow. If two replicas are pinned to an Australian datacenter, than reads and writes will be fast (as long as the cross-ocean link has enough bandwidth that the third replica doesn’t fall behind and hit the quota pool). If those two replicas are in the same datacenter, then loss of one datacenter can lead to data unavailability, so some deployments may want two separate Austrialian datacenters. If all three replicas are in Australian datacenters, then three Australian datacenters are needed to be resilient to a datacenter loss.

## How CockroachDB's Partitioning Differs from Other Databases

There is unfortunately no SQL standard for partitioning. As a result, separate partitioning syntaxes have emerged:

- MySQL and Oracle specify partitions inline in `CREATE TABLE`, similar to CockroachDB.
- Microsoft SQL Server requires four steps: allocating physical storage called “filegroups” for each partition with `ALTER DATABASE… ADD FILE`, followed by `CREATE PARTITION FUNCTION` to define the partition split points, followed by `CREATE PARTITION SCHEME` to tie the partition function output to the created file groups, followed by `CREATE TABLE... ON partition_scheme` to tie the table to the partitioning scheme.
- PostgreSQL 10 takes a hybrid approach: the partition columns and scheme (i.e, RANGE or LIST) are specified in the `CREATE TABLE` statement, but the partition split points are specified by running `CREATE TABLE… PARTITION OF… FOR VALUES`once for each partition.

Other databases use the partitioning for three additional use cases: secondary indexes, sharding, and bulk loading/deleting. CockroachDB addresses these use-cases not by using partitioning, but in the following ways:

- Changes to secondary indexes: CockroachDB solves these changes through online schema changes. Online schema changes are a superior feature to partitioning because they require zero-downtime and eliminate the potential for consistency problems. 
- Sharding: CockroachDB automatically shards data as a part of its distributed database architecture. 
- Bulk Loading & Deleting: CockroachDB does not have a feature that supports this use case as of now. 

## See Also

[Other Cockroach Commands](cockroach-commands.html)
