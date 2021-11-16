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
   version: '3.5'

    services:

    roach1:
        image: cockroachdb/cockroach:v21.1.11
        container_name: roach1
        command: start --insecure --join=roach1,roach2,roach3  --accept-sql-without-tls 
        volumes:
        - "${PWD}/cockroach-data/roach1:/cockroach/cockroach-data"
        networks:
        cockroachdb_net:
            aliases:
            - roach1

    roach2:
        image: cockroachdb/cockroach:v21.1.11
        container_name: roach2
        command: start --insecure --join=roach1,roach2,roach3   --accept-sql-without-tls 
        volumes:
        - "${PWD}/cockroach-data/roach2:/cockroach/cockroach-data"
        networks:
        cockroachdb_net:
            aliases:
            - roach2

    roach3:
        image: cockroachdb/cockroach:v21.1.11
        container_name: roach3
        command: start --insecure --join=roach1,roach2,roach3  --accept-sql-without-tls 
        volumes:
        - "${PWD}/cockroach-data/roach3:/cockroach/cockroach-data"
        networks:
        cockroachdb_net:
            aliases:
            - roach3
        
    networks:
        cockroachdb_net:
            driver: bridge
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
### Note

for init all cluster exec

~~~ shell
 docker exec -it roach1 cockroach init --insecure
~~~
## Step 2. Create Loadbalance for UI

When are using three nodes, need to create a load balancer.
Create first for the access dashboard graphic interface.
Add in docker-compose.yml

1. Create a nginx.conf in root project folder
    {% include copy-clipboard.html %}
    ~~~ shell

    events {
    worker_connections 1024;
    }

    # its work for acess database dashboard
    http {
        upstream dashboard {
            server roach1:8080; #node1
            server roach2:8080; #node2
            server roach3:8080; #node3
        }
        
        server {
            listen 4000;
            location / {
                proxy_pass http://dashboard;
            }
        }
    }

    ~~~
2. Create docker-compose file
    {% include copy-clipboard.html %}
    ~~~ yml
     nginx:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - roach1
      - roach2
      - roach3
    ports:
      - "8080:4000"
    networks:
      cockroachdb_net:
        aliases:
          - loadbalance
    ~~~
 Now open [http://localhost:8080](http://localhost:8080)

 ![dashboard](https://d33wubrfki0l68.cloudfront.net/424bcaace273f8386db82e70a22514782a03285c/d41d1/docs/images/v21.2/ui_cluster_overview_5_nodes.png)

## Step 3. Create Loadbalance for Cluster with Haproxy
haproxy is an open source load balancer and very easy to use

1. Create a haproxy.cfg in root project folder
    {% include copy-clipboard.html %}
    ~~~ shell
        global
        maxconn 4096

        defaults
            mode                tcp
            # Timeout values should be configured for your specific use.
            # See: https://cbonte.github.io/haproxy-dconv/1.8/configuration.html#4-timeout%20connect
            timeout connect     10s
            timeout client      1m
            timeout server      1m
            # TCP keep-alive on client side. Server already enables them.
            option              clitcpka

        listen psql
            bind :26257
            mode tcp
            balance roundrobin
            option httpchk GET /health?ready=1
            server cockroach1 roach1:26257 check port 8080
            server cockroach2 roach2:26257 check port 8080
            server cockroach3 roach3:26257 check port 8080
    ~~~
 Now use localhost:26257 for connect in database
    
## What's next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](hello-world-example-apps.html)
- Further explore CockroachDB capabilities like [fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html), [multi-region performance](demo-low-latency-multi-region-deployment.html), [serializable transactions](demo-serializable.html), and [JSON support](demo-json-support.html)
