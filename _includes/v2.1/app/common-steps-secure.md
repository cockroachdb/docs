## Step 2. Start a cluster

Before we can run code, we need to start a cluster.  Follow the steps below to start a secure local cluster with 3 nodes.

1. Create a CA (certificate authority) that will be used to sign all of your other certificates.

    {% include copy-clipboard.html %}
    ~~~ sh
    $ mkdir certs
    $ cockroach cert create-ca --certs-dir=certs --ca-key=certs/ca.key
    ~~~

2. Create a certificate and key for each node in the cluster.  Since we are running a local cluster, we will re-use the same certificate and key for each node.

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach cert create-node localhost --certs-dir=certs --ca-key=certs/ca.key --overwrite
    ~~~

3. Create the certificate and key for the `root` user.

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach cert create-client root --certs-dir=certs --ca-key=certs/ca.key
    ~~~

4. Create the certificate and key for the `maxroach` user.  The code sample will run as this user.

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach cert create-client maxroach --certs-dir=certs --ca-key=certs/ca.key
    ~~~

5. Start the nodes that will make up the local cluster by running the following commands, each in a separate terminal.

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach start --certs-dir=certs --store=/tmp/node0 --host=localhost --port=26257 --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach start --certs-dir=certs --store=/tmp/node1 --host=localhost --port=26258 --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach start --certs-dir=certs --store=/tmp/node2 --host=localhost --port=26259 --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

6. To finish cluster startup, initialize the cluster with the following command.

    {% include copy-clipboard.html %}
    ~~~ sh
    $ cockroach init --certs-dir=certs --host=localhost --port=26257
    ~~~

For more information about security certificates, see [Create Security Certificates](create-security-certificates.html).

For more details about cluster startup, see [Start a Local Cluster (Secure)](secure-a-cluster.html).

## Step 3. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e "CREATE USER IF NOT EXISTS maxroach"
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~
