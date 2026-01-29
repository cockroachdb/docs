---
title: Deploy a Local Cluster in Docker (Insecure)
summary: Run an insecure multi-node CockroachDB cluster across multiple Docker containers on a single host.
toc: true
docs_area: deploy
---

<div id="os-tabs" class="clearfix">
  <a href="start-a-local-cluster-in-docker-mac.html"><button id="mac" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button></a>
  <a href="start-a-local-cluster-in-docker-linux.html"><button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button></a>
  <button id="windows" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button>
</div>

Once you've [installed the official CockroachDB Docker image]({% link {{ page.version.version }}/install-cockroachdb.md %}), it's simple to run an insecure multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

## Before you begin

- Make sure you have already [installed the official CockroachDB Docker image]({% link {{ page.version.version }}/install-cockroachdb.md %}).
- For quick SQL testing or app development, consider [running a single-node cluster]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) instead.
- Note that running multiple nodes on a single host is useful for testing CockroachDB, but it's not suitable for production. To run a physically distributed cluster in containers, use an orchestration tool like Kubernetes. See [Orchestration]({% link {{ page.version.version }}/kubernetes-overview.md %}) for more details, and review the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}).

## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, create a Docker [bridge network](https://docs.docker.com/engine/userguide/networking/#/a-bridge-network). The network has configurable properties such as a pool of IP addresses, network gateway, and routing rules. All nodes will connect to this network and can communicate openly by default, but incoming traffic can reach a container only through the container's published port mappings, as described in [Step 3: Start the cluster](#step-3-start-the-cluster). Because the network is a bridge, from the point of view of the client, the Docker host seems to service the request directly.

~~~ powershell
docker network create -d bridge roachnet
~~~

{{site.data.alerts.callout_success}}
To customize your bridge network or create a different type of Docker network, refer to Docker's documentation for [`docker network create`](https://docs.docker.com/engine/reference/commandline/network_create/).
{{site.data.alerts.end}}

In subsequent steps, replace `roachnet` with the name of your Docker network.

### Step 2: Create Docker volumes for each cluster node

Cockroach Labs recommends that you store cluster data in Docker volumes rather than in the storage layer of the running container. Using a volume has the following advantages over using bind mounts or writing directly to the running container's filesystem.

