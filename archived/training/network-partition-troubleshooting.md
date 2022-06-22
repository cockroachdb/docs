---
title: Network Partition Troubleshooting
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRGqsJXtK3qaCx7c5DC7R17ngFgsBPUGDUC1saTsLwlhaS8UAZN9_deuWHH0IvG97Pk9ahMhGktR42n/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

Note that this lab involves running a cluster in Docker so that you can use it to fake a partition between datacenters. You will need to have [Docker Compose](https://docs.docker.com/compose/install/) on your local machine, so you may just want to observe this one.

## Step 1. Create a cluster in Docker across 3 simulated datacenters

1. Download the Docker Compose file that defines a 6-node CockroachDB cluster spread across 3 separate networks:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/{{ page.version.version }}/training/resources/docker-compose.yaml
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/{{ page.version.version }}/training/resources/docker-compose.yaml
    ~~~
    </div>

2. Create the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ COCKROACH_VERSION={{ page.release_info.version }} docker-compose up
    ~~~~

3. In a new terminal, initialize the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker exec -it roach-0 /cockroach/cockroach init --insecure
    ~~~~

4. Verify that the cluster is working by opening the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>.

## Step 2. Create a partition in the network

1. Disconnect the nodes in `dc-2` from the shared network backbone:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker network disconnect cockroachdb-training-shared roach-4
    ~~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker network disconnect cockroachdb-training-shared roach-5
    ~~~~

## Step 3. Troubleshoot the problem

1. The Admin UI should now show that 2 of the nodes in the cluster have changed from "Healthy" to "Suspect":

    <img src="{{ 'images/v20.1/training-22.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

2. Check whether the "Suspect" nodes are still running by hitting their `/health` endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl localhost:8085/health
    ~~~~

    ~~~
    {
      "nodeId": 3,
      "address": {
        "networkField": "tcp",
        "addressField": "roach-5:26257"
      },
      "buildInfo": {
        "goVersion": "go1.10",
        "tag": "v2.0.0",
        "time": "2018/04/03 20:56:09",
        "revision": "a6b498b7aff14234bcde23107b9e7fa14e6a34a8",
        "cgoCompiler": "gcc 6.3.0",
        "cgoTargetTriple": "x86_64-unknown-linux-gnu",
        "platform": "linux amd64",
        "distribution": "CCL",
        "type": "release",
        "channel": "official-binary",
        "dependencies": null
      }
    }
    ~~~

3. Check whether the "Suspect" nodes consider themselves live by hitting their `/_admin/v1/health` endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl localhost:8085/_admin/v1/health
    ~~~~

    ~~~
    {
      "error": "node is not live",
      "code": 14
    }
    ~~~

4. Check the logs of the downed nodes to see if they contain any clues, where you should find errors like "Error while dialing", "no such host", and "the connection is unavailable":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker logs roach-5
    ~~~~

    ~~~
    ...
    I180213 20:38:14.728914 211 vendor/google.golang.org/grpc/grpclog/grpclog.go:75  grpc: addrConn.resetTransport failed to create client transport: connection error: desc = "transport: Error while dialing dial tcp: lookup roach-1 on 127.0.0.11:53: no such host"; Reconnecting to {roach-1:26257 <nil>}
    ...
    W180213 20:38:20.093309 286 storage/node_liveness.go:342  [n5,hb] failed node liveness heartbeat: failed to send RPC: sending to all 3 replicas failed; last error: {<nil> rpc error: code = Unavailable desc = grpc: the connection is unavailable}
    ~~~

5. Check whether the majority nodes are able to talk to the minority nodes at all by looking at the network latency debug page at <a href="http://localhost:8080/#/reports/network" data-proofer-ignore>http://localhost:8080/#/reports/network</a>:

    <img src="{{ 'images/v20.1/training-23.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

6. If you really want to confirm that the network isn't working, try manually pinging a node in `dc-2` from a node in `dc-0`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker exec -t roach-0 ping roach-5
    ~~~~

    ~~~
    ping: unknown host
    ~~~

## Step 4. Fix the partition

1. Reconnect the nodes in `dc-2` to the shared network backbone:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker network connect cockroachdb-training-shared roach-4
    ~~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker network connect cockroachdb-training-shared roach-5
    ~~~~

2. After a few seconds, you should see the nodes go back to healthy again.

## Step 5. Clean up

You will not be using this Docker cluster in any other labs, so take a moment to clean things up.

1. In the terminal where you ran `docker-compose up`, press **CTRL-C** to stop all the CockroachDB nodes.

2. Delete all Docker resources created by the tutorial:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker-compose down
    ~~~

## What's next?

[How Cockroach Labs Debugs](how-cockroach-labs-debugs.html)
