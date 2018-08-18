---
title: Secure Your Cluster
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
redirect_from: /training/security.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSozBu9RIF-1V73oPtK-HTJpdtG3euC4oS8aR2Ze0AmIkBcTr1pKjblJ9Q6TJBLbREEX8wmcRkzrLeq/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>


<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

Make sure you have already completed [Users and Privileges](users-and-privileges.html) and have 3 insecure nodes running locally.

## Step 1. Stop the cluster

To convert an insecure cluster to a secure cluster, you must shut down all nodes:

{% include copy-clipboard.html %}
~~~ shell
$ pkill -9 cockroach
~~~

This simplified shutdown process is only appropriate for a lab/evaluation scenario. In a production environment, you would use `cockroach quit` to gracefully shut down each node.

## Step 2. Generate security certificates

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

2. Create the CA certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Create the certificate and key for the your nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    Because you're running a local cluster and all nodes use the same hostname (`localhost`), you only need a single node certificate. Note that this is different than running a production cluster, where you would need to generate a certificate and key for each node, issued to all common names and IP addresses you might use to refer to the node as well as to any load balancer instances.

4. Create client certificates and keys for the `root` and `spock` users:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach cert create-client \
    spock \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

## Step 3. Restart the cluster as secure

Restart the nodes using the same commands you used to start them initially, but this time use the `--certs-dir` flag to point to the node certificate, and leave out the `--insecure` flag.

1. Start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

{{site.data.alerts.callout_info}}There's no need to run <code>cockroach init</code> again since the cluster was initialized earlier. However, the cluster will restart only after a majority of nodes are back online (2/3).{{site.data.alerts.end}}

## Step 4. Authenticate a user (via client cert)

1. As the `spock` user, read from the `startrek.quotes` table, using the `--certs-dir` to point to the user's client cert:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --certs-dir=certs \
    --user=spock \
    --database=startrek \
    --execute="SELECT * FROM quotes WHERE quote ~* 'creature';"
    ~~~

    ~~~
    +-------------------------------------------------------------+------------+----------+---------+
    |                            quote                            | characters | stardate | episode |
    +-------------------------------------------------------------+------------+----------+---------+
    | There is a multi-legged creature crawling on your shoulder. | Spock      |   3193.9 |      23 |
    +-------------------------------------------------------------+------------+----------+---------+
    (1 row)
    ~~~

## Step 5. Authenticate a user (via password)

Although we recommend always using TLS certificates to authenticate users, it's possible to authenticate a user with just a password.

{{site.data.alerts.callout_info}}
For multiple users to access the Admin UI, the `root` user must create users with passwords.
{{site.data.alerts.end}}

1. As the `root` user, create a new `kirk` user with the password `enterprise`. You'll have to type in the password twice at the prompt:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach user set kirk \
    --certs-dir=certs \
    --password
    ~~~

2. As the `root` user, grant `kirk` the `SELECT` privilege on the tables in the `startrek` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --certs-dir=certs \
    --user=root \
    --execute="GRANT SELECT ON startrek.* TO kirk;"
    ~~~

3. As the `kirk` user, read from the `startrek.quotes` table:

    {{site.data.alerts.callout_info}}It's necessary to include the <code>--certs-dir</code> flag even though you haven't created a cert for this user. When the cluster does not find a suitable client cert, it falls back on password authentication.{{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --certs-dir=certs \
    --user=kirk \
    --database=startrek \
    --execute="SELECT * FROM quotes WHERE quote ~* 'danger';"
    ~~~

    Enter `enterprise` as the password:

    ~~~
    Enter password:
    ~~~

    You'll then see the response:

    ~~~
    +------------------------------------------+---------------+----------+---------+
    |                  quote                   |  characters   | stardate | episode |
    +------------------------------------------+---------------+----------+---------+
    | Insufficient facts always invite danger. | Spock         |   3141.9 |      22 |
    | Power is danger.                         | The Centurion |   1709.2 |      14 |
    +------------------------------------------+---------------+----------+---------+
    (2 rows)
    ~~~

## Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 my-safe-directory certs
    ~~~
## What's next?

[Production Deployment](production-deployment.html)
