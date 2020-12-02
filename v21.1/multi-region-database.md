---
title: Create a Multi-Region Database Schema
summary: This page documents the database schema for the multi-region Flask application built on CockroachDB.
toc: true
---

This page walks you through creating a database schema for an example multi-region application. It is the second section of the [Develop and Deploy a Multi-Region Web Application](multi-region-overview.html) tutorial.

## Before you begin

Before you begin this section, complete the previous section of the tutorial, [MovR: An Example Multi-Region Use-Case](multi-region-use-case.html).

## The `movr` database

The example application is built on a multi-region deployment of CockroachDB, loaded with the `movr` database. This database contains the following tables:

- `users`
- `vehicles`
- `rides`

These tables store information about the users and vehicles registered with MovR, and the rides associated with those users and vehicles.

Here's a diagram of the database schema, generated with [DBeaver](dbeaver.html):

<img src="{{ 'images/v21.1/movr_v2.png' | relative_url }}" alt="MovR database schema" style="border:1px solid #eee;max-width:100%" />

Initialization statements for `movr` are defined in [`dbinit.sql`](https://github.com/cockroachlabs/movr-flask/blob/master/dbinit.sql), a SQL file that you use later in this tutorial to load the database to a running cluster.

{{site.data.alerts.callout_info}}
This database is a slightly simplified version of the [`movr` database](movr.html) that is built into the `cockroach` binary. Although the two databases are similar, they have different schemas.
{{site.data.alerts.end}}

## Geo-partition the `movr` database

Distributed CockroachDB deployments consist of multiple regional deployments of CockroachDB nodes that communicate as a single, logical database. In [CockroachDB terminology](architecture/overview.html#terms), these nodes comprise a *cluster*. CockroachDB splits rows of table data into *ranges*, and then replicates the ranges and distributes them to the individual nodes of the cluster. You can control where ranges are replicated and distributed with CockroachDB metadata objects known as [*replication zones*](configure-replication-zones.html).

At startup, each node in a cluster is assigned a [locality](cockroach-start.html#locality). You can assign nodes to the same replication zone based on their locality. When you partition data, you break up tables into segments of rows, based on a common value or characteristic. To geo-partition the data, you constrain a partition to a specific replication zone.

For example, suppose that the `movr` database is loaded to a multi-region CockroachDB cluster, with each node assigned a cloud provider `region` locality at startup.

Each table in the `movr` database contains a `city` column, which signals a location for each row of data. If a user is registered in New York, their row in the `users` table will have a `city` value of `new york`. If that user takes a ride in Seattle, that ride's row in the `rides` table has a `city` value of `seattle`.

You can [partition the tables](partition-by.html) of the `movr` database, based on the row's `city` value.

For example:

~~~ sql
> PARTITION BY LIST (city) (
    PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
    PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
    PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
);
~~~

After you define a partition, you can constrain it to a replication zone, using a [zone constraint](configure-zone.html) on the `region` locality. For the `users` table, this looks like:

~~~ sql
> ALTER PARTITION europe_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
    constraints = '[+region=gcp-europe-west1]';
  ALTER PARTITION us_east OF INDEX movr.public.users@primary CONFIGURE ZONE USING
    constraints = '[+region=gcp-us-east1]';
  ALTER PARTITION us_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
    constraints = '[+region=gcp-us-west1]';
~~~

For full partitioning statements for each table and secondary index, see `dbinit.sql`.

See below for the [`CREATE TABLE`](create-table.html) statements for each table in the database.

## The `users` table

Here is the `CREATE TABLE` statement for the `users` table:

~~~ sql
> CREATE TABLE users (
    id UUID NOT NULL,
    city STRING NOT NULL,
    first_name STRING NULL,
    last_name STRING NULL,
    email STRING NULL,
    username STRING NULL,
    password_hash STRING NULL,
    is_owner BOOL NULL,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
    UNIQUE INDEX users_username_key (username ASC),
    FAMILY "primary" (id, city, first_name, last_name, email, username, password_hash, is_owner),
    CONSTRAINT check_city CHECK (city IN ('amsterdam':::STRING, 'boston':::STRING, 'los angeles':::STRING, 'new york':::STRING, 'paris':::STRING, 'rome':::STRING, 'san francisco':::STRING, 'seattle':::STRING, 'washington dc':::STRING))
);
~~~

Note the following:

- We want to partition this table on the `city` column. In order to partition on a column value, the column must be indexed. This table's composite [primary key index](primary-key.html) is on the `city` and `id` columns. Note that primary keys also imply [unique](unique.html) and [`NOT NULL`](not-null.html) constraints on the constrained column pair.
- To optimize [queries on partitioned data](partitioning.html#filtering-on-an-indexed-column), the `city` column precedes the `id` column in the primary index. This guarantees that scans on the `users` table evaluate each row's `city` first, and then its `id`.
- To improve the performance of [filtered query scans](select-clause.html#filter-rows), it is a best practice to [index columns in a `WHERE` clause.](indexes.html#best-practices). The composite primary key ensures that queries on partitioned data and on rows filtered by `id` (e.g., single-row look-ups) are optimized. To optimize queries filtered on the `username` column, there is a [secondary index](indexes.html) on the `username` column. Although explicitly stated here, CockroachDB automatically applies a [unique](unique.html) constraint to columns that are indexed.
- There is a [check constraint](check.html) on the `city` column, which verifies that the value of the `city` column is valid. When [querying partitions](partitioning.html#filtering-on-an-indexed-column), check constraints also optimize queries filtered on the constrained columns.

## The `vehicles` table

~~~ sql
> CREATE TABLE vehicles (
    id UUID NOT NULL,
    city STRING NOT NULL,
    type STRING NULL,
    owner_id UUID NULL,
    date_added DATE NULL,
    status STRING NULL,
    last_location STRING NULL,
    color STRING NULL,
    brand STRING NULL,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
    CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id),
    INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC, status ASC) PARTITION BY LIST (city) (
        PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
        PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
        PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
    ),
    FAMILY "primary" (id, city, type, owner_id, date_added, status, last_location, color, brand),
    CONSTRAINT check_city CHECK (city IN ('amsterdam':::STRING, 'boston':::STRING, 'los angeles':::STRING, 'new york':::STRING, 'paris':::STRING, 'rome':::STRING, 'san francisco':::STRING, 'seattle':::STRING, 'washington dc':::STRING))
);
~~~

Note the following:

- Like the `users` table, the `vehicles` table has a composite primary key on `city` and `id`.
- The `vehicles` table has a [foreign key constraint](foreign-key.html) on the `users` table, for the `city` and `owner_id` columns. This guarantees that a vehicle is registered to a particular user (i.e., an "owner") in the city where that user is registered.
- The table has a secondary index (`vehicles_auto_index_fk_city_ref_users`) on the `city`, `owner_id`, and `status`. By default, CockroachDB creates secondary indexes for all foreign key constraints. This optimizes scans made on the foreign key columns, for foreign key enforcement. Here, we add `status` to the secondary index, because reading and writing the status of a vehicle is a common query for the application. As mentioned in the `users` table section, it is a best practice to [index columns in a `WHERE` clause.](indexes.html#best-practices)
- We include a [`PARTITION BY`](partition-by.html) statement for the `vehicles_auto_index_fk_city_ref_users` index. When geo-partitioning a database, it's important to geo-partition all indexes containing partition columns. In this case, the index includes `city`, so we should partition the index.

    After defining this partition, you also need to add a zone constraint to the partition, so that it is truly geo-partitioned. For example, for the index's `us_east` partition, we use the following statement to configure the zone:

    ~~~ sql
    > ALTER PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
        constraints = '[+region=gcp-us-east1]';
    ~~~

    See `dbinit.sql` for full zone configuration statements for all partitioned indexes.

- Like `users`, the `vehicles` table also has a `CHECK` constraint on the `city` row, to optimize table scans in filtered queries.

## The `rides` table

~~~ sql
> CREATE TABLE rides (
    id UUID NOT NULL,
    city STRING NOT NULL,
    vehicle_id UUID NULL,
    rider_id UUID NULL,
    rider_city STRING NOT NULL,
    start_location STRING NULL,
    end_location STRING NULL,
    start_time TIMESTAMPTZ NULL,
    end_time TIMESTAMPTZ NULL,
    length INTERVAL NULL,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
    CONSTRAINT fk_city_ref_users FOREIGN KEY (rider_city, rider_id) REFERENCES users(city, id),
    CONSTRAINT fk_vehicle_city_ref_vehicles FOREIGN KEY (city, vehicle_id) REFERENCES vehicles(city, id),
    INDEX rides_auto_index_fk_city_ref_users (rider_city ASC, rider_id ASC) PARTITION BY LIST (rider_city) (
        PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
        PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
        PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
    ),
    INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (city ASC, vehicle_id ASC) PARTITION BY LIST (city) (
        PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
        PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
        PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
    ),
    FAMILY "primary" (id, city, rider_id, rider_city, vehicle_id, start_location, end_location, start_time, end_time, length),
    CONSTRAINT check_city CHECK (city IN ('amsterdam':::STRING, 'boston':::STRING, 'los angeles':::STRING, 'new york':::STRING, 'paris':::STRING, 'rome':::STRING, 'san francisco':::STRING, 'seattle':::STRING, 'washington dc':::STRING))
);
~~~


Note the following:

- Like the `users` and `vehicles` tables, the `rides` table has a composite primary key on `city` and `id`.
- Like the `vehicles` table, the `rides` table has foreign key constraints. These constraints are on the `users` and the `vehicles` tables.
- The foreign key indexes are partitioned. These partitions need to be zone-constrained like the other partitions. For full zone configuration statements, see `dbinit.sql`.
- Like `users` and `vehicles`, the table has a `CHECK` constraint on the `city` row, to optimize filtered queries.

## Next steps

Now that you are familiar with the `movr` schema, [set up a development environment for a multi-region application](multi-region-setup.html).

## See also

- [movr-flask on GitHub](https://github.com/cockroachlabs/movr-flask)
- [CockroachDB terminology](architecture/overview.html#terms)
- [Configure Replication Zones](configure-replication-zones.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [Define Table Partitions](partitioning.html)
- [`PARTITION BY`](partition-by.html)