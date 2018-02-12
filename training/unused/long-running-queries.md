---
title: Long Running Queries
summary:
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRTFcuRZXD__ddiZsGUIbHS4hM7Oqxu0muKt5OCJziJpB39ciLHL3kjcnnuJK7Joix5pNgak5kgv4kD/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll check out the page in the Admin UI that also shows us long-running queries.

### Before You Begin

To complete this lab, you need:

- A [secure local cluster of 3 nodes](3-node-local-secure-cluster.html).
- Installed the CockroachDB version of YCSB:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">

    {% include copy-clipboard.html %}
    ~~~ shell
    # Get the CockroachDB tarball:
    $ curl -O https://github.com/cockroachdb/docs/blob/master/training/resources/crdb-ycsb-mac.tar.gz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Extract the binary:
    $ tar xfz crdb-ycsb-mac.tar.gz
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">

    {% include copy-clipboard.html %}
    ~~~ shell
    # Get the CockroachDB tarball:
    $ wget https://github.com/cockroachdb/docs/blob/master/training/resources/crdb-ycsb-linux.tar.gz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Extract the binary:
    $ tar xfz crdb-ycsb-linux.tar.gz
    ~~~
    </div>

### Step 1. Start YCSB

{% include copy-clipboard.html %}
~~~ shell
$ ./ycsb -duration 5m -tolerate-errors -concurrency 2 -rate-limit 100 'postgres://root@localhost:26257/?sslmode=verify-ca&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key'
~~~

{{site.data.alerts.callout_info}}This is slightly different than when we ran YCSB previously because we're connecting directly to a node instead of a load balancer. In this scenario, if the node we connected to went down, our application could not connect to the database.{{site.data.alerts.end}}

### Step 2. Find running queries in the CLI

1. Launch the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs
    ~~~

2. Find currently active queries:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW QUERIES;
    ~~~

    You can also filter for queries that have been running for a certain amount of time. For example, to find queries that have been running for more than 1 hour, you would run the following:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '1 hour');
    ~~~

3. We're done with the load generator, so you can stop it by going to its terminal and quitting the process.

### Step 3. Cancel Long-Running Queries

Once you've identified a long-running query via `SHOW QUERIES`, note the `query_id` and use it with the `CANCEL QUERY` statement. For example:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~


## What's Next?

- [Third-Party Monitoring & Alerts](monitoring.html)
