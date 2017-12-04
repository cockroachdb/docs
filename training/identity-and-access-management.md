---
title: Identity & Access Management
summary: Learn how to control access to your cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRCnd6jA1VlsfozEjJukJSZgrMA83qTFeWiMc5mP7moYxy3tOcTT8NHsEnt2eAkHKT9J6XVjDUgbiTv/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll cover how to create other users and connect to the cluster as them.

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-insecure-cluster.html).

### Step 1. Creating Users

Add a user to our cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach user set itsme --insecure
~~~

### Step 2. Assigning Privileges

Now, still as the `root` user, let's create a database and grant the user privileges to it:

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure -e "CREATE DATABASE test"
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e "GRANT SELECT, INSERT, UPDATE, DELETE ON DATABASE test TO itsme;"
~~~

### Step 3. Connecting as a User

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --user=itsme
~~~

### Step 4. Verifying Privileges

Now, given that we only set `itsme` to have `SELECT`, `INSERT`, `UPDATE` and `DELETE` privileges, the user should not be able to perform `CREATE` operations.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE test.foo (a INT, b TEXT);
~~~

~~~
pq: user itsme does not have CREATE privilege on database foo
~~~

## Up Next

- [Security](security.html)
