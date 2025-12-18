In this example, you'll set up a basic changefeed for a single-node cluster.

1. In a terminal window, start `cockroach`:

    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --listen-addr=localhost \
    --background
    ~~~

1. As the `root` user, open the [built-in SQL client]({% link "{{ page.version.version }}/cockroach-sql.md" %}):

    ~~~ shell
    $ cockroach sql \
    --url="postgresql://root@127.0.0.1:26257?sslmode=disable" \
    --format=csv
    ~~~

    {% dynamic_include page.version.version, "/cdc/core-url.md" %}

    {% dynamic_include page.version.version, "/cdc/core-csv.md" %}

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link "{{ page.version.version }}/cluster-settings.md" %}):

    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Create table `foo`:

    ~~~ sql
    > CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~

1. Insert a row into the table:

    ~~~ sql
    > INSERT INTO foo VALUES (0);
    ~~~

1. Start the basic changefeed:

    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR foo;
    ~~~
    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    ~~~

1. In a new terminal, add another row:

    ~~~ shell
    $ cockroach sql --insecure -e "INSERT INTO foo VALUES (1)"
    ~~~

1. Back in the terminal where the basic changefeed is streaming, the following output has appeared:

    ~~~
    foo,[1],"{""after"": {""a"": 1}}"
    ~~~

    Note that records may take a couple of seconds to display in the basic changefeed.

1. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.

1. To stop `cockroach`:

    Get the process ID of the node:

    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 21766     1   0  6:21PM ttys001    0:00.89 cockroach start-single-node --insecure --listen-addr=localhost
    ~~~

    Gracefully shut down the node, specifying its process ID:

    ~~~ shell
    kill -TERM 21766
    ~~~

    ~~~
    initiating graceful shutdown of server
    server drained and shutdown completed
    ~~~
