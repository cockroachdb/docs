---
title: Start a Cluster
toc: false
expand: true
---

<script>
$(document).ready(function(){

  var $filter_button = $('.filter-button');

    $filter_button.on('click', function(){
      var scope = $(this).data('scope'),
      $current_tab = $('.filter-button.current'), $current_content = $('.filter-content.current');

      //remove current class from tab and content
      $current_tab.removeClass('current');
      $current_content.removeClass('current');

      //add current class to clicked button and corresponding content block
      $('.filter-button[data-scope="'+scope+'"').addClass('current');
      $('.filter-content[data-scope="'+scope+'"').addClass('current');
    });
});
</script>

<style>
.filters .scope-button {
  width: 20%;
  height: 65px;
  margin: 30px 15px 10px 0px;
}
</style>

<div id="step-three-filters" class="filters clearfix">
  <button class="filter-button scope-button current" data-scope="binary">From <strong>Binary</strong></button>
  <button class="filter-button scope-button" data-scope="docker">In <strong>Docker</strong></button>
</div><p></p>

<div class="filter-content current" markdown="1" data-scope="binary">

Once you've installed CockroachDB, it's simple to start a multi-node cluster locally with each node listening on a different port. This page shows you how.

## Before You Begin

Make sure you have already:

- Installed the [CockroachDB binary](install-cockroachdb.html)
- Added the binary directory to your `PATH`

## Step 1. Start your first node

~~~ shell
$ cockroach start --background

