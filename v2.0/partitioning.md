---
title: Define Table Partitions
summary: Partitioning is an enterprise feature that gives you row-level control of how and where your data is stored.
toc: false
---

CockroachDB allows you to define table partitions, thus giving you row-level control of how and where your data is stored. Partitioning enables you to reduce latencies and costs, and can assist in meeting regulatory requirements for your data. 

{{site.data.alerts.callout_info}}Table partitioning is an <a href="enterprise-licensing.html">enterprise-only</a> feature. {{site.data.alerts.end}}

<div id="toc"></div>

## Overview

Table partitioning helps you reduce latency and cost:

- **Reduce latency**: Geo-partitioning allows you to keep user data close to the user, which reduces the distance that the data needs to travel, thereby reducing latency. To geo-partition a table, define location-based partitions while creating a table, create location-specific zone configurations, and apply the zone configurations to the corresponding partitions. 
- **Reduce costs**: Archival-partitioning allows you to store infrequently-accessed data on slower and cheaper storage. To archival-partition a table, define frequency-based partitions while creating a table, create frequency-specific zone configurations with appropriate storage devices constraints, and apply the zone configurations to the corresponding partitions.

## Define Table Partitions

1. [Set the enterprise license key.](enterprise-licensing.html#set-the-trial-or-enterprise-license-key) 
2. [Start the nodes with the right constraints](configure-replication-zones.html) (localities, storage devices, and other constraints).
3. [Create table with partitions (and subpartitions)](partitioning.html#create-a-table-with-partitions) and [define the primary key.](partitioning.html#define-the-primary-key)
4. [Create appropriate location-specific or storage-specific zone configurations and apply zone configurations to corresponding partitions](partitioning.html#set-zone-configurations)

### Define the Primary Key

A table can be partitioned based on either its primary key or secondary index. 

The primary key required for partitioning is different from the conventional primary key. To define the primary key for partitioning, prefix the unique identifier(s) in the primary key with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions. 

#### Example

Consider the database of a global online learning portal that has a table for students of all the courses across the world. If you want to geo-partition the table based on the countries of the students, then the primary key needs to be defined as:

{% include copy-clipboard.html %} 
~~~ sql
> CREATE TABLE students (
    id SERIAL,
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,   
    PRIMARY KEY (country, id));
~~~

#### Partitioning Key Considerations

- Once you set the primary key, you can’t change it later. Provision for all future subpartitions by including those columns in the primary key. In the example of the online learning portal, if you think you might want to subpartition based on `expected_graduation_date` in the future, define the primary key as `(country, expected_graduation_date, id)`.
- The order in which the columns are defined in the primary key is important. The partitions and subpartitions need to follow that order. In the example of the online learning portal, if you define the primary key as `(country, expected_graduation_date, id)`, the primary partition is by `country`, and then subpartition is by `expected_graduation_date`. You can’t skip `country` and partition by `expected_graduation_date`.

#### Partitioning and Index Columns

The primary key discussed above has two drawbacks: 

- It does not enforce that the identifier column is globally unique.
- It does not provide fast lookups on the identifier. 

To ensure uniqueness or fast lookups, create a unique, unpartitioned secondary index on the identifier.

Indexes can also be partitioned, but are not required to be. Each partition is required to have a name that is unique among all partitions on that table and its indexes. For example, the following `CREATE INDEX` scenario will fail because it reuses the name of a partition of the primary key:

~~~ sql
CREATE TABLE foo (a STRING PRIMARY KEY, b STRING) PARTITION BY LIST (a) (
    bar VALUES IN ('bar'),
    default VALUES IN (DEFAULT)
);
CREATE INDEX foo_b_idx ON foo (b) PARTITION BY LIST (b) (
    baz VALUES IN ('baz'),
    default VALUES IN (DEFAULT)
);
~~~

Consider using a naming scheme that uses the index name to avoid conflicts. For example, the partitions above could be named `primary_idx_bar`, `primary_idx_default`, `b_idx_baz`, `b_idx_default`.

### Create a Table with Partitions

You can define partitions and subpartitions over one or more columns of a table. You can declare which values belong to which partition in one of two ways: 

- List partitioning: Enumerate all possible values for each partition. List partitioning is a good choice when the number of possible values is small.
- Range partitioning: Specify a contiguous range of values for each partition by specifying lower and upper bounds. Range partitioning is a good choice when the number of possible values is too large to explicitly list out.

#### Define Table Partitions by List

To partition a table by list, use the `PARTITION BY LIST` syntax while creating the table. `PARTITION BY LIST` lets you map one or more tuples to a partition.

While defining a list partition, you can also set the `DEFAULT` partition that acts as a catch-all if none of the rows match the requirements for the defined partitions. 

See [Partition by List example](#partition-by-list).

#### Define Table Partitions by Range

To define a table partition by range, use the `PARTITION BY RANGE` syntax while creating the table. `PARTITION BY LIST` lets you map ranges of tuples to a partition.

While defining a range partition, you can use CockroachDB-defined `MINVALUE` and `MAXVALUE` parameters to define the lower and upper bounds of the ranges respectively. 

{{site.data.alerts.callout_info}}The lower bound of a range partition is inclusive, while the upper bound is exclusive. For range partitions, `NULL` is considered less than any other data, which is consistent with our key encoding ordering and `ORDER BY` behavior.{{site.data.alerts.end}}

See [Partition by Range example](#partition-by-range).

Partition values can be any SQL expression, but it’s only evaluated once. If you create a partition with value `< (now() - '1d')` on 2017-01-30, it would be contain all values less than 2017-01-29. It would not update the next day, it would continue to contain values less than 2017-01-29.

#### Define Partitions on Interleaved Tables

For [interleaved tables](interleave-in-parent.html), partitions can be defined only on the root table of the interleave hierarchy, while children are interleaved the same as their parents.

### Set Zone Configurations

On their own, partitions are inert and simply apply a label to the rows of the table that satisfy the criteria of the defined partitions. Applying functionality to a partition requires creating and applying the [zone configurations](configure-replication-zones.html) to the corresponding partitions.

CockroachDB uses the most granular zone config available. Zone configs that target a partition are considered more granular than those that target a table or index, which in turn are considered more granular than those that target a database. 

### Synopsis

~~~ shell
# Set enterprise license
$ SET CLUSTER SETTING cluster.organization = 'organization_name';
$ SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx'; 

# Partition a table by list (geo-partitioning)
$ CREATE TABLE <table-name> ( <elements...>, PRIMARY KEY (<primary_keys>))
  PARTITION BY LIST(primary_key_component) (PARTITION <partition-name> VALUES IN ( <list-expr>... ));

# Partition a table by range (archival-partitioning)
$ CREATE TABLE <table-name> ( <elements...>, PRIMARY KEY (<primary_keys>)) 
  PARTITION BY RANGE(primary_key_component) (PARTITION <partition-name> VALUES FROM <range-expr> TO <range-expr>);

# Create/edit the replication zone for a partition:
$ cockroach zone set <database.table.partition> --file=<zone-content.yaml> <flags>

# Remove the replication zone for a partition:
$ cockroach zone rm <database.table.partition> <flags>
~~~

### Verify Table Partitions

To verify the table partitions, use the [`SHOW CREATE TABLE`](show-create-table.html) statement.

## Scenario-based Examples

### Define Table Partitions by List

Consider a global online learning portal, RoachLearn, that has a database containing a table of students across the world. Suppose we have two datacenters: one in the United States and another in Australia. To reduce latency, we want to keep the students' data closer to their locations: 

- We want to keep the data of the students located in the United States and Canada in the United States datacenter.
- We want to keep the data of students located in Australia and New Zealand in the Australian datacenter. 

We can achieve this by partitioning on `country` and using the `PARTITION BY LIST` syntax. 

#### Step 1: Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key)

#### Step 2: Start each node with its datacenter location specified in the `--locality` flag:

{% include copy-clipboard.html %} 
~~~ shell
# Start the node in the US datacenter:
$ cockroach start --insecure --host=node1 --locality=datacenter=us-1

# Start the node in the AUS datacenter:
$ cockroach start --insecure --host=node2 --locality=datacenter=aus-1 \
--join=node1:27257
~~~

#### Step 3: Create a table with the appropriate partitions:

{% include copy-clipboard.html %} 
~~~ sql
> CREATE TABLE students_by_list (
    id SERIAL,
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

#### Step 4: Create corresponding zone configurations:

{% include copy-clipboard.html %} 
~~~ shell
$ cat north_america.zone.yml
constraints: [+datacenter=us1]

$ cat australia.zone.yml
constraints: [+datacenter=au1]
~~~

#### Step 5: Apply zone configurations to corresponding partitions:

{% include copy-clipboard.html %} 
~~~ shell
$ cockroach zone set roachlearn.students_by_list.north_america --insecure  -f north_america.zone.yml
$ cockroach zone set roachlearn.students_by_list.australia --insecure  -f australia.zone.yml
~~~

### Define Table Partitions by Range

Consider the table of students of the global online learning portal, RoachLearn. Suppose we want to store the data of current students on fast and expensive storage devices (example: SSD) and store the data of the graduated students on slower, cheaper storage devices(example: HDD). We can achieve this by partitioning the table by date and using the `PARTITION BY RANGE` syntax. 

#### Step 1: Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key)

#### Step 2: Start each node with the appropriate storage device specified in the `--store` flag:

{% include copy-clipboard.html %} 
~~~ shell
$ cockroach start --store=path=/mnt/crdb,attrs=ssd
$ cockroach start --store=path=/mnt/crdb,attrs=hdd
~~~

#### Step 3: Create a table with the appropriate partitions:

{% include copy-clipboard.html %} 
~~~ sql
> CREATE TABLE students_by_range (
   id SERIAL,
   name STRING,
   email STRING,                                                                                           
   country STRING, 
   expected_graduation_date DATE,                                                                                      
   PRIMARY KEY (expected_graduation_date, id)) 
   PARTITION BY RANGE (expected_graduation_date) 
      (PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'), 
      PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE));
~~~

#### Step 4: Create corresponding zone configurations:

{% include copy-clipboard.html %} 
~~~ shell
$ cat current.zone.yml
constraints: [+ssd]

$ cat graduated.zone.yml
constraints: [+hdd]
~~~

#### Step 5: Apply zone configurations to corresponding partitions:

{% include copy-clipboard.html %} 
~~~ shell
$ cockroach zone set roachlearn.students_by_range.current --insecure  -f current.zone.yml
$ cockroach zone set roachlearn.students_by_range.graduated --insecure  -f graduated.zone.yml
~~~

### Define Subpartitions on a Table

A list partition can itself be partitioned, forming a subpartition. There is no limit on the number of levels of subpartitioning; that is, list partitions can be infinitely nested.

{{site.data.alerts.callout_info}}Range partitions cannot be subpartitioned.{{site.data.alerts.end}}

Going back to RoachLearn's scenario, suppose we want to do all of the following:

- Keep the students' data close to their location.
- Store the current students' data on faster storage devices.
- Store the graduated students' data on slower, cheaper storage devices (example: HDD).

We can achieve this by partitioning the table first by location and then by date.

#### Step 1: Set the enterprise license

To set the enterprise license, see [Set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key)

#### Step 2: Start each node with the appropriate storage device specified in the `--store` flag:

{% include copy-clipboard.html %} 
~~~ shell
# Start the node in the US datacenter:
$ cockroach start --insecure --host=<node1 hostname> --locality=datacenter=us-1 --store=path=/mnt/crdb,attrs=ssd,hdd

# Start the node in the AUS datacenter:
$ cockroach start --insecure --host=<node2 hostname> --locality=datacenter=aus-1 --store=path=/mnt/crdb,attrs=ssd,hdd \
--join=<node1 hostname>:27257
~~~

#### Step 3: Create a table with the appropriate partitions:

{% include copy-clipboard.html %} 
~~~ sql
> CREATE TABLE students (
    id SERIAL, 
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

#### Step 4: Create corresponding zone configurations:

{% include copy-clipboard.html %} 
~~~ shell
$ cat current_us.zone.yml
constraints: [+ssd,+datacenter=us1]

$ cat graduated_us.zone.yml
constraints: [+hdd,+datacenter=us1]

$ cat current_au.zone.yml
constraints: [+ssd,+datacenter=au1]

$ cat graduated_au.zone.yml
constraints: [+hdd,+datacenter=au1]
~~~

#### Step 5: Apply zone configurations to corresponding partitions:

{% include copy-clipboard.html %} 
~~~ shell
$ cockroach zone set roachlearn.students.current_us --insecure -f current_us.zone.yml
$ cockroach zone set roachlearn.students.graduated_us --insecure -f graduated_us.zone.yml

$ cockroach zone set roachlearn.students.current_au --insecure -f current_au.zone.yml
$ cockroach zone set roachlearn.students.graduated_au --insecure -f graduated_au.zone.yml
~~~

### Repartition a Table

Consider the partitioned table of students of RoachLearn. Suppose the table has been partitioned on range to store the current students on fast and expensive storage devices (example: SSD) and store the data of the graduated students on slower, cheaper storage devices(example: HDD). Now suppose we want to change the date after which the students will be considered current to `2018-08-15`. We can achieve this by using the `ALTER TABLE` command. 

{% include copy-clipboard.html %} 
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'), 
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE));
~~~

### Unpartition a Table

You can remove the partitions on a table by using the `PARTITION BY NOTHING` syntax with the `ALTER TABLE` command:

{% include copy-clipboard.html %} 
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~

## Licensing Requirements

You require an enterprise license to partition or repartition a table, and to add or edit the zone configurations of a partition or an index. To enable partitioning, [set the Trial or Enterprise License Key](enterprise-licensing.html#set-the-trial-or-enterprise-license-key).

### Expired License

The following features don't work with an expired license:

- Creating new table partitions or adding new zone configurations for partitions
- Changing the partitioning scheme on any table or index
- Changing the zone config for a partition

However, the following features continue to work even with an expired enterprise license:

- Querying a partitioned table (for example, `SELECT foo PARTITION`)
- Inserting or updating data in a partitioned table
- Dropping a partitioned table
- Unpartitioning a partitioned table
- Making non-partitioning changes to a partitioned table (for example, adding a column/index/foreign key/check constraint) 

## Locality–Resilience Tradeoff

There is a tradeoff between making reads/writes fast and surviving failures. Consider a partition with three replicas of `roachlearn.students` for Australian students. If only one replica is pinned to an Australian datacenter, then reads may be fast (via leases follow the workload) but writes will be slow. If two replicas are pinned to an Australian datacenter, then reads and writes will be fast (as long as the cross-ocean link has enough bandwidth that the third replica doesn’t fall behind). If those two replicas are in the same datacenter, then the loss of one datacenter can lead to data unavailability, so some deployments may want two separate Australian datacenters. If all three replicas are in Australian datacenters, then three Australian datacenters are needed to be resilient to a datacenter loss.

## How CockroachDB's Partitioning Differs from Other Databases

Other databases use partitioning for three additional use cases: secondary indexes, sharding, and bulk loading/deleting. CockroachDB addresses these use-cases not by using partitioning, but in the following ways:

- **Changes to secondary indexes:** CockroachDB solves these changes through online schema changes. Online schema changes are a superior feature to partitioning because they require zero-downtime and eliminate the potential for consistency problems. 
- **Sharding:** CockroachDB automatically shards data as a part of its distributed database architecture. 
- **Bulk Loading & Deleting:** CockroachDB does not have a feature that supports this use case as of now. 

## See Also

[Other Cockroach Commands](cockroach-commands.html)
