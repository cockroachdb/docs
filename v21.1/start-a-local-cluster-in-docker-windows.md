---
title: Start a Cluster in Docker (Insecure)
summary: Run an insecure multi-node CockroachDB cluster across multiple Docker containers on a single host.
toc: true
asciicast: true
---

<div id="os-tabs" class="clearfix">
  <a href="start-a-local-cluster-in-docker-mac.html"><button id="mac" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button></a>
  <a href="start-a-local-cluster-in-docker-linux.html"><button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button></a>
  <button id="windows" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button>
</div>

Once you've [installed the official CockroachDB Docker image](install-cockroachdb.html), it's simple to run an insecure multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

## Before you begin

- Make sure you have already [installed the official CockroachDB Docker image](install-cockroachdb.html).
- For quick SQL testing or app development, consider [running a single-node cluster](cockroach-start-single-node.html) instead.
- Note that running multiple nodes on a single host is useful for testing CockroachDB, but it's not suitable for production. To run a physically distributed cluster in containers, use an orchestration tool like Kubernetes or Docker Swarm. See [Orchestration](orchestration.html) for more details, and review the [Production Checklist](recommended-production-settings.html).

## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/#/a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks.

~~~ powershell
PS C:\Users\username> docker network create -d bridge roachnet
~~~

We've used `roachnet` as the network name here and in subsequent steps, but feel free to give your network any name you like.

## Step 2. Start the cluster

1. Start the first node:

    {{site.data.alerts.callout_info}}Be sure to replace <code>&#60;username&#62;</code> in the <code>-v</code> flag with your actual username.{{site.data.alerts.end}}

    ~~~ powershell
    PS C:\Users\username> docker run -d `
    --name=roach1 `
    --hostname=roach1 `
    --net=roachnet `
    -p 26257:26257 -p 8080:8080  `
    -v "//c/Users/<username>/cockroach-data/roach1:/cockroach/cockroach-data"  `
    {{page.release_info.docker_image}}:{{page.release_info.version}} start `
    --insecure `
    --join=roach1,roach2,roach3
    ~~~

