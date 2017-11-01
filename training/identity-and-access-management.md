---
title: Identity & Access Management
summary: Learn how to control access to your cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Identity & Access Management](https://docs.google.com/presentation/d/1_koVGEYbs-rmjFtHovzMFvXb1Jte-3xO5KsdavAxu7E/)

## Lab

User and identity management are crucial components to ensure your application's security.

Up to this point, we've only accessed `cockroach` as the `root` user, which is not ideal from a security standpoint. In this lab, we'll cover how to create other users and connect to the cluster as them.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-insecure-cluster.html).

### Step 1. Creating Users

Because we still haven't set up SSL certificates for our cluster yet, we cannot meaningfully add user authentication, so we'll simply add a user to our cluster.

~~~
$ cockroach user set itsme --insecure
~~~

### Step 2. Assigning Privileges

Now, still as the `root` user, let's assign this user privileges:

~~~
$ cockroach sql --insecure -e "GRANT SELECT, INSERT, UPDATE, DELETE ON table test.kv TO itsme;"
~~~

### Step 3. Connecting as a User

~~~
$ cockroach sql --insecure --user=itsme
~~~

### Step 4. Verifying Privileges

Now, given that we only set `itsme` to have SELECT, INSERT, UPDATE and DELETE privileges, the user should not be able to perform `CREATE` operations.

~~~ sql
> CREATE TABLE foo (a INT, b TEXT);
~~~
~~~
pq: user itsme does not have CREATE privilege on database foo
~~~

## Up Next

- [Security](security.html)
