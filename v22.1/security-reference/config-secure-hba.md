---
title: Configure SQL Authentication for Hardened Serverless Cluster Security
summary: Configure SQL Authentication for Hardened Serverless Cluster Security
toc: true
docs_area: manage.security
---

CockroachDB allows fine-grained configuration of which database connect attempts it allows to proceed to the authentication stage, and which authentication methods it will accept, based on:

- **Who** is making the attempt (SQL user).
- **Where** on the internet (IP Address) the attempt is coming from.

This document describes the rationale for restricting database access to specific IP ranges as a security measure, and then describes the procedure using [authentication configuration](authentication.html) to achieve that aim.

## Why customize your authentication configuration?

{{ site.data.products.serverless-plan }} and {{ site.data.products.dedicated }} both include industry-standard security controls at the network and infrastructure levels, and {{ site.data.products.core }} may be deployed with any measure of network security one cares to put in place. Nevertheless, a hardened authentication configuration offers a powerful measure of [security in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)).

Limiting allowed database connections to secure IP addresses reduces the risk that your cluster is compromised, because a potential attacker who acquires database credentials (e.g., username/password combinations or client TLS certificates) cannot use those credentials without also gaining infrastructure access. Infrastructure access can and should be protected with multifactor authentication and restricted to appropriate parties using infrastructure-level IAM.

## Step 1: Provision and access your cluster

[Create your own free CockroachDB Serverless cluster](../../cockroachcloud/create-a-serverless-cluster.html).

From the {{ site.data.products.serverless }} Cloud Console, select your new cluster and click the **Connect** button to obtain your connection credentials from the **Connection Info** pane in the CockroachDB Cloud Console.

You'll also need to download the cluster's root TLS certificate, so that your client can authenticate the database server as it connects.

Open a SQL shell against your cluster.

```shell
cockroach sql --url "postgresql://$USER:$PASSWORD@free-tier123.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Drandom-cluster-name-123&sslrootcert=root.crt"
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.

...

docs-r-awesome@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb>
```

## Step 2: Provision a secure jumpbox

By default, anyone who knows the parameters in this command can access your database. Let's fix that by creating a **jumpbox**: a compute instance that will be used as secure, dedicated access point to our cluster. In this example, the jumpbox will be a Google Cloud compute instance (although you could as easily use an AWS EC2 instance) which allows us to protect access to the jumpbox with Google Cloud's native capacities to require two-factor authentication for SSH access to compute instances, and to limit that SSH access to precisely those users that require it. By limiting SQL access to those actors who have SSH access to the jumpbox, we can effectively enforce two-factor authentication for access to the database, as well as take advantage of other security measures availabe on Google Cloud compute instances, such as access logs.

In the [Google Cloud Console Compute Instances](https://console.cloud.google.com/compute/instance) page, create a new instance called `roach-jump-box`. The jumpbox will need very little CPU or disk, so use a cheap instance such as an `e2-micro`.

In the [Google Cloud Console VPC Network / External IP addresses page](https://console.cloud.google.com/networking/addresses), reserve a static IP. Name it `roach-jump-box`, and attach it to the compute instance.

Keep the IP address handy!

## Step 3: Tighten the authentication configuration

Next, we'll configure our cluster to only allow SQL connection attempts from our jumpbox. This means that in order to acces the cluster, someone will need not only the username and password (which could be guessed or stolen), but will also need access to the jumpbox. Manage permissions to access the jumpbox using Google Cloud's IAM, and make sure that users in your Google Cloud organization are required to use two-factor authentication.

Returning to the SQL console, let's set our authentication configuration to limit access to the jumpbox. This configuration is accessed as a [cluster setting](../cluster-settings.html).


Run `SHOW CLUSTER SETTING server.host_based_authentication.configuration;` to view your current authentication configuration, which should be in its default state, which displays as empty:

```shell
cockroachlabs.cloud:26257/defaultdb> show cluster setting server.host_based_authentication.configuration;
  server.host_based_authentication.configuration

(1 row)


Time: 48ms total (execution 1ms / network 48ms)
```

Set the authentication configuration to the following value, which limits access to the jumpbox. Replace the IP address with your jumpbox's IP address:

```shell
SET CLUSTER SETTING server.host_based_authentication.configuration TO '
# TYPE    DATABASE  USER   ADDRESS            METHOD
  host    all       all    35.184.229.244/32  password
  host    all       all    all                reject
';

```

## Step 4: Confirm the IP restriction

Exit the database shell by typing `\q`, and then try to re-establish the connection. This time the attempt will be rejected because we are not making the attempt from the sole allowed IP address.

```shell
 cockroach sql --url "postgresql://$USER:$PASSWORD@free-tier123.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Drandom-cluster-name-123&sslrootcert=root.crt"

#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
ERROR: authentication rejected by configuration
SQLSTATE: 28000
Failed running "sql"
```

## Step 5: Access your cluster via the jumpbox

Finally, let's attempt the connection from the jumpbox. You'll need to use `scp` to transfer the cluster's root TLS certificate to the jumpbox, so that your client there can use it to authenticate the server. Then shell into the jumpbox with the `gcloud gcompute ssh` and run your connection command from inside the jumpbox.

```shell
gcloud compute scp root.crt roach-jump-box:root.crt
gcloud compute ssh roach-jump-box

docs-writer@roach-jump-box:~$ cockroach sql --url "postgresql://$USER:$PASSWORD@free-tier123.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Drandom-cluster-name-123&sslrootcert=root.crt"
#
# Welcome to the CockroachDB SQL shell.
...
```

## Step 6: Allow IP addresses for applications

Of course, it's likely that an application will also need to access the database, in which case, you could add a new rule to allow an IP address to your configuration. You will then need to route the outgoing traffic from your applications through a specific IP. The preferred way is to use a [NAT gateway](https://cloud.google.com/nat/docs/overview), but a quick, lightweight solution is to attach an external IP to a compute instance with acts as a proxy. However, in this latter case the proxy as a bottleneck and single point of failure, so this is not suitable for high traffic or uptime-critical services.

Further, we can fine-tune our configuration and improve the overall security and resilience of our system by restricting access from the given IP to the appropriate user.

Each user's permissions should then be precisely configured using CockroachDB's system of [access grants](authorization.html). Always keep in mind the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), which is one of the golden rules of security!

```shell
SET CLUSTER SETTING server.host_based_authentication.configuration TO '
# TYPE    DATABASE  USER        ADDRESS             METHOD
  host    all       ops_user    555.123.456.789/32  password
  host    all       app_user    555.987.654.321/32  password
  host    all       all         all                 reject
';

```
