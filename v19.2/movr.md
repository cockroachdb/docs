---
title: MovR
summary: The MovR application uses CockroachDB to store information about vehicles, users, and rides.
toc: true
---

MovR is a fictional vehicle-sharing company created to demonstrate CockroachDB's features.

## Overview

The MovR example consists of the following:

- The `movr` dataset, which contains rows of data that populate tables in the `movr` database. The `movr` dataset is built into [`cockroach demo`](cockroach-demo.html) and [`cockroach workload`](cockroach-workload.html).
- The MovR application, a fully-functional vehicle-sharing application, written in Python. All of MovR application source code is open-source, and available on the [movr](https://github.com/cockroachdb/movr) GitHub repository.

## The `movr` database

Six tables in the `movr` database store user, vehicle, and ride data for MovR:

Table   |         Description          
--------|----------------------------
`users` | People registered for the service.       
`vehicles` | The pool of vehicles available for the service.
`rides` | When and where users have rented a vehicle.       
`promo_codes` | Promotional codes for users.
`user_promo_codes` | Promotional codes in use by users.      
`vehicle_location_histories` | Vehicle location history.

<!-- <img src="{{ 'images/v19.2/geo-partitioning-schema.png' | relative_url }}" alt="Geo-partitioning schema" style="max-width:100%" /> -->

## Generating schemas and data for MovR

You can use the `cockroach demo` and `cockroach workload` commands to load the `movr` database and dataset into a CockroachDB cluster.

[`cockroach demo`](cockroach-demo.html) opens a SQL shell to a temporary, in-memory cluster. To open a SQL shell to a demo cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database), use the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo movr
~~~

[`cockroach workload`](cockroach-workload.html) loads sample datasets and workloads into running clusters. To load the `movr` database and some sample data into a running cluster, do the following:

  1. Start a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
  1. Use `cockroach workload` to load the `movr` dataset:

      <div class="filters filters-big clearfix">
        <button class="filter-button" data-scope="secure">Secure</button>
        <button class="filter-button" data-scope="insecure">Insecure</button>
      </div>

      <section class="filter-content" markdown="1" data-scope="secure">
      {% include copy-clipboard.html %}
      ~~~ shell
      $ cockroach workload init movr 'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
      ~~~
      </section>

      <section class="filter-content" markdown="1" data-scope="insecure">
      {% include copy-clipboard.html %}
      ~~~ shell
      $ cockroach workload init movr 'postgresql://root@localhost:26257?sslmode=disable'
      ~~~
      </section>
  1. Use [`cockroach sql`](use-the-built-in-sql-client.html) to open an interactive SQL shell and set `movr` as the  [current database](sql-name-resolution.html#current-database):

      <section class="filter-content" markdown="1" data-scope="secure">
      {% include copy-clipboard.html %}
      ~~~ shell
      $ cockroach sql --certs-dir=certs --host=localhost:26257
      ~~~

      {% include copy-clipboard.html %}
      ~~~ sql
      > USE movr;
      ~~~
      </section>

      <section class="filter-content" markdown="1" data-scope="insecure">
      {% include copy-clipboard.html %}
      ~~~ shell
      $ cockroach sql --insecure --host=localhost:26257
      ~~~

      {% include copy-clipboard.html %}
      ~~~ sql
      > USE movr;
      ~~~        
      </section>

## How the MovR application works

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

## Extended examples

MovR scales as a geo-partitioned application and database that you can deploy using Docker images across a multi-region cluster deployment.

For a tutorial about geo-partitioning for fast reads and writes, see [Geo-Partitioning for Fast Reads and Writes in a Multi-Region Cluster](demo-geo-partitioning.html).

For a tutorial about performance tuning in CockroachDB, see [Performance Tuning](performance-tuning.html).

## See also

- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Build an App with CockroachDB](build-an-app-with-cockroachdb.html)
- [Experimental Features](experimental-features.html)
