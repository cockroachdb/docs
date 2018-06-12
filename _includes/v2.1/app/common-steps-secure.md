## Step 2. Start a cluster

Before we can run code, we need to start a CockroachDB cluster.

For this example, we'll start a secure local cluster with 3 nodes.

First, [create the certificates](create-security-certificates.html), including for the user `maxroach` who will be connecting to the database:

{% include copy-clipboard.html %}
~~~ sh
$ cockroach cert create-ca --certs-dir=/tmp/certs--certs-dir=/tmp/certs --ca-key=/tmp/certs/ca.key
~~~

{% include copy-clipboard.html %}
~~~ sh
$ cockroach cert create-node localhost --certs-dir=/tmp/certs --ca-key=/tmp/certs/ca.key --overwrite
~~~

{% include copy-clipboard.html %}
~~~ sh
$ cockroach cert create-client root --certs-dir=/tmp/certs --ca-key=/tmp/certs/ca.key
~~~

{% include copy-clipboard.html %}
~~~ sh
$ cockroach cert create-client maxroach --certs-dir=/tmp/certs --ca-key=/tmp/certs/ca.key
~~~

Next, [start the local cluster](secure-a-cluster.html):

{% include copy-clipboard.html %}
~~~ sh
$ cockroach start --certs-dir=/tmp/certs --store=/tmp/node0 --host=localhost --port=26257 --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259
~~~

{% include copy-clipboard.html %}
~~~ sh
$ cockroach start --certs-dir=/tmp/certs --store=/tmp/node1 --host=localhost --port=26258 --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259
~~~

{% include copy-clipboard.html %}
~~~ sh
$ cockroach start --certs-dir=/tmp/certs --store=/tmp/node2 --host=localhost --port=26259 --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259
~~~

{% include copy-clipboard.html %}
~~~ sh
$ cockroach init --certs-dir=/tmp/certs --host=localhost --port=26257
~~~

## Step 3. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e "CREATE USER IF NOT EXISTS maxroach"
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~
