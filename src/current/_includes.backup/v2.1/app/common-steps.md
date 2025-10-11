## Step 2. Start a single-node cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=hello-1 \
--listen-addr=localhost
~~~

## Step 3. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user set maxroach --insecure
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~
