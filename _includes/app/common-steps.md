## Step 2. Start a cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

~~~ shell
# Start node 1:
$ cockroach start --background \
--store=hello-1
~~~

But as you might've seen in the [Start a Local Cluster](start-a-local-cluster.html) tutorial, it's incredibly easy to start and join addition nodes, if you want to simulate a real cluster:

~~~ shell
# Start node 2:
$ cockroach start --background \
--store=hello-2 \
--port=26258 \
--http-port=8081 \
--join=localhost:26257

# Start node 3:
$ cockroach start --background \
--store=hello-3 \
--port=26259 \
--http-port=8082 \
--join=localhost:26257
~~~

## Step 3. Create a user

As the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

~~~ shell
$ cockroach user set maxroach
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

~~~ shell
$ cockroach sql -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user

~~~ shell
$ cockroach sql -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~