build:     {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:     http://localhost:8080
sql:       postgresql://root@localhost:26257?sslmode=disable
logs:      cockroach-data/logs
store[0]:  path=cockroach-data
~~~

This command starts a node, accepting all [`cockroach start`](start-a-node.html) defaults.

- Communication is insecure, with the server listening only on `localhost` on port `26257` for internal and client communication and on port `8080` for HTTP requests from the Admin UI. 
   - To bind to different ports, set `--port=<port>` and `--http-port=<port>`. 
   - To listen on an external hostname or IP address, set `--insecure` and `--host=<external address>`. For a demonstration, see [Manual Deployment](manual-deployment.html). 

- Node data is stored in the `cockroach-data` directory. To store data in a different location, set `--store=<filepath>`. To use multiple stores, set this flag separately for each.

- The `--background` flag runs the node in the background so you can continue the next steps in the same shell. 

- The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node and debug log data.

## Step 2. Join additional nodes to the cluster
   
~~~ shell
$ cockroach start --store=node2 --port=26258 --http-port=8081 --join=localhost:26257 --background
$ cockroach start --store=node3 --port=26259 --http-port=8082 --join=localhost:26257 --background
~~~

These commands add two nodes to the cluster, but you can add as many as you like. For each node:

- Set the `--store` flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.

- Set the `--port` and `--http-port` flags to ports not in use by other nodes.

- The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node. 

- The `--background` flag runs the node in the background so you can continue the next steps in the same shell.

If you don't plan to use more than one node, you can avoid unnecessary log messages about replication by editing the default [replication zone](configure-replication-zones.html) to specify one node instead of three. See [here](troubleshoot.html#replicas-failing-on-a-single-node-cluster) for more details.

## Step 3. Use the built-in SQL client

Start the [built-in SQL client](use-the-built-in-sql-client.html) in interactive mode:

~~~ shell
$ cockroach sql
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

Then run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

~~~ shell
root@:26257> CREATE DATABASE bank;
CREATE DATABASE

root@:26257> SET DATABASE = bank;
SET

root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
CREATE TABLE

root@26257> INSERT INTO accounts VALUES (1234, 10000.50);
INSERT 1

root@26257> SELECT * FROM accounts;
+------+----------+
|  id  | balance  |
+------+----------+
| 1234 | 10000.50 |
+------+----------+
~~~

When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit.

## Step 4. Open the Admin UI

To check out the [Admin UI](explore-the-admin-ui.html) for your cluster, point your browser to `http://localhost:8080`. You can also find the address in the `admin` field in the standard output of any node on startup.

<img src="images/admin_ui.png" style="border:1px solid #eee;max-width:100%" />

## What's Next?

[Secure your cluster](secure-a-cluster.html) with authentication and encryption. You might also be interested in:

- [Manual Deployment](manual-deployment.html): How to run CockroachDB across multiple machines
- [Cloud Deployment](cloud-deployment.html): How to run CockroachDB in the cloud
- [Run CockroachDB inside a VirtualBox VM](http://uptimedba.github.io/cockroach-vb-single/cockroach-vb-single/home.html) (community-supported docs)

</div>

<div class="filter-content" markdown="1" data-scope="docker">

Once you've installed Docker and the official CockroachDB image, it's simple to run a multi-node cluster across multiple Docker containers on a single host. This page shows you how. 

{{site.data.alerts.callout_info}}Docs for running CockroachDB across multiple Docker hosts are coming soon.{{site.data.alerts.end}}

## Before You Begin

Make sure you have already:

- Installed Docker
- Started a `docker-machine` in which to run CockroachDB (Mac and Windows only)
- Pulled the official CockroachDB image from Docker Hub

For full details, go to [Install CockroachDB](install-cockroachdb.html) and choose **Use Docker** for your OS. 

{{site.data.alerts.callout_info}}Please note that it's not currently possible to use <strong>Docker volumes</strong> to persist node data on Mac and Windows. Therefore, Docker is recommended only for testing on those operating systems. Once Docker is available natively on Mac and Windows, peristing data with volumes will be possible. On Linux, however, it is currently possible to use volumes to persist container data. See Docker's <a href="https://docs.docker.com/engine/userguide/containers/dockervolumes/">Manage data in containers</a> topic for details.{{site.data.alerts.end}}


## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/dockernetworks/#a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks. 

~~~ shell
$ docker network create -d bridge roachnet
~~~

We've used `roachnet` as the network name here and in subsequent steps, but feel free to give your network any name you like.

## Step 2. Start your first container/node

~~~ shell
$ docker run -d --name=roach1 --hostname=roach1 --net=roachnet -p 26257:26257 -p 8080:8080 cockroachdb/cockroach start --insecure
~~~

This command creates a container and starts the first CockroachDB node inside it. Let's look at each part:

- `docker run`: The Docker command to start a new container.
- `-d`: This flag runs the container in the background so you can continue the next steps in the same shell. 
- `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container. 
- `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
- `--net`: The bridge network for the container to join. See step 1 for more details.
- `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port of HTTP requests from the Admin UI (`8080`) from the container to the `docker-machine`. This enables inter-container communication and makes it possible to call up the Admin UI from a browser outside of the `docker-machine`.
- `cockroachdb/cockroach start --insecure`: The command to start a node in the container in insecure mode. Otherwise, it accepts all [`cockroach start`](start-a-node.html) defaults.

## Step 3. Start additional containers/nodes

~~~ shell
$ docker run -d --name=roach2 --hostname=roach2 --net=roachnet -P cockroachdb/cockroach start --insecure --join=roach1
$ docker run -d --name=roach3 --hostname=roach3 --net=roachnet -P cockroachdb/cockroach start --insecure --join=roach1
~~~

These commands add two more containers and start CockroachDB nodes inside them, joining them to the first node. There are only a few differences to note from step 2:

- `-P`: This flag maps all of the container's exposed ports to random ports on the `docker-machine`. This random mapping is fine since we've already mapped the relevant ports for the first container.
- `cockroachdb/cockroach start --insecure --join`: The command to start a node in the container and join the node to the first container/node, using the first container's `hostname`. Otherwise, all [`cockroach start`](start-a-node.html) defaults are accepted. Note that since each node is in a unique container, using identical default ports won’t cause conflicts.

## Step 4. Use the built-in SQL client

Use the `docker exec` command to start a Bash session in the first container:

~~~ shell
$ docker exec -it roach1 bash
~~~

Start the [built-in SQL client](use-the-built-in-sql-client.html) in interactive mode:

~~~ shell
root@roach1:/cockroach# ./cockroach sql --insecure
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

Then run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

~~~ shell
root@:26257> CREATE DATABASE bank;
CREATE DATABASE

root@:26257> SET DATABASE = bank;
SET

root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
CREATE TABLE

root@26257> INSERT INTO accounts VALUES (1234, 10000.50);
INSERT 1

root@26257> SELECT * FROM accounts;
+------+----------+
|  id  | balance  |
+------+----------+
| 1234 | 10000.50 |
+------+----------+
~~~

When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit. Then use **CTRL + D** to exit the Bash session.

If you want to verify that the containers/nodes are, in fact, joined into a cluster, you can start a Bash session in one of the other containers, start the SQL client in interactive mode, and check for the new `bank` database:

~~~ shell
$ docker exec -it roach2 bash
root@roach1:/cockroach# ./cockroach sql --insecure
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
root@:26257> SHOW DATABASES;
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~

## Step 4. Open the Admin UI

To check out the [Admin UI](explore-the-admin-ui.html) for your cluster, first look up the IP address for your `docker-machine`:

~~~ shell
$ docker-machine ip default
192.168.99.100
~~~

Then point your browser to that IP and port `8080`, e.g., `http://192.168.99.100:8080`: 

<img src="images/admin_ui.png" style="border:1px solid #eee;max-width:100%" />

## What's Next?

[Secure your cluster](secure-a-cluster.html) with authentication and encryption.
</div>
