---
title: Start a Cluster in Docker (Insecure)
summary: Run an insecure multi-node CockroachDB cluster across multiple Docker containers on a single host.
toc: true
---

Once you've [installed the official CockroachDB Docker image](install-cockroachdb.html), it's simple to run an insecure multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

## Step 1. Start the cluster

1. Create data files folder.


For use with docker-compose need data folder, where will be saved node files, where will be saved.

When using cockroachdb need minimal tree nodes, for use cluster.
    {% include copy-clipboard.html %}

    ~~~ shell
    $ mkdir -p cockroach-data/roach1 cockroach-data/roach2 cockroach-data/roach3
    ~~~

2. Create docker-compose file
    {% include copy-clipboard.html %}
    ~~~ yml
    {% remote_include https://raw.githubusercontent.com/devalexandre/cockroachdb/master/docker-compose.yml %}
    ~~~

After run , output is this information appeared for roach2 and roach3 as well.

    ~~~ shell

    * WARNING: neither --listen-addr nor --advertise-addr was specified.

    roach1     | * The server will advertise "9a6077013273" to other nodes, is this routable?
    roach1     | * 
    roach1     | * Consider using:
    roach1     | * - for local-only servers:  --listen-addr=localhost
    roach1     | * - for multi-node clusters: --advertise-addr=<host/IP addr>
    roach1     | * 
    roach1     | *
    roach1     | CockroachDB node starting at 2021-11-16 02:18:43.668882264 +0000 UTC (took 4.4s)
    roach1     | build:               CCL v21.1.11 @ 2021/10/18 14:39:35 (go1.15.14)
    roach1     | webui:               http://9a6077013273:8080
    roach1     | sql:                 postgresql://root@9a6077013273:26257?sslmode=disable
    roach1     | RPC client flags:    /cockroach/cockroach <client cmd> --host=9a6077013273:26257 --insecure
    roach1     | logs:                /cockroach/cockroach-data/logs
    roach1     | temp dir:            /cockroach/cockroach-data/cockroach-temp502482438
    roach1     | external I/O path:   /cockroach/cockroach-data/extern
    roach1     | store[0]:            path=/cockroach/cockroach-data
    roach1     | storage engine:      pebble
    roach1     | status:              restarted pre-existing node
    roach1     | clusterID:           88f38c62-1e8e-4a3b-a7ad-09bf2970bd06
    roach1     | nodeID:              2

    ~~~

## Step 2. Create Loadbalance for Cluster with Haproxy
haproxy is an open source load balancer and very easy to use

1. Create a haproxy.cfg in root project folder
    {% include copy-clipboard.html %}
    ~~~ shell
    {% remote_include https://raw.githubusercontent.com/devalexandre/cockroachdb/master/haproxy/haproxy.cfg %}
    ~~~
  Create a image for to use the config 
   ~~~ shell
    {% remote_include https://raw.githubusercontent.com/devalexandre/cockroachdb/master/haproxy/Dockerfile %}
    ~~~
  
 Now use localhost:26257 for connect in database

 Now open [http://localhost:8080](http://localhost:8080)

 ![dashboard](https://d33wubrfki0l68.cloudfront.net/424bcaace273f8386db82e70a22514782a03285c/d41d1/docs/images/v21.2/ui_cluster_overview_5_nodes.png)
   
## What's next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](hello-world-example-apps.html)
- Further explore CockroachDB capabilities like [fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html), [multi-region performance](demo-low-latency-multi-region-deployment.html), [serializable transactions](demo-serializable.html), and [JSON support](demo-json-support.html)
