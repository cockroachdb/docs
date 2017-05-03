## Step 2. Start a cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

~~~ shell
# Start node 1:
$ cockroach start --insecure \
--store=hello-1 \
--host=localhost \
--background
~~~

But as you might've seen in the [Start a Local Cluster](start-a-local-cluster.html) tutorial, it's incredibly easy to start and join addition nodes, if you want to simulate a real cluster:

~~~ shell
# Start node 2:
$ cockroach start --insecure \
--store=hello-2 \
--host=localhost \
--port=26258 \
--http-port=8081 \
--join=localhost:26257 \
--background

# Start node 3:
$ cockroach start --insecure \
--store=hello-3 \
--host=localhost \
--port=26259 \
--http-port=8082 \
--join=localhost:26257 \
--background
~~~

## Step 3. Create a user

As the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

~~~ shell
$ cockroach user set maxroach --insecure --host=localhost
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

~~~ shell
$ cockroach sql --insecure --host=localhost -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user

~~~ shell
$ cockroach sql --insecure --host=localhost -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~
