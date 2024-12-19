---
title: MovR
summary: The MovR application uses CockroachDB to store information about vehicles, users, and rides.
toc: true
docs_area: develop
---

MovR is a fictional vehicle-sharing company created to demonstrate CockroachDB's features.

## Overview

The MovR example consists of the following:

- The `movr` dataset, which contains rows of data that populate tables in the `movr` database. The `movr` dataset is built into [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) and [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}).
- The MovR application, a fully-functional vehicle-sharing application, written in Python. All of MovR application source code is open-source, and available on the [movr](https://github.com/cockroachdb/movr) GitHub repository.

## The `movr` database

{% include {{ page.version.version }}/misc/movr-schema.md %}

## Generating schemas and data for MovR

You can use the `cockroach demo` and `cockroach workload` commands to load the `movr` database and dataset into a CockroachDB cluster.

[`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) opens a SQL shell to a temporary, in-memory cluster. To open a SQL shell to a demo cluster with the `movr` database preloaded and set as the [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database), use the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo movr
~~~

[`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}) loads sample datasets and workloads into running clusters. To load the `movr` database and some sample data into a running cluster, do the following:

1. Start a [secure]({% link {{ page.version.version }}/secure-a-cluster.md %}) or [insecure]({% link {{ page.version.version }}/start-a-local-cluster.md %}) local cluster.
1. Use `cockroach workload` to load the `movr` dataset:

    <div class="filters filters-big clearfix">
      <button class="filter-button" data-scope="secure">Secure</button>
      <button class="filter-button" data-scope="insecure">Insecure</button>
    </div>

    <section class="filter-content" markdown="1" data-scope="secure">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr 'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="insecure">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr 'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    </section>

1. Use [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) to open an interactive SQL shell and set `movr` as the  [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database):

    <section class="filter-content" markdown="1" data-scope="secure">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > USE movr;
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="insecure">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26257
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > USE movr;
    ~~~        

    </section>

## How the MovR application works

{% include {{ page.version.version }}/misc/movr-workflow.md %}

## Extended examples

For a tutorial on running MovR against a multi-region cluster, using two important multi-region [data topologies]({% link {{ page.version.version }}/topology-patterns.md %}) to get very low latency reads and writes, see [Low Latency, Multi-Region Deployment]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}).

### Develop and deploy a global application

For a tutorial on developing and deploying a globally-available web application for MovR, use the following docs:

1. [MovR: A Global Application Use-case]({% link {{ page.version.version }}/movr-flask-use-case.md %})
1. [Create a Multi-region Database Schema]({% link {{ page.version.version }}/movr-flask-database.md %})
1. [Set up a Virtual Environment for Developing Global Applications]({% link {{ page.version.version }}/movr-flask-setup.md %})
1. [Develop a Global Application]({% link {{ page.version.version }}/movr-flask-application.md %})
1. [Deploy a Global Application]({% link {{ page.version.version }}/movr-flask-deployment.md %})

## See also

- [Learn CockroachDB SQL]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %})
- [Build an App with CockroachDB]({% link {{ page.version.version }}/example-apps.md %})
- [Features in Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %})
