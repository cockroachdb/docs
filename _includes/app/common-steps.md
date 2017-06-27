## Step 2. Start a cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--store=hello-1 \
--host=localhost
~~~

But as you might've seen in the [Start a Local Cluster](start-a-local-cluster.html) tutorial, it's incredibly easy to start and join addition nodes, if you want to simulate a real cluster.

In a new terminal, start node 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--store=hello-2 \
--host=localhost \
--port=26258 \
--http-port=8081 \
--join=localhost:26257
~~~

In a new terminal, start node 3:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure \
--store=hello-3 \
--host=localhost \
--port=26259 \
--http-port=8082 \
--join=localhost:26257
~~~

## Step 3. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach user set maxroach --insecure
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~
