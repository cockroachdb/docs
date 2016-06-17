---
title: Start a Cluster
toc: false
expand: true
---

<style>
.filters .scope-button {
  width: 20%;
  height: 65px;
  margin: 30px 15px 10px 0px;
}
.filters a:hover {
  border-bottom: none;
}
</style>

<div id="step-three-filters" class="filters clearfix">
  <a href="start-a-local-cluster.html"><button class="filter-button scope-button">From <strong>Binary</strong></button></a>
  <button class="filter-button scope-button current">In <strong>Docker</strong></button>
</div><p></p>

Once you've [installed the official CockroachDB Docker image](install-cockroachdb.html), it's simple to run a multi-node cluster across multiple Docker containers on a single host. This page shows you how. 

## Before You Begin

Make sure you have already:

- Installed Docker
- Started a `docker-machine` in which to run CockroachDB (Mac and Windows only)
- Pulled the official CockroachDB image from Docker Hub

For full details, go to [Install CockroachDB](install-cockroachdb.html) and choose **Use Docker** for your OS. 

{{site.data.alerts.callout_info}}On Mac and Windows, it's not currently possible to use <strong>Docker volumes</strong> to persist CockroachDB node data. Therefore, Docker is recommended only for testing on those operating systems.  On Linux, however, it is possible to use volumes to persist container data. See Docker's <a href="https://docs.docker.com/engine/userguide/containers/dockervolumes/">Manage data in containers</a> topic for details.{{site.data.alerts.end}}

## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/dockernetworks/#a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks. 

~~~ shell
$ docker network create -d bridge roachnet
~~~

We've used `roachnet` as the network name here and in subsequent steps, but feel free to give your network any name you like.

## Step 2. Start your first container/node

~~~ shell
$ docker run -d --name=roach1 --hostname=roach1 --net=roachnet -p 26257:26257 -p 8080:8080 cockroachdb/cockroach:{{site.data.strings.version}} start --insecure
~~~

This command creates a container and starts the first CockroachDB node inside it. Let's look at each part:

- `docker run`: The Docker command to start a new container.
- `-d`: This flag runs the container in the background so you can continue the next steps in the same shell. 
- `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container. 
- `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
- `--net`: The bridge network for the container to join. See step 1 for more details.
- `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port of HTTP requests from the Admin UI (`8080`) from the container to the `docker-machine`. This enables inter-container communication and makes it possible to call up the Admin UI from a browser outside of the `docker-machine`.
- `cockroachdb/cockroach:{{site.data.strings.version}} start --insecure`: The CockroachDB command to [start a node](start-a-node.html) in the container in insecure mode. 

## Step 3. Start additional containers/nodes

~~~ shell
$ docker run -d --name=roach2 --hostname=roach2 --net=roachnet -P cockroachdb/cockroach:{{site.data.strings.version}} start --insecure --join=roach1
$ docker run -d --name=roach3 --hostname=roach3 --net=roachnet -P cockroachdb/cockroach:{{site.data.strings.version}} start --insecure --join=roach1
~~~

These commands add two more containers and start CockroachDB nodes inside them, joining them to the first node. There are only a few differences to note from step 2:

- `-P`: This flag maps all of the container's exposed ports to random ports on the `docker-machine`. This random mapping is fine since we've already mapped the relevant ports for the first container.
- `--join`: This flag joins the new node to the cluster, using the first container's `hostname`. Otherwise, all [`cockroach start`](start-a-node.html) defaults are accepted. Note that since each node is in a unique container, using identical default ports won’t cause conflicts.

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

If you want to verify that the containers/nodes are, in fact, part of a single cluster, you can start a Bash session in one of the other containers, start the SQL client in interactive mode, and check for the new `bank` database:

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

## Step 5. Open the Admin UI

To check out the [Admin UI](explore-the-admin-ui.html) for your cluster, first look up the IP address for your `docker-machine`:

~~~ shell
$ docker-machine ip default
192.168.99.100
~~~

Then point your browser to that IP and port `8080`, e.g., `http://192.168.99.100:8080`: 

<img src="images/admin_ui.png" style="border:1px solid #eee;max-width:100%" />

## What's Next?

[Secure your cluster](secure-a-cluster.html) with authentication and encryption. You might also be interested in:

- [Manual Deployment](manual-deployment.html): How to run CockroachDB across multiple machines
- [Cloud Deployment](cloud-deployment.html): How to run CockroachDB in the cloud
- **Run CockroachDB across Multiple Docker Hosts** (coming soon)
