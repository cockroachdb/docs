In this example, you'll set up a sinkless changefeed for a single-node cluster.

1. In a terminal window, start `cockroach`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --listen-addr=localhost \
    --background
    ~~~

1. As the `root` user, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql \
    --url="postgresql://root@127.0.0.1:26257?sslmode=disable" \
    --format=csv
    ~~~

    {% include {{ page.version.version }}/cdc/sinkless-url.md %}

    {% include {{ page.version.version }}/cdc/sinkless-csv.md %}

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Create table `foo`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~

1. Insert a row into the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO foo VALUES (0);
    ~~~

1. Start the sinkless changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE foo;
    ~~~
    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    ~~~

1. In a new terminal, add another row:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure -e "INSERT INTO foo VALUES (1)"
    ~~~

1. Back in the terminal where the changefeed is streaming, the following output has appeared:

    ~~~
    foo,[1],"{""after"": {""a"": 1}}"
    ~~~

    Note that records may take a couple of seconds to display in the changefeed.

1. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.

1. To stop `cockroach`:

    Get the process ID of the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 21766     1   0  6:21PM ttys001    0:00.89 cockroach start-single-node --insecure --listen-addr=localhost
    ~~~

    Gracefully shut down the node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 21766
    ~~~

    ~~~
    initiating graceful shutdown of server
    server drained and shutdown completed
    ~~~
