---
title: Catch Up&#58; 3-Node, Local, Secure Cluster
summary: Get a 3-node, local, secure CockroachDB cluster up and running quickly with a load generator.
toc: false
sidebar_data: sidebar-data-training.json
---

If you missed a training session and need to set up a secure CockroachDB cluster, this guide shows you how to set up a CockroachDB cluster:

- With 3 nodes
- Locally
- With SSL encryption

## 1. Install CockroachDB

Check out our install page to get the `cockroach` binary on your machine.

## 2. Generate Certificate Files

We're going to generate:

- A certificate authority (CA) to sign all certificates
- One node certificate per CockroachDB node
- One client cert per client

### Preparation

Create directories for your certificates (`certs`) and CA (`my-safe-directory`):

{% include copy-clipboard.html %}
~~~ shell
$ mkdir certs my-safe-directory
~~~

If this were a production environment, you would also want to secure `my-safe-directory` to ensure your CA was secure.

### Certificate Authority

Create your CA:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-ca \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

### Node Certificate

Because we're using a local deployment and all nodes use the same hostname (`localhost`), we only need to generate a single node certificate. Note that this is different than how you would normally deploy certificates in a production environment.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-node \
localhost \
$(hostname) \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

### Client Certificates

Create client certificates for both the `root` and `itsme` users.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client \
root \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client \
itsme \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

## 3. Restart Our Cluster as Secure

With all of our certificates in place, we can now start our cluster securely.

1. Start all 3 nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --host=localhost \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

2. Initialize the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs
    ~~~

    {{site.data.alerts.callout_info}}You only need to initialize the cluster once. If you scale the cluster in the future, the nodes will start operating as soon as they successfully communicate with a node specified in its <code>--join</code> flag.{{site.data.alerts.end}}

## 4. Access the Cluster Securely

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--user=itsme
--certs-dir=certs
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~