- Volumes are managed entirely by Docker. A bind mount mounts an arbitrary directory on the Docker host into the container, and that directory could potentially be modified or deleted by any process with permission.
- Volumes persist even if the containers that were using it are deleted. A container's local storage is temporarily unavailable if the container is stopped, and is permanently removed if the container is deleted.
- When compared to a container's local storage, writing to either a local volume or a bind mount has considerably better performance because it uses fewer kernel system calls on the Docker host. For an explanation, refer to [Manage Data in Docker](https://docs.docker.com/storage/).
- A volume can be backed up, restored, or migrated to a different container or Docker host. Refer to [Back Up, Restore, or Migrate Data Volumes](https://docs.docker.com/storage/volumes/#back-up-restore-or-migrate-data-volumes).
- A volume can be pre-populated before connecting it to a container. Refer to [Populate a Volume Using a Container](https://docs.docker.com/storage/volumes/#populate-a-volume-using-a-container).
- A volume can be backed by local storage, a cloud storage resource, SSH, NFS, Samba, or raw block storage, among others. For details, refer to [Use a Volume Driver](https://docs.docker.com/storage/volumes/#use-a-volume-driver).

{{site.data.alerts.callout_danger}}
Avoid using the `-v` / `--volume` command to mount a local macOS filesystem into the container. Use Docker volumes or a [`tmpfs` mount](https://docs.docker.com/storage/tmpfs/).
{{site.data.alerts.end}}

Create a [Docker volume](https://docs.docker.com/storage/volumes/) for each container. You can create only one volume at a time.

{% include_cached copy-clipboard.html %}
~~~ powershell
docker volume create roach1
~~~

{% include_cached copy-clipboard.html %}
~~~ powershell
docker volume create roach2
~~~

{% include_cached copy-clipboard.html %}
~~~ powershell
docker volume create roach3
~~~

## Step 3. Start the cluster

This section shows how to start a three-node cluster where:

- Each node will store its data in a unique Docker volume.
- Each node will listen for SQL and HTTP connections at a unique port each on the `roachnet` network, and these ports are published. Client requests to the Docker host at a given port are forwarded to the container that is publishing that port. Nodes do not listen on `localhost`.
- Each node will listen and advertise for inter-node cluster traffic at port 26357 on the `roachnet` network. This port is not published, so inter-node traffic does not leave this network.

{{site.data.alerts.callout_info}}
When SQL and inter-node traffic are separated, some client commands need to be modified with a `--host` flag or a `--uri` connection string. Some commands, such as `cockroach init`, default to port 26257 but must use the inter-node traffic port (the `--listen-addr` or `--advertise-addr`) rather than the SQL traffic port when traffic is separated.
{{site.data.alerts.end}}

1. Start the first node and configure it to listen on `roach1:26257` for SQL clients and `roach1:8080` for the DB Console and to publish these ports, and to use `roach1:26357`for inter-node traffic. The Docker host will forward traffic to a published port to the publishing container.

    CockroachDB starts in insecure mode and a `certs` directory is not created.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker run -d '
    --name=roach1 '
    --hostname=roach1 '
    --net=roachnet '
    -p 26257:26257 '
    -p 8080:8080 '
    -v "roach1:/cockroach/cockroach-data" '
    {{page.release_info.docker_image}}:{{page.release_info.version}} start '
      --advertise-addr=roach1:26357 '
      --http-addr=roach1:8080 '
      --listen-addr=roach1:26357 '
      --sql-addr=roach1:26257 '
      --insecure '
      --join=roach1:26357,roach2:26357,roach3:26357
    ~~~


1. This command creates a container and starts the first CockroachDB node inside it. Take a moment to understand each part:
    - `docker run`: The Docker command to start a new container.
    - `-d`: This flag runs the container in the background so you can continue the next steps in the same shell.
    - `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container.
    - `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
    - `--net`: The bridge network for the container to join. See step 1 for more details.
    - `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port for HTTP requests to the DB Console (`8080`) from the container to the host. This enables inter-container communication and makes it possible to call up the DB Console from a browser.
    - `-v "roach1:/cockroach/cockroach-data"`: This flag mounts the `roach1` Docker volume into the container's filesystem at `/cockroach/cockroach-data/`. This volume will contain data and logs for the container, and the volume will persist after the container is stopped or deleted. For more details, see Docker's [volumes](https://docs.docker.com/storage/volumes/) documentation.
    - `{{page.release_info.docker_image}}:{{page.release_info.version}} start (...) --join`: The CockroachDB command to [start a node]({% link {{ page.version.version }}/cockroach-start.md %}) in the container. The `--advertise-addr`, `--http-addr`, `--listen-addr`, and `--sql-addr` flags cause CockroachDB to listen on separate ports for inter-node traffic, DB Console traffic, and SQL traffic. The `--join` flag contains each node's hostname or IP address and the port where it listens for inter-node traffic from other nodes.

1. Start the second node and configure it to listen on `roach2:26258` for SQL clients and `roach2:8081` for the DB Console and to publish these ports, and to use `roach2:26357`for inter-node traffic. The offsets for the published ports avoid conflicts with `roach1`'s published ports. The named volume `roach2` is mounted in the container at `/cockroach/cockroach-data`.

    CockroachDB starts in insecure mode and a `certs` directory is not created.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker run -d '
      --name=roach2 '
      --hostname=roach2 '
      --net=roachnet '
      -p 26258:26258 '
      -p 8081:8081 '
      -v "roach2:/cockroach/cockroach-data" '
      {{page.release_info.docker_image}}:{{page.release_info.version}} start '
        --advertise-addr=roach2:26357 '
        --http-addr=roach2:8081 '
        --listen-addr=roach2:26357 '
        --sql-addr=roach2:26258 '
        --insecure '
        --join=roach1:26357,roach2:26357,roach3:26357
    ~~~

1. Start the third node and configure it to listen on `roach3:26259` for SQL clients and `roach2:8082` for the DB Console and to publish these ports, and to use `roach3:26357`for inter-node traffic. The offsets for the published ports avoid conflicts with `roach1`'s and `roach2`'s published ports. The named volume `roach3` is mounted in the container at `/cockroach/cockroach-data`.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker run -d '
      --name=roach3 '
      --hostname=roach3 '
      --net=roachnet '
      -p 26259:26259 '
      -p 8082:8082 '
      -v "roach3:/cockroach/cockroach-data" '
      {{page.release_info.docker_image}}:{{page.release_info.version}} start '
        --advertise-addr=roach3:26357 '
        --http-addr=roach3:8082 '
        --listen-addr=roach3:26357 '
        --sql-addr=roach3:26259 '
        --insecure '
        --join=roach1:26357,roach2:26357,roach3:26357
    ~~~

1. Perform a one-time initialization of the cluster. This example runs the `cockroach init` command from within the `roach1` container, but you can run it from any container or from an external system that can reach the Docker host.

    `cockroach init` connects to the node's `--advertise-addr`, rather than the node's `--sql-addr`. Replace `roach1:26357` with the node's `--advertise-addr` value. This example runs the `cockroach` command directly on a cluster node, but you can run it from any system that can connect to the Docker host.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker exec -it roach1 ./cockroach --host=roach1:26357 init --insecure
    ~~~

    The following message displays:

    ~~~
    Cluster successfully initialized
    ~~~

    Each node also prints helpful [startup details]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output) to its log. For example, the following command runs the `grep` command from within the `roach1` container to display lines in its `/cockroach-data/logs/cockroach.log` log file that contain the string `node starting` and the next 11 lines.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker exec -it roach1 grep 'node starting' /cockroach-data/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
    build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.19.6)
    webui:               http://roach1:8080
    sql:                 postgresql://root@roach1:26357?sslmode=disable
    client flags:        /cockroach/cockroach <client cmd> --host=roach1:26357
    logs:                /cockroach/cockroach-data/logs
    temp dir:            /cockroach/cockroach-data/cockroach-temp273641911
    external I/O path:   /cockroach/cockroach-data/extern
    store[0]:            path=/cockroach/cockroach-data
    status:              initialized new cluster
    clusterID:           1a705c26-e337-4b09-95a6-6e5a819f9eec
    nodeID:              1
    ~~~

## Step 4. Use the built-in SQL client

Now that your cluster is live, you can use any node as a SQL gateway. To test this out, let's use the `docker exec` command to start the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) in the `roach1` container.

1. Start the SQL shell in a container or from an external system that can reach the Docker host. Set `--host` to the Docker host's IP address and use any of the ports where nodes are listening for SQL connections, `26257`, `26258`, or `26259`. This example connects the SQL shell within the `roach1` container to `roach2:26258`. You could also connect to `roach3:26259`.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker exec -it roach1 ./cockroach sql --host=roach2:26258 --insecure
    ~~~

1. Run some basic [CockroachDB SQL statements]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

1. Exit the SQL shell on `roach1` and open a new shell on `roach2`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker exec -it roach2 ./cockroach --host=roach2:26258 sql --insecure
    ~~~

1. Run the same `SELECT` query as before:

    {% include_cached copy-clipboard.html %}
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

1. Exit the SQL shell on node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 5. Run a sample workload

CockroachDB also comes with a number of [built-in workloads]({% link {{ page.version.version }}/cockroach-workload.md %}) for simulating client traffic. Let's run the workload based on CockroachDB's sample vehicle-sharing application, [MovR]({% link {{ page.version.version }}/movr.md %}).

{{site.data.alerts.callout_info}}
The `cockroach workload` command does not support connection or security flags like other [`cockroach` commands]({% link {{ page.version.version }}/cockroach-commands.md %}). Instead, you must use a [connection string]({% link {{ page.version.version }}/connection-parameters.md %}) at the end of the command.
{{site.data.alerts.end}}

1. Load the initial dataset on `roach1:26257`

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker exec -it roach1 ./cockroach workload init movr 'postgresql://root@roach1:26257?sslmode=disable'
    ~~~

1. Run the workload for 5 minutes:

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker exec -it roach1 ./cockroach workload run movr --duration=5m 'postgresql://root@roach1:26257?sslmode=disable'
    ~~~

## Step 6. Access the DB Console

The [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) gives you insight into the overall health of your cluster as well as the performance of the client workload.

1. When you started the first node's container, you mapped the node's default HTTP port `8080` to port `8080` on the Docker host, so go to <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>. If necessary, replace `localhost` with the hostname or IP address of the Docker host.

1. On the [**Cluster Overview**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}), notice that three nodes are live, with an identical replica count on each node:

    <img src="{{ 'images/v26.1/ui_cluster_overview_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's [automated replication]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) of data via the Raft consensus protocol.

    {{site.data.alerts.callout_info}}
    Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation]({% link {{ page.version.version }}/known-limitations.md %}#available-capacity-metric-in-the-db-console).
    {{site.data.alerts.end}}

1. Click [**Metrics**]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) to access a variety of time series dashboards, including graphs of SQL queries and service latency over time:

    <img src="{{ 'images/v26.1/ui_overview_dashboard_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Use the [**Databases**]({% link {{ page.version.version }}/ui-databases-page.md %}), [**Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}), and [**Jobs**]({% link {{ page.version.version }}/ui-jobs-page.md %}) pages to view details about your databases and tables, to assess the performance of specific queries, and to monitor the status of long-running operations like schema changes, respectively.
1. Optionally verify that DB Console instances for `roach2` and `roach3` are reachable on ports 8081 and 8082 and show the same information as port 8080.

The CockroachDB [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) gives you insight into the overall health of your cluster as well as the performance of the client workload.

1. When you started the first container/node, you mapped the node's default HTTP port `8080` to port `8080` on the host, so go to <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>.

1. On the [**Cluster Overview**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}), notice that three nodes are live, with an identical replica count on each node:

    <img src="{{ 'images/v26.1/ui_cluster_overview_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's [automated replication]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) of data via the Raft consensus protocol.

    {{site.data.alerts.callout_info}}
    Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation]({% link {{ page.version.version }}/known-limitations.md %}#available-capacity-metric-in-the-db-console).
    {{site.data.alerts.end}}

1. Click [**Metrics**]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) to access a variety of time series dashboards, including graphs of SQL queries and service latency over time:

    <img src="{{ 'images/v26.1/ui_overview_dashboard_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Use the [**Databases**]({% link {{ page.version.version }}/ui-databases-page.md %}), [**Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}), and [**Jobs**]({% link {{ page.version.version }}/ui-jobs-page.md %}) pages to view details about your databases and tables, to assess the performance of specific queries, and to monitor the status of long-running operations like schema changes, respectively.

## Step 6.  Stop the cluster

1. Use the `docker stop` and `docker rm` commands to stop and remove the containers (and therefore the cluster). By default, `docker stop` sends a `SIGTERM` signal, waits for 10 seconds, and then sends a `SIGKILL` signal. Cockroach Labs recommends that you [allow between 5 and 10 minutes]({% link {{ page.version.version }}/node-shutdown.md %}#termination-grace-period) before forcibly stopping the `cockroach` process, so this example sets the grace period to 5 minutes. If you do not plan to restart the cluster, you can omit `-t`.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker stop -t 300 roach1 roach2 roach3
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker rm roach1 roach2 roach3
    ~~~

1. If you do not plan to restart the cluster, you can also remove the Docker volumes and the Docker network:

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker volume rm roach1 roach2 roach3
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker network rm roachnet
    ~~~

## What's next?

- [Create a CockroachDB Cloud account](https://cockroachlabs.cloud/signup?experience=enterprise) where you can [generate and manage licenses]({% link {{ page.version.version }}/licensing-faqs.md %}) for CockroachDB installations
- Learn more about [CockroachDB SQL]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}) and the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [Install the client driver]({% link {{ page.version.version }}/install-client-drivers.md %}) for your preferred language
- [Build an app with CockroachDB]({% link {{ page.version.version }}/example-apps.md %})
- Further explore CockroachDB capabilities like [fault tolerance and automated repair]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}), [multi-region performance]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}), [serializable transactions]({% link {{ page.version.version }}/demo-serializable.md %}), and [JSON support]({% link {{ page.version.version }}/demo-json-support.md %})
