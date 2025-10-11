---
title: Start a Local Cluster in Docker (Insecure)
summary: Run an insecure multi-node CockroachDB cluster across multiple Docker containers on a single host.
toc: false
allowed_hashes: [os-mac, os-linux, os-windows]
---

<!--
To link directly to the linux or windows tab, append #os-linux or #os-windows to the url.
-->

<div id="os-tabs" class="filters clearfix">
    <button id="mac" class="filter-button" data-scope="os-mac">Mac</button>
    <button id="linux" class="filter-button" data-scope="os-linux">Linux</button>
    <button id="windows" class="filter-button" data-scope="os-windows">Windows</button>
</div>

Once you've [installed the official CockroachDB Docker image](install-cockroachdb.html), it's simple to run an insecure multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data.

{{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker and is not recommended for production deployments. To run a physically distributed cluster in containers, use an orchestration tool like Kubernetes or Docker Swarm. See <a href="orchestration.html">Orchestration</a> for more details.{{site.data.alerts.end}}

<div id="toc" style="display: none"></div>

<div class="filter-content current" markdown="1" data-scope="os-mac">
{% include {{ page.version.version }}/start-in-docker/mac-linux-steps.md %}

## Step 5. Monitor the cluster

When you started the first container/node, you mapped the node's default HTTP port `8080` to port `8080` on the host. To check out the Admin UI for your cluster, point your browser to that port on `localhost`, i.e., `http://localhost:8080`.

<img src="{{ 'images/v1.1/admin_ui.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

As mentioned earlier, CockroachDB automatically replicates your data behind-the-scenes. To verify that data written in the previous step was replicated successfully, scroll down to the **Replicas per Store** graph and hover over the line:

<img src="{{ 'images/v1.1/admin_ui_replicas.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

The replica count on each node is identical, indicating that all data in the cluster was replicated 3 times (the default).

{{site.data.alerts.callout_success}}For more insight into how CockroachDB automatically replicates and rebalances data, and tolerates and recovers from failures, see our <a href="demo-data-replication.html">replication</a>, <a href="demo-automatic-rebalancing.html">rebalancing</a>, <a href="demo-fault-tolerance-and-recovery.html">fault tolerance</a> demos.{{site.data.alerts.end}}

## Step 6.  Stop the cluster

Use the `docker stop` and `docker rm` commands to stop and remove the containers (and therefore the cluster):

{% include_cached copy-clipboard.html %}
~~~ shell
$ docker stop roach1 roach2 roach3
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ docker rm roach1 roach2 roach3
~~~

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

{% include_cached copy-clipboard.html %}
~~~ shell
$ rm -rf cockroach-data
~~~
</div>

<div class="filter-content" markdown="1" data-scope="os-linux">
{% include {{ page.version.version }}/start-in-docker/mac-linux-steps.md %}

## Step 5. Monitor the cluster

When you started the first container/node, you mapped the node's default HTTP port `8080` to port `8080` on the host. To check out the Admin UI for your cluster, point your browser to that port on `localhost`, i.e., `http://localhost:8080`.

<img src="{{ 'images/v1.1/admin_ui.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

As mentioned earlier, CockroachDB automatically replicates your data behind-the-scenes. To verify that data written in the previous step was replicated successfully, scroll down to the **Replicas per Store** graph and hover over the line:

<img src="{{ 'images/v1.1/admin_ui_replicas.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

The replica count on each node is identical, indicating that all data in the cluster was replicated 3 times (the default).

{{site.data.alerts.callout_success}}For more insight into how CockroachDB automatically replicates and rebalances data, and tolerates and recovers from failures, see our <a href="demo-data-replication.html">replication</a>, <a href="demo-automatic-rebalancing.html">rebalancing</a>, <a href="demo-fault-tolerance-and-recovery.html">fault tolerance</a> demos.{{site.data.alerts.end}}

## Step 6.  Stop the cluster

Use the `docker stop` and `docker rm` commands to stop and remove the containers (and therefore the cluster):

{% include_cached copy-clipboard.html %}
~~~ shell
$ docker stop roach1 roach2 roach3
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ docker rm roach1 roach2 roach3
~~~

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

{% include_cached copy-clipboard.html %}
~~~ shell
$ rm -rf cockroach-data
~~~
</div>

<div class="filter-content" markdown="1" data-scope="os-windows">
## Before You Begin

If you have not already installed the official CockroachDB Docker image, go to [Install CockroachDB](install-cockroachdb.html) and follow the instructions under **Use Docker**.

## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/#/a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks.

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="nb">PS </span>C:\Users\username&gt; docker network create -d bridge roachnet</code></pre></div>

We've used `roachnet` as the network name here and in subsequent steps, but feel free to give your network any name you like.

## Step 2. Start the first node

{{site.data.alerts.callout_info}}Be sure to replace <code>&#60;username&#62;</code> in the <code>-v</code> flag with your actual username.{{site.data.alerts.end}}

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="nb">PS </span>C:\Users\username&gt; docker run -d <span class="sb">`</span>
--name<span class="o">=</span>roach1 <span class="sb">`</span>
--hostname<span class="o">=</span>roach1 <span class="sb">`</span>
--net<span class="o">=</span>roachnet <span class="sb">`</span>
-p 26257:26257 -p 8080:8080 <span class="sb">`</span>
-v <span class="s2">"//c/Users/&lt;username&gt;/cockroach-data/roach1:/cockroach/cockroach-data"</span> <span class="sb">`</span>
{{page.release_info.docker_image}}:{{page.release_info.version}} <span class="nb">start</span> --insecure</code></pre></div>

This command creates a container and starts the first CockroachDB node inside it. Let's look at each part:

- `docker run`: The Docker command to start a new container.
- `-d`: This flag runs the container in the background so you can continue the next steps in the same shell.
- `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container.
- `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
- `--net`: The bridge network for the container to join. See step 1 for more details.
- `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port for HTTP requests to the Admin UI (`8080`) from the container to the host. This enables inter-container communication and makes it possible to call up the Admin UI from a browser.
- `-v "//c/Users/<username>/cockroach-data/roach1:/cockroach/cockroach-data"`: This flag mounts a host directory as a data volume. This means that data and logs for this node will be stored in `Users/<username>/cockroach-data/roach1` on the host and will persist after the container is stopped or deleted. For more details, see Docker's <a href="https://docs.docker.com/engine/admin/volumes/bind-mounts/">Bind Mounts</a> topic.
- `{{page.release_info.docker_image}}:{{page.release_info.version}} start --insecure`: The CockroachDB command to [start a node](start-a-node.html) in the container in insecure mode.

## Step 3. Add nodes to the cluster

At this point, your cluster is live and operational. With just one node, you can already connect a SQL client and start building out your database. In real deployments, however, you'll always want 3 or more nodes to take advantage of CockroachDB's [automatic replication](demo-data-replication.html), [rebalancing](demo-automatic-rebalancing.html), and [fault tolerance](demo-fault-tolerance-and-recovery.html) capabilities.

To simulate a real deployment, scale your cluster by adding two more nodes:

{{site.data.alerts.callout_info}}Again, be sure to replace <code>&#60;username&#62;</code> in the <code>-v</code> flag with your actual username.{{site.data.alerts.end}}

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="c1"># Start the second container/node:</span>
<span class="nb">PS </span>C:\Users\username&gt; docker run -d <span class="sb">`</span>
--name<span class="o">=</span>roach2 <span class="sb">`</span>
--hostname<span class="o">=</span>roach2 <span class="sb">`</span>
--net<span class="o">=</span>roachnet <span class="sb">`</span>
-v <span class="s2">"//c/Users/&lt;username&gt;/cockroach-data/roach2:/cockroach/cockroach-data"</span> <span class="sb">`</span>
{{page.release_info.docker_image}}:{{page.release_info.version}} <span class="nb">start</span> --insecure --join<span class="o">=</span>roach1

<span class="c1"># Start the third container/node:</span>
<span class="nb">PS </span>C:\Users\username&gt; docker run -d <span class="sb">`</span>
--name<span class="o">=</span>roach3 <span class="sb">`</span>
--hostname<span class="o">=</span>roach3 <span class="sb">`</span>
--net<span class="o">=</span>roachnet <span class="sb">`</span>
-v <span class="s2">"//c/Users/&lt;username&gt;/cockroach-data/roach3:/cockroach/cockroach-data"</span> <span class="sb">`</span>
{{page.release_info.docker_image}}:{{page.release_info.version}} <span class="nb">start</span> --insecure --join<span class="o">=</span>roach1</code></pre></div>

These commands add two more containers and start CockroachDB nodes inside them, joining them to the first node. There are only a few differences to note from step 2:

- `-v`: This flag mounts a host directory as a data volume. Data and logs for these nodes will be stored in `Users/<username>/cockroach-data/roach2` and `Users/<username>/cockroach-data/roach3` on the host and will persist after the containers are stopped or deleted.
- `--join`: This flag joins the new nodes to the cluster, using the first container's `hostname`. Note that since each node is in a unique container, using identical default ports won’t cause conflicts.

## Step 4. Test the cluster

Now that you've scaled to 3 nodes, you can use any node as a SQL gateway to the cluster. To demonstrate this, use the `docker exec` command to start the [built-in SQL shell](use-the-built-in-sql-client.html) in the first container:

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="nb">PS </span>C:\Users\username&gt; docker <span class="nb">exec</span> -it roach1 ./cockroach sql --insecure
<span class="c1"># Welcome to the cockroach SQL interface.</span>
<span class="c1"># All statements must be terminated by a semicolon.</span>
<span class="c1"># To exit: CTRL + D.</span></code></pre></div>

Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

~~~ sql
> CREATE DATABASE bank;

> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);

> INSERT INTO bank.accounts VALUES (1, 1000.50);

> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

Exit the SQL shell on node 1:

~~~ sql
> \q
~~~

Then start the SQL shell in the second container:

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="nb">PS </span>C:\Users\username&gt; docker <span class="nb">exec</span> -it roach2 ./cockroach sql --insecure
<span class="c1"># Welcome to the cockroach SQL interface.</span>
<span class="c1"># All statements must be terminated by a semicolon.</span>
<span class="c1"># To exit: CTRL + D.</span></code></pre></div>

Now run the same `SELECT` query:

~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

As you can see, node 1 and node 2 behaved identically as SQL gateways.

When you're done, exit the SQL shell on node 2:

~~~ sql
> \q
~~~

## Step 5. Monitor the cluster

When you started the first container/node, you mapped the node's default HTTP port `8080` to port `8080` on the host. To check out the [Admin UI](admin-ui-overview.html) for your cluster, point your browser to that port on `localhost`, i.e., `http://localhost:8080`.

<img src="{{ 'images/v1.1/admin_ui.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

As mentioned earlier, CockroachDB automatically replicates your data behind-the-scenes. To verify that data written in the previous step was replicated successfully, scroll down to the **Replicas per Store** graph and hover over the line:

<img src="{{ 'images/v1.1/admin_ui_replicas.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

The replica count on each node is identical, indicating that all data in the cluster was replicated 3 times (the default).

{{site.data.alerts.callout_success}}For more insight into how CockroachDB automatically replicates and rebalances data, and tolerates and recovers from failures, see our <a href="demo-data-replication.html">replication</a>, <a href="demo-automatic-rebalancing.html">rebalancing</a>, <a href="demo-fault-tolerance-and-recovery.html">fault tolerance</a> demos.{{site.data.alerts.end}}

## Step 6.  Stop the cluster

Use the `docker stop` and `docker rm` commands to stop and remove the containers (and therefore the cluster):

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="c1"># Stop the containers:</span>
<span class="nb">PS </span>C:\Users\username&gt; docker stop roach1 roach2 roach3

<span class="c1"># Remove the containers:</span>
<span class="nb">PS </span>C:\Users\username&gt; docker rm roach1 roach2 roach3</code></pre></div>

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

<div class="language-powershell highlighter-rouge"><pre class="highlight"><code>Remove-Item C:\Users\username&gt; cockroach-data -recurse</code></pre></div>

</div>

## What's Next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
- [Explore core CockroachDB features](demo-data-replication.html) like automatic replication, rebalancing, and fault tolerance
