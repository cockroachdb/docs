---
title: Node Startup Troubleshooting
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
redirect_from: /training/node-startup-troubleshooting.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQfBd8ZbrmBUp6iXAkesniVSBZGLp5d4fG04PzeIHtOu1K8skQJ5qj-SSlAIvyzGGsJ8g-TgUvqBCj_/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Problem 1: SSL required

In this scenario, you try to add a node to a secure cluster without providing the node's security certificate.

### Step 1. Generate security certificates

{{site.data.alerts.callout_success}}If you have these resources still in place from the <a href="security.html">Security</a> module, you can skip this step.{{site.data.alerts.end}}

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

2. Create the CA certificate and key:

    {% include copy-clipboard.html %}
  	~~~ shell
  	$ ./cockroach cert create-ca \
  	--certs-dir=certs \
  	--ca-key=my-safe-directory/ca.key
  	~~~

3. Create the certificate and key for the your nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

4. Create client certificates and keys for the `root` and `spock` users:

    {% include copy-clipboard.html %}
  	~~~ shell
  	$ ./cockroach cert create-client \
  	root \
  	--certs-dir=certs \
  	--ca-key=my-safe-directory/ca.key
  	~~~

    {% include copy-clipboard.html %}
  	~~~ shell
  	$ ./cockroach cert create-client \
  	spock \
  	--certs-dir=certs \
  	--ca-key=my-safe-directory/ca.key
  	~~~

### Step 2. Start a secure 3-node cluster

1. Start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In another terminal, start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In another terminal, start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In another terminal, perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --certs-dir=certs
    ~~~

### Step 3. Simulate the problem

In the same terminal, try to add another node, but leave out the `--certs-dir` flag:

{{site.data.alerts.callout_info}}The <code>--logtostderr=WARNING</code> flag will make warnings and errors print to <code>stderr</code> so you don't have to manually look in the logs.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach start \
--store=node4 \
--host=localhost \
--port=26260 \
--http-port=8083 \
--join=localhost:26257,localhost:26258,localhost:26259 \
--logtostderr=WARNING
~~~

The startup process will fail, and you'll see the following printed to `stderr`:

~~~
W180208 15:41:15.531967 1 cli/start.go:697  Using the default setting for --cache (128 MiB).
  A significantly larger value is usually needed for good performance.
  If you have a dedicated server a reasonable setting is --cache=25% (2.0 GiB).
E180208 15:41:15.642980 1 cli/error.go:68  failed to start server: problem using security settings, did you mean to use --insecure?: problem with CA certificate: not found
*
* ERROR: failed to start server: problem using security settings, did you mean to use --insecure?: problem with CA certificate: not found
*
Failed running "start"
~~~

The error tells you that the failure has to do with security. Because the cluster is secure, it requires the new node to provide its security certificate in order to join.

### Step 4. Resolve the problem

To successfully join the node to the cluster, start the node again, but this time include the `--certs-dir` flag:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach start \
--certs-dir=certs \
--store=node4 \
--host=localhost \
--port=26260 \
--http-port=8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Problem 2: Wrong join address

In this scenario, you try to add another node to the cluster, but the `--join` address is not pointing at any of the existing nodes.

### Step 1. Simulate the problem

In a new terminal, try to add another node:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach start \
--certs-dir=certs \
--store=node5 \
--host=localhost \
--port=26261 \
--http-port=8084 \
--join=localhost:20000 \
--logtostderr=WARNING
~~~

The startup process will hang, and you'll see the following printed to `stderr`:

~~~
W180208 16:13:57.687021 1 cli/start.go:697  Using the default setting for --cache (128 MiB).
  A significantly larger value is usually needed for good performance.
  If you have a dedicated server a reasonable setting is --cache=25% (2.0 GiB).
W180208 16:13:57.809502 20 gossip/gossip.go:1241  [n?] no incoming or outgoing connections
W180208 16:13:57.812632 13 gossip/client.go:123  [n?] failed to start gossip client to localhost:20000: rpc error: code = Unavailable desc = grpc: the connection is unavailable
~~~