2. This command creates a container and starts the first CockroachDB node inside it. Take a moment to understand each part:
    - `docker run`: The Docker command to start a new container.
    - `-d`: This flag runs the container in the background so you can continue the next steps in the same shell.
    - `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container.
    - `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
    - `--net`: The bridge network for the container to join. See step 1 for more details.
    - `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port for HTTP requests to the DB Console (`8080`) from the container to the host. This enables inter-container communication and makes it possible to call up the DB Console from a browser.
    - `-v "//c/Users/<username>/cockroach-data/roach1:/cockroach/cockroach-data"`: This flag mounts a host directory as a data volume. This means that data and logs for this node will be stored in `Users/<username>/cockroach-data/roach1` on the host and will persist after the container is stopped or deleted. For more details, see Docker's <a href="https://docs.docker.com/engine/admin/volumes/bind-mounts/">Bind Mounts</a> topic.
    - `{{page.release_info.docker_image}}:{{page.release_info.version}} start --insecure --join`: The CockroachDB command to [start a node](cockroach-start.html) in the container in insecure mode. The `--join` flag specifies the `hostname` of each node that will initially comprise your cluster. Otherwise, all [`cockroach start`](cockroach-start.html) defaults are accepted. Note that since each node is in a unique container, using identical default ports won’t cause conflicts.

3. Start two more nodes:

    {{site.data.alerts.callout_info}}Again, be sure to replace <code>&#60;username&#62;</code> in the <code>-v</code> flag with your actual username.{{site.data.alerts.end}}

    ~~~ powershell
    PS C:\Users\username> docker run -d `
    --name=roach2 `
    --hostname=roach2 `
    --net=roachnet `
    -v "//c/Users/<username>/cockroach-data/roach2:/cockroach/cockroach-data"  `
    {{page.release_info.docker_image}}:{{page.release_info.version}} start `
    --insecure `
    --join=roach1,roach2,roach3
    ~~~

    ~~~ powershell
    PS C:\Users\username> docker run -d `
    --name=roach3 `
    --hostname=roach3 `
    --net=roachnet `
    -v "//c/Users/<username>/cockroach-data/roach3:/cockroach/cockroach-data"  `
    {{page.release_info.docker_image}}:{{page.release_info.version}} start `
    --insecure `
    --join=roach1,roach2,roach3
    ~~~

4. Perform a one-time initialization of the cluster:

    ~~~ powershell
    PS C:\Users\username> docker exec -it roach1 ./cockroach init --insecure
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

## Step 3. Use the built-in SQL client

Now that your cluster is live, you can use any node as a SQL gateway. To test this out, let's use the `docker exec` command to start the [built-in SQL shell](cockroach-sql.html) in the first container.

1. Start the SQL shell in the first container:

    ~~~ powershell
    PS C:\Users\username> docker exec -it roach1 ./cockroach sql --insecure
    ~~~

2. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

3. Now exit the SQL shell on node 1 and open a new shell on node 2:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    ~~~ powershell
    PS C:\Users\username> docker exec -it roach2 ./cockroach sql --insecure
    ~~~

4. Run the same `SELECT` query as before:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

    As you can see, node 1 and node 2 behaved identically as SQL gateways.

5. Exit the SQL shell on node 2:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Run a sample workload

CockroachDB also comes with a number of [built-in workloads](cockroach-workload.html) for simulating client traffic. Let's the workload based on CockroachDB's sample vehicle-sharing application, [MovR](movr.html).

1. Load the initial dataset:

    ~~~ powershell
    PS C:\Users\username> docker exec -it roach1 ./cockroach workload init movr \
    'postgresql://root@roach1:26257?sslmode=disable'
    ~~~

2. Run the workload for 5 minutes:

    ~~~ powershell
    PS C:\Users\username> docker exec -it roach1 ./cockroach workload run movr \
    --duration=5m \
    'postgresql://root@roach1:26257?sslmode=disable'
    ~~~

## Step 5. Access the DB Console

The CockroachDB [DB Console](ui-overview.html) gives you insight into the overall health of your cluster as well as the performance of the client workload.

1. When you started the first container/node, you mapped the node's default HTTP port `8080` to port `8080` on the host, so go to <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>.

2. On the [**Cluster Overview**](ui-cluster-overview-page.html), notice that three nodes are live, with an identical replica count on each node:

    <img src="{{ 'images/v21.1/ui_cluster_overview_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's [automated replication](demo-data-replication.html) of data via the Raft consensus protocol.

    {{site.data.alerts.callout_info}}
    Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation](known-limitations.html#available-capacity-metric-in-the-db-console).
    {{site.data.alerts.end}}

3. Click [**Metrics**](ui-overview-dashboard.html) to access a variety of time series dashboards, including graphs of SQL queries and service latency over time:

    <img src="{{ 'images/v21.1/ui_overview_dashboard_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

4. Use the [**Databases**](ui-databases-page.html), [**Statements**](ui-statements-page.html), and [**Jobs**](ui-jobs-page.html) pages to view details about your databases and tables, to assess the performance of specific queries, and to monitor the status of long-running operations like schema changes, respectively.

## Step 6.  Stop the cluster

Use the `docker stop` and `docker rm` commands to stop and remove the containers (and therefore the cluster):

~~~ powershell
PS C:\Users\username> docker stop roach1 roach2 roach3
~~~

~~~ powershell
PS C:\Users\username> docker rm roach1 roach2 roach3
~~~

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

~~~ powershell
PS C:\Users\username> Remove-Item cockroach-data -recurse
~~~

## What's next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
- Further explore CockroachDB capabilities like [fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html), [geo-partitioning](demo-low-latency-multi-region-deployment.html), [serializable transactions](demo-serializable.html), and [JSON support](demo-json-support.html)
