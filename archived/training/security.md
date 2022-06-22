---
title: Secure Your Cluster
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false

---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSozBu9RIF-1V73oPtK-HTJpdtG3euC4oS8aR2Ze0AmIkBcTr1pKjblJ9Q6TJBLbREEX8wmcRkzrLeq/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>


<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous lab.

## Step 1. Generate security certificates

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

2. Create the CA certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Create the certificate and key for the your nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    Because you're running a local cluster and all nodes use the same hostname (`localhost`), you only need a single node certificate. Note that this is different than running a production cluster, where you would need to generate a certificate and key for each node, issued to all common names and IP addresses you might use to refer to the node as well as to any load balancer instances.

4. Create client certificates and keys for the `root` and `spock` users:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    spock \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

## Step 2. Start a secure cluster

Restart the nodes using the same commands you used to start them initially, but this time use the `--certs-dir` flag to point to the node certificate, and leave out the `--insecure` flag.

1. Start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs --host=localhost:26257
    ~~~

## Step 3. Add data to your cluster

1. Use the `cockroach gen` command to generate an example `startrek` database with 2 tables, `episodes` and `quotes`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen example-data startrek | cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257
    ~~~

2. Create a new user called `spock` and grant `spock` the `SELECT` privilege on the `startrek.quotes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --execute="CREATE USER spock; GRANT SELECT ON TABLE startrek.quotes TO spock;"
    ~~~

## Step 4. Authenticate a user (via client cert)

1. As the `spock` user, read from the `startrek.quotes` table, using the `--certs-dir` to point to the user's client cert:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --user=spock \
    --database=startrek \
    --execute="SELECT * FROM quotes WHERE quote ~* 'creature';"
    ~~~

    ~~~
                                 quote                            | characters | stardate | episode
    +-------------------------------------------------------------+------------+----------+---------+
      There is a multi-legged creature crawling on your shoulder. | Spock      |   3193.9 |      23
    (1 row)
    ~~~

## Step 5. Authenticate a user (via password)

Although we recommend always using TLS certificates to authenticate users, it's possible to authenticate a user with just a password.

{{site.data.alerts.callout_info}}
For multiple users to access the Admin UI, the `root` user must [create users with passwords](../create-user.html#create-a-user-with-a-password).
{{site.data.alerts.end}}

1. As the `root` user, open the built-in SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257
    ~~~

2. Create a new `kirk` user with the password `enterprise`. You'll have to type in the password twice at the prompt:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER kirk WITH PASSWORD 'enterprise';
    ~~~

3. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

4. As the `root` user, grant `kirk` the `SELECT` privilege on the tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --user=root \
    --execute="GRANT SELECT ON startrek.* TO kirk;"
    ~~~

5. As the `kirk` user, read from the `startrek.quotes` table:

    {{site.data.alerts.callout_info}}
    It's necessary to include the `--certs-dir` flag even though you haven't created a cert for this user. When the cluster does not find a suitable client cert, it falls back on password authentication.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
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
                       quote                   |  characters   | stardate | episode
    +------------------------------------------+---------------+----------+---------+
      Insufficient facts always invite danger. | Spock         |   3141.9 |      22
      Power is danger.                         | The Centurion |   1709.2 |      14
    (2 rows)
    ~~~

## Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 my-safe-directory certs
    ~~~

## What's next?

[Production Deployment](production-deployment.html)
