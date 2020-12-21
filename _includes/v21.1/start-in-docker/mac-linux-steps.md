## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/#/a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks.

{% include copy-clipboard.html %}
~~~ shell
$ docker network create -d bridge roachnet
~~~

We've used `roachnet` as the network name here and in subsequent steps, but feel free to give your network any name you like.

## Step 2. Start the cluster

1. Start the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker run -d \
    --name=roach1 \
    --hostname=roach1 \
    --net=roachnet \
    -p 26257:26257 -p 8080:8080  \
    -v "${PWD}/cockroach-data/roach1:/cockroach/cockroach-data"  \
    {{page.release_info.docker_image}}:{{page.release_info.version}} start \
    --insecure \
    --join=roach1,roach2,roach3
    ~~~

2. This command creates a container and starts the first CockroachDB node inside it. Take a moment to understand each part:
    - `docker run`: The Docker command to start a new container.
    - `-d`: This flag runs the container in the background so you can continue the next steps in the same shell.
    - `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container.
    - `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
    - `--net`: The bridge network for the container to join. See step 1 for more details.
    - `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port for HTTP requests to the DB Console (`8080`) from the container to the host. This enables inter-container communication and makes it possible to call up the DB Console from a browser.
    - `-v "${PWD}/cockroach-data/roach1:/cockroach/cockroach-data"`: This flag mounts a host directory as a data volume. This means that data and logs for this node will be stored in `${PWD}/cockroach-data/roach1` on the host and will persist after the container is stopped or deleted. For more details, see Docker's <a href="https://docs.docker.com/engine/admin/volumes/bind-mounts/">Bind Mounts</a> topic.
    - `{{page.release_info.docker_image}}:{{page.release_info.version}} start --insecure --join`: The CockroachDB command to [start a node](cockroach-start.html) in the container in insecure mode. The `--join` flag specifies the `hostname` of each node that will initially comprise your cluster. Otherwise, all [`cockroach start`](cockroach-start.html) defaults are accepted. Note that since each node is in a unique container, using identical default ports won’t cause conflicts.

3. Start two more nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker run -d \
    --name=roach2 \
    --hostname=roach2 \
    --net=roachnet \
    -v "${PWD}/cockroach-data/roach2:/cockroach/cockroach-data" \
    {{page.release_info.docker_image}}:{{page.release_info.version}} start \
    --insecure \
    --join=roach1,roach2,roach3
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker run -d \
    --name=roach3 \
    --hostname=roach3 \
    --net=roachnet \
    -v "${PWD}/cockroach-data/roach3:/cockroach/cockroach-data" \
    {{page.release_info.docker_image}}:{{page.release_info.version}} start \
    --insecure \
    --join=roach1,roach2,roach3
    ~~~

4. Perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker exec -it roach1 ./cockroach init --insecure
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

    At this point, each node also prints helpful [startup details](cockroach-start.html#standard-output) to its log. For example, the following command retrieves node 1's startup details:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ grep 'node starting' cockroach-data/roach1/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at {{page.release_info.start_time}}
    build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.12.6)
    webui:               http://roach1:8080
    sql:                 postgresql://root@roach1:26257?sslmode=disable
    client flags:        /cockroach/cockroach <client cmd> --host=roach1:26257 --insecure
    logs:                /cockroach/cockroach-data/logs
    temp dir:            /cockroach/cockroach-data/cockroach-temp273641911
    external I/O path:   /cockroach/cockroach-data/extern
    store[0]:            path=/cockroach/cockroach-data
    status:              initialized new cluster
    clusterID:           1a705c26-e337-4b09-95a6-6e5a819f9eec
    nodeID:              1
    ~~~

## Step 3. Use the built-in SQL client

Now that your cluster is live, you can use any node as a SQL gateway. To test this out, let's use the `docker exec` command to start the [built-in SQL shell](cockroach-sql.html) in the first container.

1. Start the SQL shell in the first container:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker exec -it roach1 ./cockroach sql --insecure
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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker exec -it roach2 ./cockroach sql --insecure
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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker exec -it roach1 ./cockroach workload init movr \
    'postgresql://root@roach1:26257?sslmode=disable'
    ~~~

2. Run the workload for 5 minutes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker exec -it roach1 ./cockroach workload run movr \
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

{% include copy-clipboard.html %}
~~~ shell
$ docker stop roach1 roach2 roach3
~~~

{% include copy-clipboard.html %}
~~~ shell
$ docker rm roach1 roach2 roach3
~~~

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf cockroach-data
~~~
