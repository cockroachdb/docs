---
title: Connect an App to CockroachDB
summary: Learn how to use PostgreSQL drivers or ORMs to connect your application to CockroachDB.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSdqIhDnb4j41Hu_8EdFuSJKjXPq21BKuPGYoElOXxUNUeDwB5b5Fkfm5UmbZsYRcRJJL7tE6pkydO1/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### URL for comments

[Connect an App](https://docs.google.com/presentation/d/1gWU91CWOZMYyJ8f714jdz3x3URl1NlxU_Jhqdm17tVA/)

## Lab

In this lab, you'll use our provided code samples to get a small application connected to CockroachDB.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-insecure-cluster.html).

If you already have a secure cluster running, you can easily convert it to an insecure cluster:

~~~ shell
$ pkill -9 cockroach
~~~

~~~ shell
$ cockroach start --insecure --join localhost:26257,localhost:26258,localhost:26259

$ cockroach start --insecure --port 26258 --join localhost:26257,localhost:26258,localhost:26259 --store node2

$ cockroach start --insecure --port 26259 --join localhost:26257,localhost:26258,localhost:26259 --store node3

$ cockroach init
~~~

### Find the Code Samples

1. Go to [Build an App with CockroachDB](/stable/build-an-app-with-cockroachdb.html).

2. Choose your preferred language and driver or ORM.

3. Use the **Basic Statements** code sample to build a simple app.

## Up Next

- [Transactions](transactions.html)
