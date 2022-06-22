---
title: Node Startup Troubleshooting
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false

---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQfBd8ZbrmBUp6iXAkesniVSBZGLp5d4fG04PzeIHtOu1K8skQJ5qj-SSlAIvyzGGsJ8g-TgUvqBCj_/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Problem 1: SSL required

In this scenario, you try to add a node to a secure cluster without providing the node's security certificate. You'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

### Step 1. Generate security certificates

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

2. Create the CA certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Create the certificate and key for the your nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

4. Create client certificates and keys for the `root` and `spock` users:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    spock \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

### Step 2. Start a secure 3-node cluster

1. Start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs --host=localhost:26257
    ~~~

### Step 3. Simulate the problem

In the same terminal, try to add another node, but leave out the `--certs-dir` flag:

{{site.data.alerts.callout_info}}
The `--logtostderr=WARNING` flag will make warnings and errors print to `stderr` so you do not have to manually look in the logs.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--store=node4 \
--listen-addr=localhost:26260 \
--http-addr=localhost:8083 \
--join=localhost:26257,localhost:26258,localhost:26259 \
--logtostderr=WARNING
~~~

The startup process will fail, and you'll see the following printed to `stderr`:

~~~
W191203 19:35:14.018995 1 cli/start.go:1046  Using the default setting for --cache (128 MiB).
  A significantly larger value is usually needed for good performance.
  If you have a dedicated server a reasonable setting is --cache=.25 (8.0 GiB).
W191203 19:35:14.019049 1 cli/start.go:1059  Using the default setting for --max-sql-memory (128 MiB).
  A significantly larger value is usually needed in production.
  If you have a dedicated server a reasonable setting is --max-sql-memory=.25 (8.0 GiB).
*
* ERROR: cannot load certificates.
* Check your certificate settings, set --certs-dir, or use --insecure for insecure clusters.
*
* failed to start server: problem with CA certificate: not found
*
E191203 19:35:14.137329 1 cli/error.go:233  cannot load certificates.
Check your certificate settings, set --certs-dir, or use --insecure for insecure clusters.

failed to start server: problem with CA certificate: not found
Error: cannot load certificates.
Check your certificate settings, set --certs-dir, or use --insecure for insecure clusters.

failed to start server: problem with CA certificate: not found
Failed running "start"
~~~

The error tells you that the failure has to do with security. Because the cluster is secure, it requires the new node to provide its security certificate in order to join.

### Step 4. Resolve the problem

To successfully join the node to the cluster, start the node again, but this time include the `--certs-dir` flag:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--store=node4 \
--listen-addr=localhost:26260 \
--http-addr=localhost:8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Problem 2: Wrong join address

In this scenario, you try to add another node to the cluster, but the `--join` address is not pointing at any of the existing nodes.

### Step 1. Simulate the problem

In a new terminal, try to add another node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--store=node5 \
--listen-addr=localhost:26261 \
--http-addr=localhost:8084 \
--join=localhost:20000 \
--logtostderr=WARNING
~~~

The process will never complete, and you'll see a continuous stream of warnings like this:

~~~
W180817 17:01:56.506968 886 vendor/google.golang.org/grpc/clientconn.go:942  Failed to dial localhost:20000: grpc: the connection is closing; please retry.
W180817 17:01:56.510430 914 vendor/google.golang.org/grpc/clientconn.go:1293  grpc: addrConn.createTransport failed to connect to {localhost:20000 0  <nil>}. Err :connection error: desc = "transport: Error while dialing dial tcp [::1]:20000: connect: connection refused". Reconnecting...
~~~

These warnings tell you that the node cannot establish a connection with the address specified in the `--join` flag. Without a connection to the cluster, the node cannot join.

### Step 2. Resolve the problem

1. Press **CTRL-C** twice to stop the previous startup attempt.

2. To successfully join the node to the cluster, start the node again, but this time include a correct `--join` address:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

## Problem 3: Missing join address

In this scenario, you try to add another node to the cluster, but the `--join` address missing entirely, which causes the new node to start its own separate cluster.

### Step 1. Simulate the problem

1. In a new terminal, try to add another node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node6 \
    --listen-addr=localhost:26262 \
    --http-addr=localhost:8085
    ~~~

    The startup process succeeds but, because a `--join` address wasn't specified, the node initializes itself as a new cluster instead of joining the existing cluster. You can see this in the `status` field printed to `stdout`:

    ~~~
    CockroachDB node starting at 2018-02-08 16:30:26.690638 +0000 UTC (took 0.2s)
    build:      CCL {{page.release_info.version}} @ 2018/01/08 17:30:06 (go1.8.3)
    webui:               https://localhost:8085
    sql:                 postgresql://root@localhost:26262?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
    RPC client flags:    cockroach <client cmd> --host=localhost:26262 --certs-dir=certs
    logs:                /Users/crossman/node6/logs
    temp dir:            /Users/crossman/node6/cockroach-temp138121774
    external I/O path:   /Users/crossman/node6/extern
    store[0]:            path=/Users/crossman/node6
    status:              initialized new cluster
    clusterID:           e2514c0a-9dd5-4b2e-a20f-85183365c207
    nodeID:              1
    ~~~

2. Press **CTRL-C** to stop the new node.

3. Start the node again, but this time include a correct `--join` address:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node6 \
    --listen-addr=localhost:26262 \
    --http-addr=localhost:8085 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

    The startup process fails because the cluster notices that the node's cluster ID does not match the cluster ID of the nodes it is trying to join to:   

    ~~~
    W180815 17:21:00.316845 237 gossip/client.go:123  [n1] failed to start gossip client to localhost:26258: initial connection heartbeat failed: rpc error: code = Unknown desc = client cluster ID "9a6ed934-50e8-472a-9d55-c6ecf9130984" doesn't match server cluster ID "ab6960bb-bb61-4e6f-9190-992f219102c6"
    ~~~

4. Press **CTRL-C** to stop the new node.

### Step 2. Resolve the problem

To successfully join the node to the cluster, you need to remove the node's data directory, which is where its incorrect cluster ID is stored, and start the node again:

{% include_cached copy-clipboard.html %}
~~~ shell
$ rm -rf node6
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--store=node6 \
--listen-addr=localhost:26262 \
--http-addr=localhost:8085 \
--join=localhost:26257,localhost:26258,localhost:26259 \
--background
~~~

This time, the startup process succeeds, and the `status` (added to the logs because you used `--background`) tells you that the node joined the intended cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ grep -A 11 'CockroachDB node starting at' ./node6/logs/cockroach.log
~~~

~~~
CockroachDB node starting at 2019-07-23 04:21:33.130572 +0000 UTC (took 0.2s)
build:               CCL {{page.release_info.version}} @ 2019/05/22 22:44:42 (go1.12.5)
webui:               https://localhost:8085
sql:                 postgresql://root@localhost:26262?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
client flags:        cockroach <client cmd> --host=localhost:26262 --certs-dir=certs
logs:                /Users/will/Downloads/temp-cockroach-cluster/node6/logs
temp dir:            /Users/will/Downloads/temp-cockroach-cluster/node6/cockroach-temp509471222
external I/O path:   /Users/will/Downloads/temp-cockroach-cluster/node6/extern
store[0]:            path=/Users/will/Downloads/temp-cockroach-cluster/node6
status:              initialized new node, joined pre-existing cluster
clusterID:           e40f17e6-b4aa-4e69-bd7e-ecd6556194c3
nodeID:              6
~~~

## What's next?

[Client Connection Troubleshooting](client-connection-troubleshooting.html)
