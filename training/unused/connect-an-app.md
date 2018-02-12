---
title: Connect an App to CockroachDB
summary: Learn how to use PostgreSQL drivers or ORMs to connect your application to CockroachDB.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSdqIhDnb4j41Hu_8EdFuSJKjXPq21BKuPGYoElOXxUNUeDwB5b5Fkfm5UmbZsYRcRJJL7tE6pkydO1/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, you'll use our provided code samples to get a small application connected to CockroachDB.

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-insecure-cluster.html).

If you already have a secure cluster running, you can easily convert it to an insecure cluster:

1. Intiate a shutdown of all `cockroach` processes, and then intiate a hard shutdown:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    This simplified process is only appropriate for a lab/evaluation scenario. In a production environment, you would use `cockroach quit` to gracefully shut down each node.

2. Restart the cluster insecurely, by running each of these commands in *new* terminal windows:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --join localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --port 26258 --join localhost:26257,localhost:26258,localhost:26259 --store node2
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --port 26259 --join localhost:26257,localhost:26258,localhost:26259 --store node3
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init
    ~~~

### Find the Code Samples

1. Go to [Build an App with CockroachDB](../stable/build-an-app-with-cockroachdb.html).

2. Choose your preferred language and driver or ORM.

3. Use the **Basic Statements** code sample to build a simple app.

## What's Next?

- [Transactions](transactions.html)