The last warning tells you that the node can't establish a connection with the address specified in the `--join` flag. Without a connection to the cluster, the node can't join.

### Step 2. Resolve the problem

1. Press **CTRL + C** twice to stop the previous startup attempt.

2. To successfully join the node to the cluster, start the node again, but this time include a correct `--join` address:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

## Problem 3: Missing join address

In this scenario, you try to add another node to the cluster, but the `--join` address missing entirely, which causes the new node to start its own separate cluster.

### Step 1. Simulate the problem

1. In a new terminal, try to add another node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node6 \
    --host=localhost \
    --port=26262 \
    --http-port=8085
    ~~~

    The startup process succeeds but, because a `--join` address wasn't specified, the node initializes itself as a new cluster instead of joining the existing cluster. You can see this in the `status` field printed to `stdout`:

    ~~~
    CockroachDB node starting at 2018-02-08 16:30:26.690638 +0000 UTC (took 0.2s)
    build:      CCL {{page.release_info.version}} @ 2018/01/08 17:30:06 (go1.8.3)
    admin:      https://localhost:8085
    sql:        postgresql://root@localhost:26262?application_name=cockroach&sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
    logs:       /Users/jesseseldess/cockroachdb-training/cockroach-{{page.release_info.version}}.darwin-10.9-amd64/node6/logs
    store[0]:   path=/Users/jesseseldess/cockroachdb-training/cockroach-{{page.release_info.version}}.darwin-10.9-amd64/node6
    status:     initialized new cluster
    clusterID:  cfcd80ee-9005-4975-9ae9-9c36d9aaa57e
    nodeID:     1
    ~~~

2. Press **CTRL + C** to stop the new node.

3. Start the node again, but this time include a correct `--join` address:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node6 \
    --host=localhost \
    --port=26262 \
    --http-port=8085 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

    The startup process fails because the cluster notices that the node's cluster ID does not match the cluster ID of the nodes it is trying to join to:   

    ~~~
    F180208 16:41:20.387821 136 storage/replica.go:5217  [n1,s1,r1/1:/{Min-System/}] store 1 belongs to cluster cfcd80ee-9005-4975-9ae9-9c36d9aaa57e, but attempted to join cluster 5007b180-9b08-4a08-a882-53915fb459a1 via gossip
    goroutine 136 [running]:
    github.com/cockroachdb/cockroach/pkg/util/log.getStacks(0x69fe700, 0x0, 0x0, 0x12)
    	/go/src/github.com/cockroachdb/cockroach/pkg/util/log/clog.go:872 +0xa7
    github.com/cockroachdb/cockroach/pkg/util/log.(*loggingT).outputLogEntry(0x69fe700, 0xc400000004, 0x6475169, 0x12, 0x1461, 0xc4208580b0, 0xaa)
    ...
    ~~~

### Step 2. Resolve the problem

To successfully join the node to the cluster, you need to remove the node's data directory, which is where its incorrect cluster ID is stored, and start the node again:

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf node6
~~~

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach start \
--certs-dir=certs \
--store=node6 \
--host=localhost \
--port=26262 \
--http-port=8085 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

This time, the startup process succeeds, and the `status` tells you that the node joined the intended cluster:

~~~
CockroachDB node starting at 2018-02-08 16:51:24.23112 +0000 UTC (took 0.2s)
build:      CCL {{page.release_info.version}} @ 2018/01/08 17:30:06 (go1.8.3)
admin:      https://localhost:8085
sql:        postgresql://root@localhost:26262?application_name=cockroach&sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
logs:       /Users/jesseseldess/cockroachdb-training/cockroach-{{page.release_info.version}}.darwin-10.9-amd64/node6/logs
store[0]:   path=/Users/jesseseldess/cockroachdb-training/cockroach-{{page.release_info.version}}.darwin-10.9-amd64/node6
status:     initialized new node, joined pre-existing cluster
clusterID:  5007b180-9b08-4a08-a882-53915fb459a1
nodeID:     6    
~~~

## What's Next?

[Client Connection Troubleshooting](client-connection-troubleshooting.html)
