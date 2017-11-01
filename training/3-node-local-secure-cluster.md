---
title: Catch Up&#58; 3-Node, Local, Secure Cluster
summary: Get a 3-node, local, secure CockroachDB cluster up and running quickly with a load generator.
toc: false
sidebar_data: sidebar-data-training.json
---

If you weren't in the training for the session where we set this, this guide shows you how to set up a CockroachDB cluster:

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

### Certificate Authority

~~~ shell
$ mkdir certs

$ mkdir my-safe-directory
~~~

We want to ensure `my-safe-directory`, which will ultimately contain your CA key, is secure, so we should also modify its permissions:

~~~
chown my-safe-directory
~~~

Now, create the key pair:

~~~ shell
cockroach cert create-ca \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

### Node Certificate

Because we're using a local deployment and all nodes use the same hostname (`localhost`), we only need to generate a single node certificate. Note that this is different than how you would normally deploy certificates in a production environment.

~~~ shell
$ cockroach cert create-node \
localhost \
$(hostname) \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

### Client Certificates

We'll create client certificates for both the `root` and `itsme` users.

~~~ shell
$ cockroach cert create-client \
root \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

~~~
$ cockroach cert create-client \
itsme \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

## 3. Restart Our Cluster as Secure

With all of our certificates in place, we can now start our cluster securely.

1. Start all 3 nodes:
    
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --host=localhost \
    --http-host=localhost \
    --join=localhost:26257, localhost:26258, localhost:26259
    ~~~
    
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --http-host=localhost \
    --join=localhost:26257, localhost:26258, localhost:26259
    ~~~
    
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --http-host=localhost \
    --join=localhost:26257, localhost:26258, localhost:26259
    ~~~
    
2. Initialize the cluster:

    ~~~
    $ cockroach init --certs-dir=certs
    ~~~

## 4. Access the Cluster Securely

~~~ shell
$ cockroach sql \
--user=itsme
--certs-dir=certs
~~~

~~~ sql
> SHOW DATABASES;
~~~
