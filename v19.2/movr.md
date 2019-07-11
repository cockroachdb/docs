---
title: MovR
summary: The MovR application uses CockroachDB to store information about vehicles, users, and rides.
toc: true
---

MovR is a fictional vehicle-sharing company created to demonstrate CockroachDB's features.

## Overview

The MovR example consists of three components:

- The `movr` database, which contains several tables that hold vehicle, user, and ride data. The `movr` database is built into [`cockroach demo`](cockroach-demo.html) and [`cockroach workload`](cockroach-workload.html).
- The `movr` dataset, which consists of rows of data that populate tables in the `movr` database. The `movr` dataset is built into [`cockroach demo`](cockroach-demo.html) and [`cockroach workload`](cockroach-workload.html).
- The MovR application, a fully-functional vehicle-sharing application, written in Python. All of MovR application source code is open-source, and available on the [movr](https://github.com/cockroachdb/movr) GitHub repository.

## The `movr` Database

Three tables in the `movr` database store user, vehicle, and ride data for MovR:

- `users` represents the people registered for the service.
- `vehicles` represents the pool of vehicles for the service.
- `rides` represents when and where users have rented a vehicle.   

Each table has a composite primary key of `city` and `id`, with `city` being first in the key.

<img src="{{ 'images/v19.2/geo-partitioning-schema.png' | relative_url }}" alt="Geo-partitioning schema" style="max-width:100%" />

The `movr` database also contains the `promo_codes`, `user_promo_codes`, and `vehicle_location_histories` tables.

## Using `cockroach` Commands to Generate Schemas and Data for MovR

Use the following `cockroach` commands to load the `movr` database and dataset that are built into the CockroachDB binary:

- [`cockroach demo movr`](cockroach-demo.html) opens a temporary, in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

- [`cockroach workload init movr`](cockroach-workload.html) loads the `movr` database and some sample data to a running cluster.

## Using the MovR Application

The following steps summarize how the MovR application works:

1. A user loads the app and sees the 25 closest vehicles. Behind the scenes, this is a `SELECT` from the `vehicles` table:

    ~~~ sql
    > SELECT id, city, status, ... FROM vehicles WHERE city = <user location>
    ~~~

2. The user signs up for the service, which is an `INSERT` of a row into the `users` table:

    ~~~ sql
    > INSERT INTO users (id, name, address, ...) VALUES ...
    ~~~

3. In some cases, the user adds their own vehicle to share, which is an `INSERT` of a row into the `vehicles` table:

    ~~~ sql
    > INSERT INTO vehicles (id, city, type, ...) VALUES ...
    ~~~

4. More often, the user reserves a vehicle and starts a ride, which is an `UPDATE` of a row in the `vehicles` table and an `INSERT` of a row into the `rides` table:

    ~~~ sql
    > UPDATE vehicles SET status = 'in_use' WHERE ...
    ~~~

    ~~~ sql
    > INSERT INTO rides (id, city, start_addr, ...) VALUES ...
    ~~~

5. The user ends the ride and releases the vehicle, which is an `UPDATE` of a row in the `vehicles` table and an `UPDATE` of a row in the `rides` table:

    ~~~ sql
    > UPDATE vehicles SET status = 'available' WHERE ...
    ~~~

    ~~~ sql
    > UPDATE rides SET end_address = <value> ...
    ~~~

## Extended Examples

MovR scales as a geo-partitioned application and database that you can deploy using Docker images across a multi-region cluster deployment.

For a tutorial about geo-partitioning for fast reads and writes, see [Geo-Partitioning for Fast Reads and Writes in a Multi-Region Cluster](demo-geo-partitioning.html).

For a tutorial about performance tuning in CockroachDB, see [Performance Tuning](performance-tuning.html).

## Related Topics

- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Build an App with CockroachDB](build-an-app-with-cockroachdb.html)
- [Experimental Features](experimental-features.html)
