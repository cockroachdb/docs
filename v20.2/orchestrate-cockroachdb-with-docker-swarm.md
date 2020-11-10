---
title: Orchestrate CockroachDB with Docker Swarm
summary: How to orchestrate the deployment and management of a secure three-node CockroachDB cluster as a Docker swarm.
toc: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="orchestrate-cockroachdb-with-docker-swarm-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to orchestrate the deployment and management of a secure three-node CockroachDB cluster as a [swarm of Docker Engines](https://docs.docker.com/engine/swarm/).

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.


## Before you begin

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
- `8080` for exposing your DB Console

## Step 2. Install Docker Engine

On each instance:

1. [Install and start Docker Engine](https://docs.docker.com/engine/installation/).

2. Confirm that the Docker daemon is running in the background:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker version
    ~~~

## Step 3. Start the swarm

1. On the instance where you want to run your manager node, [initialize the swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/create-swarm/).

    Take note of the output for `docker swarm init` as it includes the command you'll use in the next step. It should look like this:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker swarm init --advertise-addr 10.142.0.2
    ~~~

    ~~~
    Swarm initialized: current node (414z67gr5cgfalm4uriu4qdtm) is now a manager
    To add a worker to this swarm, run the following command
       $ docker swarm join \
       --toke    SWMTKN-1-5vwxyi6zl3cc62lqlhi1jrweyspi8wblh2i3qa7kv277fgy74n-e5eg5c7ioxypjxlt3rpqorh15 \
       10.142.0.2:237
    To add a manager to this swarm, run 'docker swarm join-token manager' and follow th    instructions.
    ~~~

2. On the other two instances, [create a worker node joined to the swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/add-nodes/) by running the `docker swarm join` command in the output from step 1, for example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker swarm join \
          --to    SWMTKN-1-5vwxyi6zl3cc62lqlhi1jrweyspi8wblh2i3qa7kv277fgy74n-e5eg5c7ioxypjxlt3rpqorh15 \
          10.142.0.2:2377
    ~~~

    ~~~
    This node joined a swarm as a worker.
    ~~~

3. On the instance running your manager node, verify that your swarm is running:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker node ls
    ~~~

    ~~~
    ID                           HOSTNAME    STATUS  AVAILABILITY  MANAGER STATUS
    414z67gr5cgfalm4uriu4qdtm *  instance-1  Ready   Active        Leader
    ae144s35dx1p1lcegh6bblyed    instance-2  Ready   Active
    aivjg2joxyvzvbksjsix27khy    instance-3  Ready   Active
    ~~~

## Step 4. Create an overlay network

On the instance running your manager node, create an overlay network so that the containers in your swarm can talk to each other:

{% include copy-clipboard.html %}
~~~ shell
$ sudo docker network create --driver overlay --attachable cockroachdb
~~~

+The `--attachable` option enables non-swarm containers running on Docker to access services on the network, which makes the service easier to use interactively.

## Step 5. Create security resources

A secure CockroachDB cluster uses TLS certificates for encrypted inter-node and client/node authentication and communication. In this step, you'll install CockroachDB on the instance running your manager node, use the [`cockroach cert`](cockroach-cert.html) command to generate certificate authority (CA), node, and client certificate and key pairs, and use the [`docker secret create`](https://docs.docker.com/engine/reference/commandline/secret_create/) command to assign these files to Docker [secrets](https://docs.docker.com/engine/swarm/secrets/) for use by your Docker services.

1. On the instance running your manager node, install CockroachDB from our latest binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Get the latest CockroachDB tarball:
    $ wget https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Extract the binary:
    $ tar -xf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
    --strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Move the binary:
    $ sudo mv cockroach /usr/local/bin/
    ~~~

2. Create a `certs` directory and a safe directory to keep your CA key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~

3. Create the CA certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ls certs
    ~~~

    ~~~
    ca.crt
    ~~~

4. Create a Docker secret for the `ca.crt` file using the [`docker secret create`](https://docs.docker.com/engine/reference/commandline/secret_create/) command:

    {{site.data.alerts.callout_danger}}Store the <code>ca.key</code> file somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster.{{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create ca-crt certs/ca.crt
    ~~~

    This command assigns a name to the secret (`ca-crt`) and identifies the location of the cockroach-generated CA certificate file. You can use a different secret name, if you like, but be sure to reference the correct name when starting the CockroachDB nodes in the next step.

5. Create the certificate and key for the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    cockroachdb-1 \
    localhost \
    127.0.0.1 \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ls certs
    ~~~

    ~~~
    ca.crt
    node.crt
    node.key
    ~~~

    This command issues the certificate/key pair to the service name you will use for the node later (`cockroachdb-1`) as well as to local addresses that will make it easier to run the built-in SQL shell and other CockroachDB client commands in the same container as the node.

6. Create Docker secrets for the first node's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-1-crt certs/node.crt
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-1-key certs/node.key
    ~~~

    Again, these commands assign names to the secrets (`cockroachdb-1-crt` and `cockroachdb-1-key`) and identify the location of the cockroach-generated certificate and key files.

7. Create the certificate and key for the second node, using the `--overwrite` flag to replace the files created for the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node --overwrite \
    cockroachdb-2 \
    localhost \
    127.0.0.1 \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ls certs
    ~~~

    ~~~
    ca.crt
    node.crt
    node.key
    ~~~

8. Create Docker secrets for the second node's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-2-crt certs/node.crt
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-2-key certs/node.key
    ~~~

9. Create the certificate and key for the third node, again using the `--overwrite` flag to replace the files created for the second node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node --overwrite \
    cockroachdb-3 \
    localhost \
    127.0.0.1 \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ls certs
    ~~~

    ~~~
    ca.crt
    node.crt
    node.key
    ~~~

10. Create Docker secrets for the third node's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-3-crt certs/node.crt
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-3-key certs/node.key
    ~~~

11. Create a client certificate and key for the `root` user:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

12. Create Docker secrets for the `root` user's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-root-crt certs/client.root.crt
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker secret create cockroachdb-root-key certs/client.root.key
    ~~~

## Step 6. Start the CockroachDB cluster

1. On the instance running your manager node, create one swarm service for each CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~
    # Create the first service:
    $ sudo docker service create \
    --replicas 1 \
    --name cockroachdb-1 \
    --hostname cockroachdb-1 \
    --network cockroachdb \
    --mount type=volume,source=cockroachdb-1,target=/cockroach/cockroach-data,volume-driver=local \
    --stop-grace-period 60s \
    --publish 8080:8080 \
    --secret source=ca-crt,target=ca.crt \
    --secret source=cockroachdb-1-crt,target=node.crt \
    --secret source=cockroachdb-1-key,target=node.key,mode=0600 \
    --secret source=cockroachdb-root-crt,target=client.root.crt \
    --secret source=cockroachdb-root-key,target=client.root.key,mode=0600 \
    cockroachdb/cockroach:{{page.release_info.version}} start \
    --join=cockroachdb-1:26257,cockroachdb-2:26257,cockroachdb-3:26257 \
    --cache=.25 \
    --max-sql-memory=.25 \
    --logtostderr \
    --certs-dir=/run/secrets
    ~~~

    {% include copy-clipboard.html %}
    ~~~
    # Create the second service:
    $ sudo docker service create \
    --replicas 1 \
    --name cockroachdb-2 \
    --hostname cockroachdb-2 \
    --network cockroachdb \
    --stop-grace-period 60s \
    --mount type=volume,source=cockroachdb-2,target=/cockroach/cockroach-data,volume-driver=local \
    --secret source=ca-crt,target=ca.crt \
    --secret source=cockroachdb-2-crt,target=node.crt \
    --secret source=cockroachdb-2-key,target=node.key,mode=0600 \
    --secret source=cockroachdb-root-crt,target=client.root.crt \
    --secret source=cockroachdb-root-key,target=client.root.key,mode=0600 \
    cockroachdb/cockroach:{{page.release_info.version}} start \
    --join=cockroachdb-1:26257,cockroachdb-2:26257,cockroachdb-3:26257 \
    --cache=.25 \
    --max-sql-memory=.25 \
    --logtostderr \
    --certs-dir=/run/secrets
    ~~~

    {% include copy-clipboard.html %}
    ~~~
    # Create the third service:
    $ sudo docker service create \
    --replicas 1 \
    --name cockroachdb-3 \
    --hostname cockroachdb-3 \
    --network cockroachdb \
    --mount type=volume,source=cockroachdb-3,target=/cockroach/cockroach-data,volume-driver=local \
    --stop-grace-period 60s \
    --secret source=ca-crt,target=ca.crt \
    --secret source=cockroachdb-3-crt,target=node.crt \
    --secret source=cockroachdb-3-key,target=node.key,mode=0600 \
    --secret source=cockroachdb-root-crt,target=client.root.crt \
    --secret source=cockroachdb-root-key,target=client.root.key,mode=0600 \
    cockroachdb/cockroach:{{page.release_info.version}} start \
    --join=cockroachdb-1:26257,cockroachdb-2:26257,cockroachdb-3:26257 \
    --cache=.25 \
    --max-sql-memory=.25 \
    --logtostderr \
    --certs-dir=/run/secrets
    ~~~

    These commands each create a service that starts a container securely, joins it to the overlay network, and starts a CockroachDB node inside the container mounted to a local volume for persistent storage. Let's look at each part:
    - `sudo docker service create`: The Docker command to create a new service.
    - `--replicas`: The number of containers controlled by the service. Since each service will control one container running one CockroachDB node, this will always be `1`.
    - `--name`: The name for the service.
    - `--hostname`: The hostname of the container. It will listen for connections on this address.
    - `--network`: The overlay network for the container to join. See [Step 4. Create an overlay network](#step-4-create-an-overlay-network) for more details.
    - `--mount`: This flag mounts a local volume with the same name as the service. This means that data and logs for the node running in this container will be stored in `/cockroach/cockroach-data` on the instance and will be reused on restart as long as restart happens on the same instance, which is not guaranteed.
    {{site.data.alerts.callout_info}}If you plan on replacing or adding instances, it's recommended to use remote storage instead of local disk. To do so, <a href="https://docs.docker.com/engine/reference/commandline/volume_create/">create a remote volume</a> for each CockroachDB instance using the volume driver of your choice, and then specify that volume driver instead of the <code>volume-driver=local</code> part of the command above, e.g., <code>volume-driver=gce</code> if using the <a href="https://github.com/mcuadros/gce-docker">GCE volume driver</a>.{{site.data.alerts.end}}
    - `--stop-grace-period`: This flag sets a grace period to give CockroachDB enough time to shut down gracefully, when possible.
    - `--publish`: This flag makes the DB Console accessible at the IP of any instance running a swarm node on port `8080`. Note that, even though this flag is defined only in the first node's service, the swarm exposes this port on every swarm node using a routing mesh. See [Publishing ports](https://docs.docker.com/engine/swarm/services/#publish-ports) for more details.
    - `--secret`: These flags identify the secrets to use in securing the node. They must reference the secret names defined in step 5. For the node and client certificate and key secrets, the `source` field identifies the relevant secret, and the `target` field defines the name to be used in `cockroach start` and `cockroach sql` flags. For the node and client key secrets, the `mode` field also sets the file permissions to `0600`; if this isn't set, Docker will assign a default file permission of `0444`, which will not work with CockroachDB's built-in SQL client.
    - `cockroachdb/cockroach:{{page.release_info.version}} start ...`: The CockroachDB command to [start a node](cockroach-start.html) in the container in insecure mode and instruct other cluster members to talk to each other using their persistent network addresses, which match the services' names.

2. Verify that all three services were created successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker service ls
    ~~~

    ~~~
    ID            NAME           MODE        REPLICAS  IMAGE
    a6g0ur6857j6  cockroachdb-1  replicated  1/1       cockroachdb/cockroach:{{page.release_info.version}}
    dr81a756gaa6  cockroachdb-2  replicated  1/1       cockroachdb/cockroach:{{page.release_info.version}}
    il4m7op1afg9  cockroachdb-3  replicated  1/1       cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

    {{site.data.alerts.callout_success}}The service definitions tell the CockroachDB nodes to log to <code>stderr</code>, so if you ever need access to a node's logs for troubleshooting, use <a href="https://docs.docker.com/engine/reference/commandline/logs/"><code>sudo docker logs &lt;container id&gt;</code></a> from the instance on which the container is running.{{site.data.alerts.end}}

3. Now all the CockroachDB nodes are running, but we still have to explicitly tell them to initialize a new cluster together. To do so, use the `sudo docker run` command to run the `cockroach init` command against one of the nodes. The `cockroach init` command will initialize the cluster, bringing it into a usable state.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker run -it --rm --network cockroachdb --mount type=bind,source="$(pwd)/certs",target=/cockroach/certs,readonly cockroachdb/cockroach:{{page.release_info.version}} init --host=cockroachdb-1 --certs-dir=certs
    ~~~

    We mount the `certs` directory as a volume inside the container because it contains the `root` user's client certificate and key, which we need to talk to the cluster.

## Step 7. Use the built-in SQL client

1. Use the `sudo docker run` command to start a new container attached to the CockroachDB network, run the built-in SQL shell, and connect it to the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker run -it --rm --network cockroachdb --mount type=bind,source="$(pwd)/certs",target=/cockroach/certs,readonly cockroachdb/cockroach:{{page.release_info.version}} sql --host=cockroachdb-1 --certs-dir=certs
    ~~~

2. Create a `securenodetest` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE securenodetest;
    ~~~

3. [Create a user with a password](create-user.html#create-a-user-with-a-password).

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

  You will need this username and password to access the DB Console in Step 8.

4. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 8. Monitor the cluster

To access your cluster's DB Console:

1. Open a browser and go to `https://<any node's external IP address>:8080`.
{{site.data.alerts.callout_info}}It's possible to access the DB Console from outside of the swarm because you published port <code>8080</code> externally in the first node's service definition. However, your browser will consider the CockroachDB-created certificate invalid, so you’ll need to click through a warning message to get to the UI.{{site.data.alerts.end}}

2. On accessing the DB Console, you will see a Login screen, where you will need to enter your username and password created in Step 7.

3. On the DB Console, verify that the cluster is running as expected:

  1. View **Node List** to ensure that all of your nodes successfully joined the cluster.

  2. Click the **Databases** tab on the left to verify that `securenodetest` is listed.

## Step 9. Simulate node failure

Since we have three service definitions, one for each node, Docker Swarm will ensure that there are three nodes running at all times. If a node fails, Docker Swarm will automatically create another node with the same network identity and storage.

To see this in action:

1. On any instance, use the `sudo docker ps` command to get the ID of the container running the CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker ps | grep cockroachdb
    ~~~

    ~~~
    32769a6dd664        cockroachdb/cockroach:{{page.release_info.version}}   "/cockroach/cockroach"   10 minutes ago        Up 10 minutes         8080/tcp, 26257/tcp   cockroachdb-2.1.0wigdh8lx0ylhuzm4on9bbldq
    ~~~

2. Use `sudo docker kill` to remove the container, which implicitly terminates the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker kill <container ID>
    ~~~

3. Verify that the node was restarted in a new container:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker ps | grep cockroachdb
    ~~~

    ~~~
    4a58f86e3ced        cockroachdb/cockroach:{{page.release_info.version}}   "/cockroach/cockroach"   7 seconds ago       Up 1 seconds        8080/tcp, 26257/tcp   cockroachdb-2.1.cph86kmhhcp8xzq6a1nxtk9ng
    ~~~

4. Back in the DB Console, view **Node List** and verify that all 3 nodes are live.

## Step 10. Scale the cluster

To increase the number of nodes in your CockroachDB cluster:

1. Create an additional instance (see [Step 1](#step-1-create-instances)).
2. Install Docker Engine on the instance (see [Step 2](#step-2-install-docker-engine)).
3. Join the instance to the swarm as a worker node (see [Step 3.2](#step-3-start-the-swarm)).
4. Create security resources for the node (see [Step 5.7 and 5.8](#step-5-create-security-resources)).
5. Create a new service to start another node and join it to the CockroachDB cluster (see [Step 6.1](#step-6-start-the-cockroachdb-cluster)).

## Step 11. Stop the cluster

To stop the CockroachDB cluster, on the instance running your manager node, remove the services:

{% include copy-clipboard.html %}
~~~ shell
$ sudo docker service rm cockroachdb-1 cockroachdb-2 cockroachdb-3
~~~

~~~
cockroachdb-1
cockroachdb-2
cockroachdb-3
~~~

You may want to remove the persistent volumes and secrets used by the services as well. To do this, on each instance:

{% include copy-clipboard.html %}
~~~ shell
# Identify the name of the local volume:
$ sudo docker volume ls
~~~

~~~
cockroachdb-1
~~~

{% include copy-clipboard.html %}
~~~ shell
# Remove the local volume:
$ sudo docker volume rm cockroachdb-1
~~~

{% include copy-clipboard.html %}
~~~ shell
# Identify the name of secrets:
$ sudo docker secrets ls
~~~

~~~
ca-crt
cockroachdb-1-crt
cockroachdb-1-key
~~~

{% include copy-clipboard.html %}
~~~ shell
# Remove the secrets:
$ sudo docker secret rm ca-crt cockroachdb-1-crt cockroachdb-1-key
~~~

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
