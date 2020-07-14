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

{% include {{ page.version.version }}/misc/movr-schema.md %}

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

1. Use [`cockroach sql`](cockroach-sql.html) to open an interactive SQL shell and set `movr` as the  [current database](sql-name-resolution.html#current-database):

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

{% include {{ page.version.version }}/misc/movr-workflow.md %}

## Extended examples

For a tutorial on running MovR against a multi-region cluster, using two important multi-region [data topologies](topology-patterns.html) to get very low latency reads and writes, see [Low Latency, Multi-Region Deployment](demo-low-latency-multi-region-deployment.html).

For a tutorial about performance tuning in CockroachDB, see [Performance Tuning](performance-tuning.html).

For a tutorial on developing and deploying a multi-region web application for MovR, see [Develop and Deploy a Multi-Region Web Application](multi-region-overview.html).

## See also

- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Build an App with CockroachDB](build-an-app-with-cockroachdb.html)
- [Experimental Features](experimental-features.html)
