---
title: Orchestrate CockroachDB with Docker Swarm
summary: How to orchestrate the deployment and management of a secure three-node CockroachDB cluster as a Docker swarm.
toc: false
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="orchestrate-cockroachdb-with-docker-swarm-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to orchestrate the deployment and management of a secure three-node CockroachDB cluster as a [swarm of Docker Engines](https://docs.docker.com/engine/swarm/).

If you are not concerned with protecting your data with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

<div id="toc"></div>

## Before You Begin

Before you begin, it's helpful to review some terminology:

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll use three, one per CockroachDB node.
[Docker Engine](https://docs.docker.com/engine/) | This is the core Docker application that creates and runs containers. In this tutorial, you'll install and start Docker Engine on each of your three instances.
[swarm](https://docs.docker.com/engine/swarm/key-concepts/#/swarm) | A swarm is a group of Docker Engines joined into a single, virtual host.
[swarm node](https://docs.docker.com/engine/swarm/how-swarm-mode-works/nodes/) | Each member of a swarm is considered a node. In this tutorial, each instance will be a swarm node, one as the master node and the two others as worker nodes. You'll submit service definitions to the master node, which will dispatch work to the worker nodes.
[service](https://docs.docker.com/engine/swarm/how-swarm-mode-works/services/) | A service is the definition of the tasks to execute on swarm nodes. In this tutorial, you'll define three services, each starting a CockrochDB node inside a container and joining it into a single cluster. Each service also ensures a stable network identity on restart via a resolvable DNS name.
[secret](https://docs.docker.com/engine/swarm/secrets/) | A secret is Docker's mechanism for managing sensitive data that a container needs at runtime. Since CockroachDB uses TLS certificates to authenticate and encrypt inter-node and client/node communication, you'll create a secret per certificate and use the secrets in your services.
[overlay network](https://docs.docker.com/engine/userguide/networking/#/an-overlay-network-with-docker-engine-swarm-mode) | An overlay network enables communication between the nodes of a swarm. In this tutorial, you'll create an overlay network and use it in each of your services.

## Step 1. Create instances

Create three instances, one for each node of your cluster.

- For GCE-specific instructions, read through step 2 of [Deploy CockroachDB on GCE](deploy-cockroachdb-on-google-cloud-platform-insecure.html).
- For AWS-specific instructions, read through step 2 of [Deploy CockroachDB on AWS](deploy-cockroachdb-on-aws-insecure.html).

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
   ~~~

   ~~~ shell
   Swarm initialized: current node (414z67gr5cgfalm4uriu4qdtm) is now a manager.

   To add a worker to this swarm, run the following command:

      $ docker swarm join \
      --token SWMTKN-1-5vwxyi6zl3cc62lqlhi1jrweyspi8wblh2i3qa7kv277fgy74n-e5eg5c7ioxypjxlt3rpqorh15 \
      10.142.0.2:2377

   To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
   ~~~

2. On the other two instances, [create a worker node joined to the swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/add-nodes/) by running the `docker swarm join` command in the output from step 1, for example:

   ~~~ shell
   $ sudo docker swarm join \
         --token SWMTKN-1-5vwxyi6zl3cc62lqlhi1jrweyspi8wblh2i3qa7kv277fgy74n-e5eg5c7ioxypjxlt3rpqorh15 \
         10.142.0.2:2377
   ~~~

   ~~~ shell
   This node joined a swarm as a worker.
   ~~~

3. On the instance running your manager node, verify that your swarm is running:

   ~~~ shell
   $ sudo docker node ls
   ~~~

   ~~~ shell
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

## Step 5. Create security resources

A secure CockroachDB cluster uses TLS certificates for encrypted inter-node and client/node authentication and communication. In this step, you'll install CockroachDB locally and then use the [`cockroach cert`](create-security-certificates.html) command to generate a certificate authority (CA) certificate and key pair and node cerificate and key pairs. You'll then assign these files to Docker [secrets](https://docs.docker.com/engine/swarm/secrets/) for use by your Docker services.

1. [Install CockroachDB](install-cockroachdb.html) locally.

2. Create a `certs` directory:

   ~~~ shell
   $ mkdir certs
   ~~~

3. Use the `cockroach cert create-ca` command to create the certificate authority (CA) certificate and key pair:

   ~~~ shell
   # Create the CA cert and key pair:
   $ cockroach cert create-ca \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key
   ~~~

4. Use the `cockroach cert create-node` command to create a certificate and key pair per node:

   ~~~ shell
   # Create the cert and key pair for node 1:
   $ cockroach cert create-node \
   cockroachdb-1 \
   localhost \
   127.0.0.1 \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/cockroachdb-1.cert \
   --key=certs/cockroachdb-1.key

   # Create the cert and key pair for node 2:
   $ cockroach cert create-node \
   cockroachdb-2 \
   localhost \
   127.0.0.1 \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/cockroachdb-2.cert \
   --key=certs/cockroachdb-2.key

   # Create the cert and key pair for node 3:
   $ cockroach cert create-node \
   cockroachdb-3 \
   localhost \
   127.0.0.1 \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/cockroachdb-3.cert \
   --key=certs/cockroachdb-3.key
   ~~~

   These commands issue the cert/key pairs to the service names you will use for the nodes later (`cockroachdb-1`, `cockroachdb-2`, `cockroachdb-3`), as well as to local addresses that will make it possible to run the built-in SQL shell and other CockroachDB client commands in the same containers as the nodes. If you plan to connect a client to the cluster from a separate container, you'll need to <a href="create-security-certificates.html#create-the-certificate-and-key-for-a-client">create a client cert and key</a> as well.

5. Use the [`docker secret create`](https://docs.docker.com/engine/reference/commandline/secret_create/) command to create a Docker secret for the `ca.cert` file and each node `.cert` and `.key` file:

   {{site.data.alerts.callout_success}}Store the <code>ca.key</code> file somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster.{{site.data.alerts.end}}

   ~~~ shell
   # Create the secret for the CA cert:
   $ docker secret create cockroachdb-cacert certs/ca.cert

   # Create secrets for the node 1 cert and key:
   $ docker secret create cockroachdb-1-cert certs/cockroachdb-1.cert
   $ docker secret create cockroachdb-1-key certs/cockroachdb-1.key

   # Create secrets for the node 2 cert and key:
   $ docker secret create cockroachdb-2-cert certs/cockroachdb-2.cert
   $ docker secret create cockroachdb-2-key certs/cockroachdb-2.key

   # Create secrets for the node 3 cert and key:
   $ docker secret create cockroachdb-3-cert certs/cockroachdb-3.cert
   $ docker secret create cockroachdb-3-key certs/cockroachdb-3.key
   ~~~

   These commands assign names to the secrets and identify the location of the relevant certificates and keys. The names used are similar to the the `.cert` and `.key` filenames. You can use different names, if you like, but be sure to reference the correct names when starting the CockroachDB nodes in the next step.

## Step 6. Start the CockroachDB cluster

1. On the instance running your manager node, create the first service that the others will join to:

   ~~~ shell
   $ sudo docker service create \
   --replicas 1 \
   --name cockroachdb-1 \
   --network cockroachdb \
   --mount type=volume,source=cockroachdb-1,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   --secret cockroachdb-cacert \
   --secret cockroachdb-1-cert \
   --secret source=cockroachdb-1-key,target=cockroachdb-1-key,mode=0600 \
   cockroachdb/cockroach:{{site.data.strings.version}} start \
   --advertise-host=cockroachdb-1 \
   --logtostderr \
   --ca-cert=/run/secrets/cockroachdb-cacert \
   --cert=/run/secrets/cockroachdb-1-cert \
   --key=/run/secrets/cockroachdb-1-key
   ~~~

   This command creates a service that starts a container securely, joins it to the overlay network, and starts the first CockroachDB node inside the container mounted to a local volume for persistent storage. Let's look at each part:

   - `sudo docker service create`: The Docker command to create a new service.
   - `--replicas`: The number of containers controlled by the service. Since each service will control one container running one CockroachDB node, this will always be `1`.
   - `--name`: The name for the service.
   - `--network`: The overlay network for the container to join. See [Step 4. Create an overlay network](#step-4-create-an-overlay-network) for more details.
   - `--mount`: This flag mounts a local volume called `cockroachdb-1`. This means that data and logs for the node running in this container will be stored in `/cockroach/cockroach-data` on the instance and will be reused on restart as long as restart happens on the same instance, which is not guaranteed.
     {{site.data.alerts.callout_info}}If you plan on replacing or adding instances, it's recommended to use remote storage instead of local disk. To do so, <a href="https://docs.docker.com/engine/reference/commandline/volume_create/">create a remote volume</a> for each CockroachDB instance using the volume driver of your choice, and then specify that volume driver instead of the <code>volume-driver=local</code> part of the command above, e.g., <code>volume-driver=gce</code> if using the <a href="https://github.com/mcuadros/gce-docker">GCE volume driver</a>.
   - `--stop-grace-period`: This flag sets a grace period to give CockroachDB enough time to shut down gracefully, when possible.
   - `--secret`: These flags identify the secrets to use in securing the node. They must reference the secret names for the CA certificate and node certificate and key, as defined in step 5.5. Also, the file permissions for the node key secret must be set to `0600` as shown; if this isn't set, Docker will assign a default file permission of `0400`, which will not work with CockroachDB.
   - `cockroachdb/cockroach:{{site.data.strings.version}} start ...`: The CockroachDB command to [start a node](start-a-node.html) in the container, instruct other cluster members to talk to it using its persistent network address, `cockroachdb-1`, and to use the relevant Docker secrets to authenticate and encrypt communication.

2. On the same instance, create the services to start two other CockroachDB nodes and join them to the cluster:

   ~~~ shell
   # Create the second service:
   $ sudo docker service create \
   --replicas 1 \
   --name cockroachdb-2 \
   --network cockroachdb \
   --stop-grace-period 60s \
   --mount type=volume,source=cockroachdb-2,target=/cockroach/cockroach-data,volume-driver=local \
   --secret cockroachdb-cacert \
   --secret cockroachdb-2-cert \
   --secret source=cockroachdb-2-key,target=cockroachdb-2-key,mode=0600 \
   cockroachdb/cockroach:{{site.data.strings.version}} start \
   --advertise-host=cockroachdb-2 \
   --logtostderr \
   --ca-cert=/run/secrets/cockroachdb-cacert \
   --cert=/run/secrets/cockroachdb-2-cert \
   --key=/run/secrets/cockroachdb-2-key \
   --join=cockroachdb-1:26257

   # Create the third service:
   $ sudo docker service create \
   --replicas 1 \
   --name cockroachdb-3 \
   --network cockroachdb \
   --mount type=volume,source=cockroachdb-3,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   --secret cockroachdb-cacert \
   --secret cockroachdb-3-cert \
   --secret source=cockroachdb-3-key,target=cockroachdb-3-key,mode=0600 \
   cockroachdb/cockroach:{{site.data.strings.version}} start \
   --advertise-host=cockroachdb-3 \
   --logtostderr \
   --ca-cert=/run/secrets/cockroachdb-cacert \
   --cert=/run/secrets/cockroachdb-3-cert \
   --key=/run/secrets/cockroachdb-3-key \
   --join=cockroachdb-1:26257
   ~~~

   There are only a few differences when creating the second two services:

   - The `--name` and `--secret` flags are unique for each service.
   - The CockroachDB command to [`start`](start-a-node.html) each node uses the the `--join` flag to connect it to the cluster via the name of the first service and its default port, `cockroachdbb-1:26257`.

3. Verify that all three services were created successfully:

   ~~~ shell
   $ sudo docker service ls
   ~~~

   ~~~
   ID            NAME           MODE        REPLICAS  IMAGE
   a6g0ur6857j6  cockroachdb-1  replicated  1/1       cockroachdb/cockroach:{{site.data.strings.version}}
   dr81a756gaa6  cockroachdb-2  replicated  1/1       cockroachdb/cockroach:{{site.data.strings.version}}
   il4m7op1afg9  cockroachdb-3  replicated  1/1       cockroachdb/cockroach:{{site.data.strings.version}}
   ~~~

   {{site.data.alerts.callout_success}}The service definitions tell the CockroachDB nodes to log to <code>stderr</code>, so if you ever need access to a node's logs for troubleshooting, use <a href="https://docs.docker.com/engine/reference/commandline/logs/"><code>sudo docker logs &lt;container id&gt;</code></a> from the instance on which the container is running.{{site.data.alerts.end}}

4. Remove the first service and recreate it again with the `--join` flag to ensure that, if the first node restarts, it will rejoin the original cluster via the the second service, `cockroachdb-2`, instead of initiating a new cluster:

   ~~~ shell
   $ sudo docker service rm cockroachdb-1

   $ sudo docker service create \
   --replicas 1 \
   --name cockroachdb-1 \
   --network cockroachdb \
   --mount type=volume,source=cockroachdb-1,target=/cockroach/cockroach-data,volume-driver=local \
   --stop-grace-period 60s \
   --secret cockroachdb-cacert \
   --secret cockroachdb-1-cert \
   --secret source=cockroachdb-1-key,target=cockroachdb-1-key,mode=0600 \
   cockroachdb/cockroach:{{site.data.strings.version}} start \
   --advertise-host=cockroachdb-1 \
   --logtostderr \
   --ca-cert=/run/secrets/cockroachdb-cacert \
   --cert=/run/secrets/cockroachdb-1-cert \
   --key=/run/secrets/cockroachdb-1-key \
   --join=cockroachdb-2:26257
   ~~~

## Step 7. Use the built-in SQL client

1. On the first instance, use the `sudo docker ps` command to get the ID of the container running the CockroachDB node:

   ~~~ shell
   $ sudo docker ps | grep cockroachdb
   ~~~

   ~~~ shell
   9539871cc769        cockroachdb/cockroach:{{site.data.strings.version}}   "/cockroach/cockroach"   2 minutes ago        Up 2 minutes         8080/tcp, 26257/tcp   cockroachdb-1.1.0wigdh8lx0ylhuzm4on9bbldq
   ~~~

2. Use the `sudo docker exec` command to open the built-in SQL shell in interactive mode inside the container:

   ~~~ shell
   $ sudo docker exec -it 9539871cc769 \
   ./cockroach sql \
   --ca-cert=/run/secrets/cockroachdb-cacert \
   --cert=/run/secrets/cockroachdb-2-cert \
   --key=/run/secrets/cockroachdb-2-key
   ~~~

   Because we are starting the SQL client in the same container as a node, we can use the node certificate and key to execute the [`cockroach sql`](use-the-built-in-sql-client.html) command securely.

3. Run some [CockroachDB SQL statements](sql-statements.html):

   ~~~ sql
   > CREATE DATABASE bank;

   > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);

   > INSERT INTO bank.accounts VALUES (1234, 10000.50);

   > SELECT * FROM bank.accounts;
   ~~~

   ~~~ shell
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

1. On the second instance and use the `sudo docker ps` command to get the ID of the container running the CockroachDB node:

   ~~~ shell
   $ sudo docker ps | grep cockroachdb
   ~~~

   ~~~
   32769a6dd664        cockroachdb/cockroach:{{site.data.strings.version}}   "/cockroach/cockroach"   10 minutes ago        Up 10 minutes         8080/tcp, 26257/tcp   cockroachdb-2.1.0wigdh8lx0ylhuzm4on9bbldq
   ~~~

2. Stop the CockroachDB node running in the container:

   ~~~ shell
   $ sudo docker exec -it 32769a6dd664 \
   ./cockroach quit \
   --ca-cert=/run/secrets/cockroachdb-cacert \
   --cert=/run/secrets/cockroachdb-2-cert \
   --key=/run/secrets/cockroachdb-2-key
   ~~~

   Because we are stopping the node in the container where the node is running, we can use the node certificate and key to execute the [`cockroach quit`](stop-a-node.html) command securely.

3. Verify that the node was restarted in a new container:

   ~~~ shell
   $ sudo docker ps | grep cockroachdb
   ~~~

   ~~~
   4a58f86e3ced        cockroachdb/cockroach:{{site.data.strings.version}}   "/cockroach/cockroach"   7 seconds ago       Up 1 seconds        8080/tcp, 26257/tcp   cockroachdb-2.1.cph86kmhhcp8xzq6a1nxtk9ng
   ~~~

## Step 9. Scale the cluster

To increase the number of nodes in your CockroachDB cluster:

1. Create an additional instance (see [Step 1](#step-1-create-instances)).
2. Install Docker Engine on the instance (see [Step 2](#step-2-install-docker-engine)).
3. Join the instance to the swarm as a worker node (see [Step 3.2](#step-3-start-the-swarm)).
4. Create security resources for the node (see [Step 5.5 and 5.6](#step-5-create-security-resources)).
5. Create a new service to start another node and join it to the CockroachDB cluster (see [Step 6.2](#step-6-start-the-cockroachdb-cluster)).

## Step 10. Stop the cluster

To stop the CockroachDB cluster, on the instance running your manager node, remove the services:

~~~ shell
$ sudo docker service rm cockroachdb-1 cockroachdb-2 cockroachdb-3
cockroachdb-1
cockroachdb-2
cockroachdb-3
~~~

You may want to remove the persistent volumes used by the services as well. To do this, on each instance:

~~~ shell
# Identify the name of the local volume:
$ sudo docker volume ls
cockroachdb-1

# Remove the local volume:
$ sudo docker volume rm cockroachdb-1
~~~

## See Also

- [Orchestrate CockroachDB with Kubernetes](orchestrate-cockroachdb-with-kubernetes.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
- [Local Deployment](start-a-local-cluster.html)
