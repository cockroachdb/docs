---
title: Configure SQL Authentication for Hardened Serverless Cluster Security
summary: 
toc: true
docs_area: reference.security
---

## Introduction: Why customize your authentication configuration?

CockroachDB allows fine grained configuration of which attempts to connect with the database it will allow to proceed to the authentication stage, and which authentication methods it will accept, based on:

- WHO is making the attempt (SQL user), and 
- WHERE on the internet (IP Address) the attempt is coming from.

Using Cockroach Labs' hosted CockroachDB offerings, whether Serverless or Dedicated, affords industry standard security controls at the network and infrastructure levels, and savvy users can self-deploy CockroachDB with any measure of network security they might desire. Nevertheless, a hardened authentication configuration offers a powerful measure of [security in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)). 

Moreover, because the only authentication method currently available for CockroachDB hosted products is username/password (which is the weakest authentication method in terms of security), limiting allowed database connections to secure IP addresses (those belonging to your application servers and a) can considerably reduce the risk that your cluster is compromised by a malicious actor.

An endpoint that is both a) open to the public internet and b) protected with a simple username/password combination is vulnerable to brute force password cracking. Furthermore, there are many ways to inadvertently (or advertently) leak a simple username/password combination (for example typing it on a keyboard in a public place where a camera is recording).

CockroachDB (like most databases) does not natively perform rate limiting on authentication requests, which makes brute force password cracking possible, and also makes public endpoints a possible target for denial of service (DOS) attacks.

Together, these factors leave data in CockroachDB Serverless clusters vulnerable to concerted efforts by dedicated attackers to gain access by obtaining these credentials, and afford a vector for DOS attacks. Both of these problems can be ameliorated in a single stroke by setting a hardened authentication configuration that limits authentication attempts to the IP addresses of a secure jumpbox and your application servers. 

## Provision and access your cluster

First, to follow along, [create your own free CockroachDB Serverless cluster](../cockroachcloud/create-a-serverless-cluster.html) and obtain the cockroach CLI command to connection parameters from the <b>Connection Info</b> pane. Save the connection comand in a file called roach_sql.sh, and run `chmod +x roach_sql.sh` to make it executable.

Now you can run `./roach_sql.sh` to connect to your database.

```
:) ./roach_sql.sh
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
# Client version: CockroachDB CCL v21.2.4 (x86_64-apple-darwin19, built 2022/01/10 18:53:16, go1.16.6)
# Server version: CockroachDB CCL v21.2.4-1-g70835279ac (x86_64-unknown-linux-gnu, built 2022/02/03 22:31:25, go1.16.6)

warning: server version older than client! proceed with caution; some features may not be available.

# Cluster ID: 2b8401dd-b4cc-4266-a6d6-ce8ff841ded3
#
# Enter \? for a brief introduction.
#
docs-r-awesome@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb>
```

## Provision a secure jumpbox


By default, anyone who knows the parameters in this command can access your database. Let's fix that by creating a secure jumpbox--a compute instance in Google Cloud and restricting access to your cluster to that jumpbox.

This will be far more secure because access to the jumpbox can be protected using Google Cloud's native capacity to require two-factor authentication for SSH access to compute instance. By limiting SQL access to those actors who have access to the jumpbox, we can effectively two factor authentication for access, as well as take advantage of other security measures availabe on Google Cloud compute instances, such as access logs.

In the [Google Cloud Console Compute Instances](https://console.cloud.google.com/compute/instance) page, create a new instance called `roach-jump-box`. The jumpbox will need very little CPU or disk, so use a cheap instance such as an e2-micro.

In the [Google Cloud Console VPC Network / External IP addresses page](https://console.cloud.google.com/networking/addresses), reserve a static IP. Name it `roach-jump-box`, and attach it to the compute instance.

Keep the IP address handy!

## Tighten the Authentication Configuration

Next, we'll configure our cluster to only allow SQL connection attempts from our jumpbox. This means that in order to acces the cluster, someone will need not only the username and password (which could be guessed or stolen), but will also need access to the jumpbox. Manage permissions to access the jumpbox using Google Cloud's IAM, and make sure that users in your Google Cloud organization are required to use two factor authentication.


Returning to the SQL console, let's set our authentication configuration to limit access to the jumpbox. This configuration accessed as a Cluster Setting.


run `show cluster setting server.host_based_authentication.configuration;` to view your current authentication configuration, which should be in its default state, which displays as empty:

```
cockroachlabs.cloud:26257/defaultdb> show cluster setting server.host_based_authentication.configuration;
  server.host_based_authentication.configuration

(1 row)


Time: 48ms total (execution 1ms / network 48ms)
```


Set the authentication configuration to the following value, which limits access to the jumpbox. Replace the IP address with your jumpbox's IP address:

```
set cluster setting server.host_based_authentication.configuration to '
# TYPE  DATABASE  USER   ADDRESS            METHOD
host    all       all    35.184.229.244/32  password
host    all       all    all                reject
';

```

## Confirm the IP resctriction

Exit the database shell by typing `\q`, and then try to re-establish the connection. This time the attempt will be rejected because we are not making the attempt from the sole allowed IP address.

```
> cockroach sql --url "postgresql://$USER:$PASSWORD@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dwest-hoatzin-337&sslrootcert=root.crt"

#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
ERROR: authentication rejected by configuration
SQLSTATE: 28000
Failed running "sql"
```

## Access your cluster via the jumpbox

Finally, ssh into the jumpbox and attempt the connection from there:

```shell
> gcloud compute ssh roach-jump-box

Linux roach-jump-box 4.19.0-18-cloud-amd64 #1 SMP Debian 4.19.208-1 (2021-09-29) x86_64

docs-writer@roach-jump-box:~$ cockroach sql --url "postgresql://$USER:$PASSWORD@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dwest-hoatzin-337&sslrootcert=root.crt"
#
# Welcome to the CockroachDB SQL shell.

```

## Allow IP addresses for applications

Of course, it's likely that an application will also need access the database, in which case, you could add a new rule to allow an IP address to your configuration. You will then need to route the outgoing traffic from your applications through a specific IP. The preferred way is to use a [NAT gateway](https://cloud.google.com/nat/docs/overview), but a quick, lightweight solution is to attach an external IP to a compute instance with acts as a simple proxy. However, in this latter case the proxy as a bottleneck and single point of failure, so this is not suitable for high traffic or uptime-critical services.


Further, we can fine tune our configuration and improve the overall security and resilience of our system by restricting access from the given IP to the appropriate user. 

Each user's permissions should then be precisely configured using CockroachDB's system of [access grants](authorization.html). Always keep in mind the [principle of least privelege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), which is one of the golden rules of security!

```
> set cluster setting server.host_based_authentication.configuration to '
# TYPE  DATABASE  USER        ADDRESS             METHOD
host    all       ops_user    555.123.456.789/32  password
host    all       app_user    555.987.654.321/32  password
host    all       all         all                 reject
';

```

