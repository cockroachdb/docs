---
title: Client Connection Troubleshooting
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSAcuSBQiKNT-2NbFHVTZsLbktN0UYcR1e_k5F-nAqOjqgUsxO2nbKGmmJAlPgGe43QDHnClVIuVz_x/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

Make sure you have already completed [Node Startup Troubleshooting](node-startup-troubleshooting.html) and have 6 nodes running securely.

## Problem 1: SSL required

In this scenario, you try to connect a user without providing a client certificate.

### Step 1. Simulate the problem

1. In a new terminal, as the `root` users, create a new user called `kirk`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --execute="CREATE USER kirk;"
    ~~~

2. As the `kirk` user, try to connect to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --user=kirk \
    --execute="SHOW DATABASES;"
    ~~~

    Because `kirk` doesn't have a client certificate in the `certs` directory, the cluster asks for the user's password:

    ~~~
    Enter password:
    ~~~

4. Because `kirk` doesn't have a password, press **Enter**.

    The connection attempt fails, and the following error is printed to `stderr`:

    ~~~
    Error: pq: invalid password
    Failed running "sql"
    ~~~

### Step 2. Resolve the problem

To successfully connect the user, you must first either generate a client certificate or create a password for the user. It's generally best to use certificates over passwords, so do that here.

1. Generate a client certificate for the `kirk` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    kirk \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

2. As the `kirk` user, try to connect to the cluster again:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --user=kirk \
    --execute="SHOW DATABASES;"
    ~~~

    This time, the connection attempt succeeds:

    ~~~
      database_name
    +---------------+
    (0 rows)
    ~~~

## Problem 2: Wrong host or port

In this scenario, you try to connect the `kirk` user again but specify a `--port` that is not in use by any of the existing nodes.

### Step 1. Simulate the problem

Try to connect the `kirk` user:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=certs \
--host=localhost:26257 \
--user=kirk \
--port=20000 \
--execute="SHOW DATABASES;"
~~~

The connection attempt fails, and the following is printed to `stderr`:

~~~
Error: unable to connect or connection lost.

Please check the address and credentials such as certificates (if attempting to
communicate with a secure cluster).

dial tcp [::1]:20000: connect: connection refused
Failed running "sql"
~~~

### Step 2. Resolve the problem

To successfully connect the user, try again using a correct `--port`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=certs \
--host=localhost:26257 \
--user=kirk \
--port=26259 \
--execute="SHOW DATABASES;"
~~~

This time, the connection attempt succeeds:

~~~
  database_name
+---------------+
(0 rows)
~~~

## Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Terminate all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 node6
    ~~~

## What's next?

[Under-Replication Troubleshooting](under-replication-troubleshooting.html)
