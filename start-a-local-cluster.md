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

Once you've installed the [CockroachDB binary](install-cockroachdb.html) and added the binary directory to your `PATH`, it's simple to start a multi-node cluster locally with each node listening on a different port. This page shows you how.

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

Once you've installed Docker and the official CockroachDB image, it's easy to run a multi-node cluster across multiple Docker containers on a single host. This page shows you how. 

NOTE about potential for data loss. And that docs for multi-host scenario will come soon.

## Before You Begin

Make sure you have already:

- Installed Docker
- Started a `docker-machine` in which to run CockroachDB (Mac and Windows only)
- Pulled the official CockroachDB image from Docker Hub

For full details, go to [Install CockroachDB](install-cockroachdb.html) and choose **Use Docker** for your OS. 

## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/dockernetworks/#a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks. 

~~~ shell
$ docker network create -d bridge roachnetwork
~~~

We've used `roachnetwork` as the network name here and in subsequent steps. Feel free to give your network any name you like.

## Step 2. Start your first container/node

Each node will be running in a single CockroachDB container. 


~~~ shell
$ cockroach start --background

build:     {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:     http://localhost:8080
sql:       postgresql://root@localhost:26257?sslmode=disable
logs:      cockroach-data/logs
store[0]:  path=cockroach-data
~~~

This command starts a node, accepting all [`cockroach start`](start-a-node.html) defaults.

- Communication is insecure, with the server listening only on `localhost` on port `26257` for internal and client communication and on port `8080` for HTTP requests from the Admin UI. To listen on an external hostname or IP address, set `--insecure` and `--host=<external address>`. To bind to different ports, set `--port=<port>` and `--http-port=<port>`. 

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

Open the [built-in SQL client](use-the-built-in-sql-client.html) in interactive mode:

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

[Secure your cluster](secure-a-cluster.html) with authentication and encryption.
</div>
