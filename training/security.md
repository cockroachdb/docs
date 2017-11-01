---
title: Secure Your Cluster
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSozBu9RIF-1V73oPtK-HTJpdtG3euC4oS8aR2Ze0AmIkBcTr1pKjblJ9Q6TJBLbREEX8wmcRkzrLeq/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### URL for comments

[Secure Your Cluster](https://docs.google.com/presentation/d/1RqiRikOPMHdtynASNdl20Vfxxd764vuNFRaxCVeXLB4/)

## Lab

Up to this point, we've been using an insecure local cluster. However, when using CockroachDB on remote servers, it's necessary to secure your deployment––when CockroachDB runs in insecure mode, it's _really_ insecure.

In this lab, we'll show you how to secure your cluster.

### Before You Begin

To complete this lab, you need to have the [`cockroach` binary installed](/stable/install-cockroachdb.html).

We also assume you have a local, insecure 3-node cluster running. If you don't, you can skip the **Tear down existing cluster** section of this lab.

### Overview

1. Tear down existing cluster.
2. Generate certificate files.
3. Restart cluster with SSL encryption.
4. Connect to the cluster using encryption.

### Step 1. Tear Down Cluster

You can do this elegantly by using `cockroach quit` on each node, but we're going to close down everything in one fell swoop:

{% include copy-clipboard.html %}
~~~ shell
$ pkill -9 cockroach
~~~

### Step 2. Generate Certificate Files

We're going to generate:

- A certificate authority (CA) to sign all certificates
- One node certificate per CockroachDB node
- One client cert per client

#### Certificate Authority

{% include copy-clipboard.html %}
~~~ shell
$ mkdir certs
~~~

{% include copy-clipboard.html %}
~~~ shell
$ mkdir my-safe-directory
~~~

Now, create the key pair:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-ca \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

#### Node Certificate

Because we're using a local deployment and all nodes use the same hostname (`localhost`), we only need to generate a single node certificate. Note that this is different than how you would normally deploy certificates in a production environment.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-node \
localhost \
$(hostname) \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

#### Client Certificates

We'll create client certificates for both the `root` and `itsme` users.

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

### Step 3. Restart Our Cluster as Secure

With all of our certificates in place, we can now start our cluster securely.

Restart all 3 nodes, but with the `--certs` flag:
    
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

### Step 4. Access the Cluster Securely

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--user=itsme \
--certs-dir=certs
~~~

{{site.data.alerts.callout_info}}If you haven't created the <code>itsme</code> user yet, you can with:<br/><code>cockroach user set itsme --certs-dir=certs</code>{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

## Up Next

- [Production Deployments](production-deployments.html)
