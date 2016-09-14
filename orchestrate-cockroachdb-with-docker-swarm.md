---
title: Orchestrate CockroachDB with Docker Swarm
summary: 
toc: false
---

This page shows you how to orchestrate the deployment and management of an insecure three-node CockroachDB cluster as a [swarm of Docker Engines](https://docs.docker.com/engine/swarm/). 

{{site.data.alerts.callout_danger}}Deploying an <strong>insecure</strong> cluster is not recommended for data in production. We'll update this page after improving the process to deploy secure clusters.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Before you begin, it's helpful to review some terminology:

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll use three, one per CockroachDB node.
[Docker Engine](https://docs.docker.com/engine/) | This is the core Docker application that creates and runs containers. In this tutorial, you'll install and start Docker Engine on each of your three instances.  
[swarm](https://docs.docker.com/engine/swarm/key-concepts/#/swarm) | A swarm is a cluster of Docker Engines joined into a single, virtual host.  
[swarm node](https://docs.docker.com/engine/swarm/how-swarm-mode-works/nodes/) | Each member of a swarm is considered a node. In this tutorial, each instance will be a swarm node, one as the master node and the two others as worker nodes. You'll submit service definitions to the master node, which will dispatch work to the worker nodes.
[overlay network](https://docs.docker.com/engine/userguide/networking/#/an-overlay-network-with-docker-engine-swarm-mode) | An overlay network enables communication between the nodes of a swarm. In this tutorial, you'll create an overlay network and use it in each of your services. 
[service](https://docs.docker.com/engine/swarm/how-swarm-mode-works/services/) | A service is the definition of the tasks to execute on swarm nodes. In this tutorial, you'll define three services, each starting a CockrochDB node inside a container and joining it into a single cluster. Each service also ensures a stable network identity on restart via a resolvable DNS name.

## Step 1. Create instances
  
Create three instances, one for each node of your cluster.

- For GCE-specific instructions, read through step 2 of [Deploy CockroachDB on GCE](deploy-cockroachdb-on-google-cloud-platform.html).
- For AWS-specific instructions, read through step 2 of [Deploy CockroachDB on AWS](deploy-cockroachdb-on-aws.html).

Be sure to configure your network to allow TCP communication on these ports: 

- `26257` for inter-node communication (i.e., working as a cluster) and connecting with applications
- `8080` for exposing your Admin UI

## Step 2. Install Docker Engine

On each instance: 

1. [Install and start Docker Engine](https://docs.docker.com/engine/installation/). 

2. Confirm that the Docker daemon is running in the background:

   ~~~ shell
   $ sudo docker version
   ~~~ 

## Step 3. Start the swarm

1. On the instance where you want to run your manager node, [initialize the swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/create-swarm/). 

   Take note of the output for `docker swarm init` as it includes the command you'll use in the next step. It should look like this:

   ~~~ shell
   $ sudo docker swarm init --advertise-addr 10.142.0.2
   Swarm initialized: current node (414z67gr5cgfalm4uriu4qdtm) is now a manager.

   To add a worker to this swarm, run the following command:

      $ docker swarm join \
      --token SWMTKN-1-5vwxyi6zl3cc62lqlhi1jrweyspi8wblh2i3qa7kv277fgy74n-e5eg5c7ioxypjxlt3rpqorh15 \
      10.142.0.2:2377

   To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
   ~~~

2. On the other two insances, [create a worker node joined to to the swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/add-nodes/) by running the `docker swarm join` command in the output from step 1, for example:

   ~~~ shell
   $ sudo docker swarm join \
         --token SWMTKN-1-5vwxyi6zl3cc62lqlhi1jrweyspi8wblh2i3qa7kv277fgy74n-e5eg5c7ioxypjxlt3rpqorh15 \
         10.142.0.2:2377
   This node joined a swarm as a worker.
   ~~~

3. On the instance running your manager node, verify that your swarm is running:

   ~~~ shell
   $ sudo docker node ls
   ID                           HOSTNAME    STATUS  AVAILABILITY  MANAGER STATUS
   414z67gr5cgfalm4uriu4qdtm *  instance-1  Ready   Active        Leader
   ae144s35dx1p1lcegh6bblyed    instance-2  Ready   Active
   aivjg2joxyvzvbksjsix27khy    instance-3  Ready   Active
   ~~~

## Step 4. Create an overlay network

On the instance running your manager node, create an overlay network so that the containers in your swarm can talk to each other:

~~~ shell
$ sudo docker network create --driver overlay cockroachdb
~~~

## Step 5. Start the CockroachDB cluster

1. On the instance running your manager node, create the first service that the others will join to:

   ~~~ shell
   $ sudo docker service create --replicas 1 --name cockroachdb-0 --network cockroachdb \
   --mount type=volume,source=cockroachdb-0,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   cockroachdb/cockroach:{{site.data.strings.version}} start --logtostderr --insecure
   ~~~

   This command creates a service that starts a container, joins it to the overlay network, and starts the first CockroachDB node inside the container mounted to a local volume for persistent storage. Let's look at each part:

   - `sudo docker service create`: The Docker command to create a new service.
   - `--replicas`: The number of containers controlled by the service. Since each service will control one container running one CockroachDB node, this will always be `1`.  
   - `--name`: The name for the service.
   - `--network`: The overlay network for the container to join. See [Step 4. Create an overlay network](#step-4-create-an-overlay-network) for more details.
   - `--mount`: This flag mounts a local volume called `cockroachdb-0`. This means that data and logs for the node running in this container will be stored in `/cockroach/cockroach-data` on the instance and will be reused on restart as long as restart happens on the same instance, which is not guaranteed.
     {{site.data.alerts.callout_info}}If you plan on replacing or adding instances, it's recommended to use remote storage instead of local disk. To do so, <a href="https://docs.docker.com/engine/reference/commandline/volume_create/">create a remote volume</a> for each CockroachDB instance using the volume driver of your choice, and then specify that volume driver instead of the <code>volume-driver=local</code> part of the command above, e.g., <code>volume-driver=gce</code> if using the <a href="https://github.com/mcuadros/gce-docker">GCE volume driver</a>.
   - `--stop-grace-period`: This flag sets a grace period to give CockroachDB enough time to shut down gracefully, when possible.
   - `cockroachdb/cockroach:{{site.data.strings.version}} start --logtostderr --insecure`: The CockroachDB command to [start a node](start-a-node.html) in the container in insecure mode.

2. On the same instance, create the services to start two other CockroachDB nodes and join them to the cluster:

   ~~~ shell
   $ sudo docker service create --replicas 1 --name cockroachdb-1 --network cockroachdb \
   --mount type=volume,source=cockroachdb-1,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   cockroachdb/cockroach:{{site.data.strings.version}} start --logtostderr --insecure --join cockroachdb-0:26257

   $ sudo docker service create --replicas 1 --name cockroachdb-2 --network cockroachdb \
   --mount type=volume,source=cockroachdb-2,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   cockroachdb/cockroach:{{site.data.strings.version}} start --logtostderr --insecure --join cockroachdb-0:26257
   ~~~

   There are only a few differences when creating the second two services:

   - The `--name` is unique for each service. 
   - The CockroachDB command to [`start`](start-a-node.html) each node uses the the `--join` flag to connect it to the cluster.

3. Verify that all three services were created successfully:

   ~~~ shell
   $ sudo docker service ls
   ID            NAME           REPLICAS  IMAGE                                COMMAND
   4mzn2jhxym70  cockroachdb-1  1/1       cockroachdb/cockroach:beta-20160908  start --logtostderr --insecure --join cockroachdb-0:26257
   beesumtwdkry  cockroachdb-2  1/1       cockroachdb/cockroach:beta-20160908  start --logtostderr --insecure --join cockroachdb-0:26257
   c46z6o7l7r77  cockroachdb-0  1/1       cockroachdb/cockroach:beta-20160908  start --logtostderr --insecure
   ~~~

   {{site.data.alerts.callout_success}}The service definitions tell the CockroachDB nodes to log to <code>stderr</code>, so if you ever need access to a node's logs for troubleshooting, use <a href="https://docs.docker.com/engine/reference/commandline/logs/"><code>sudo docker logs CONTAINER ID</code></a> from the instance on which the container is running.{{site.data.alerts.end}}

4. Remove the first service and recreate it again with the `--join` flag to ensure that, if the first node restarts, it will rejoin the original cluster instead of initiating a new cluster:

   ~~~ shell
   $ sudo docker service rm cockroachdb-0

   $ sudo docker service create --replicas 1 --name cockroachdb-0 --network cockroachdb \
   --mount type=volume,source=cockroachdb-0,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   cockroachdb/cockroach:{{site.data.strings.version}} start --logtostderr --insecure --join cockroachdb-1:26257
   ~~~

   When you list the services, the start command for the first node, `cockroachdb-0`, should now include the `--join` flag:  

   ~~~ shell
   $ sudo docker service ls
   ID            NAME           REPLICAS  IMAGE                                COMMAND
   4mzn2jhxym70  cockroachdb-1  1/1       cockroachdb/cockroach:beta-20160908  start --logtostderr --insecure --join cockroachdb-0:26257
   beesumtwdkry  cockroachdb-2  1/1       cockroachdb/cockroach:beta-20160908  start --logtostderr --insecure --join cockroachdb-0:26257
   ce2khc7qmuz7  cockroachdb-0  1/1       cockroachdb/cockroach:beta-20160908  start --logtostderr --insecure --join cockroachdb-1:26257
   ~~~

## Step 7. Use the Built-in SQL Client

1. On any instance, use the `sudo docker ps` command to get the ID of the container running the CockroachDB node:

   ~~~ shell
   $ sudo docker ps | grep cockroachdb
   9539871cc769        cockroachdb/cockroach:beta-20160908   "/cockroach/cockroach"   18 hours ago        Up 18 hours         8080/tcp, 26257/tcp   cockroachdb-0.1.0wigdh8lx0ylhuzm4on9bbldq
   ~~~

2. Use the `sudo docker exec` command to open the built-in SQL shell in interactive mode inside the container:

   ~~~ shell
   $ sudo docker exec -it 9539871cc769 ./cockroach sql
   ~~~

2. Run some [CockroachDB SQL statements](sql-statements.html):

   ~~~ shell
   root@26257> CREATE DATABASE bank;
   CREATE DATABASE

   root@26257> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
   CREATE TABLE

   root@26257> INSERT INTO bank.accounts VALUES (1234, 10000.50);
   INSERT 1

   root@26257> SELECT * FROM bank.accounts;
   +------+---------+
   |  id  | balance |
   +------+---------+
   | 1234 | 10000.5 |
   +------+---------+
   (1 row)
   ~~~

4. When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit. 

## Step 8. Simulate node failure

Since we have three service definitions, one for each node, Docker Swarm will ensure that there are three nodes running at all times. If a node fails, Docker Swarm will automatically create another node with the same network identity and storage. 

To see this in action:

1. On any instance, use the `sudo docker ps` command to get the ID of the container running the CockroachDB node:

   ~~~ shell
   $ sudo docker ps | grep cockroachdb
   9539871cc769        cockroachdb/cockroach:beta-20160908   "/cockroach/cockroach"   18 hours ago        Up 18 hours         8080/tcp, 26257/tcp   cockroachdb-0.1.0wigdh8lx0ylhuzm4on9bbldq
   ~~~

2. Stop the CockroachDB node running in the container:

   ~~~ shell
   $ sudo docker exec -it 9539871cc769 ./cockroach quit
   ~~~

3. Verify that the node was restarted in a new container:

   ~~~ shell
   $ sudo docker ps | grep cockroachdb
   4a58f86e3ced        cockroachdb/cockroach:beta-20160908   "/cockroach/cockroach"   7 seconds ago       Up 1 seconds        8080/tcp, 26257/tcp   cockroachdb-0.1.cph86kmhhcp8xzq6a1nxtk9ng
   ~~~

## Step 9. Scale the cluster

To increase the number of nodes in your CockroachDB cluster:

1. Create an additional instance (see [Step 1](#step-1-create-instances)).
2. Install Docker Enginer on the instance (see [Step 2](#step-2-install-docker-engine)).
3. Join the instance to the swarm as a worker node (see [Step 3.2](#step-3-start-the-swarm)).
4. Create a new service to start another node and join it to the CockroachDB cluster (see [Step 5.2](#step-5-start-the-cockroachdb-cluster)).

## Step 10. Stop the cluster 

To stop the CockroachDB cluster, on the instance running your manager node, remove the services:

~~~ shell
$ sudo docker service rm cockroachdb-0 cockroachdb-1 cockroachdb-2
cockroachdb-0
cockroachdb-1
cockroachdb-2
~~~

You may want to remove the persistent volumes used by service as well. To do this, on each instance:

~~~ shell
# Identify the name of the local volume:
$ sudo docker volume ls
cockroachdb-0

# Remove the local volume:
$ sudo docker volume rm cockroachdb-0
~~~ 

## See Also

- [Kubernetes](orchestrate-cockroachdb-with-kubernetes.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
