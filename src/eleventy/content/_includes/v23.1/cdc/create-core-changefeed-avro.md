In this example, you'll set up a basic changefeed for a single-node cluster that emits Avro records. CockroachDB's Avro binary encoding convention uses the [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/docs/serializer-formatter.html) to store Avro schemas.

1. Use the [`cockroach start-single-node`]({% link "{{ page.version.version }}/cockroach-start-single-node.md" %}) command to start a single-node cluster:

    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --listen-addr=localhost \
    --background
    ~~~

1. Download and extract the [Confluent Open Source platform](https://www.confluent.io/download/).

1. Move into the extracted `confluent-<version>` directory and start Confluent:

    ~~~ shell
    $ ./bin/confluent local services start
    ~~~

    Only `zookeeper`, `kafka`, and `schema-registry` are needed. To troubleshoot Confluent, see [their docs](https://docs.confluent.io/current/installation/installing_cp.html#zip-and-tar-archives) and the [Quick Start Guide](https://docs.confluent.io/platform/current/quickstart/ce-quickstart.html#ce-quickstart).

1. As the `root` user, open the [built-in SQL client]({% link "{{ page.version.version }}/cockroach-sql.md" %}):

    ~~~ shell
    $ cockroach sql --url="postgresql://root@127.0.0.1:26257?sslmode=disable" --format=csv
    ~~~

    {% dynamic_include page.version.version, "/cdc/core-url.md" %}

    {% dynamic_include page.version.version, "/cdc/core-csv.md" %}

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link "{{ page.version.version }}/cluster-settings.md" %}):

    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Create table `bar`:

    ~~~ sql
    > CREATE TABLE bar (a INT PRIMARY KEY);
    ~~~

1. Insert a row into the table:

    ~~~ sql
    > INSERT INTO bar VALUES (0);
    ~~~

1. Start the basic changefeed:

    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR bar WITH format = avro, confluent_schema_registry = 'http://localhost:8081';
    ~~~

    ~~~
    table,key,value
    bar,\000\000\000\000\001\002\000,\000\000\000\000\002\002\002\000
    ~~~

1. In a new terminal, add another row:

    ~~~ shell
    $ cockroach sql --insecure -e "INSERT INTO bar VALUES (1)"
    ~~~

1. Back in the terminal where the basic changefeed is streaming, the output will appear:

    ~~~
    bar,\000\000\000\000\001\002\002,\000\000\000\000\002\002\002\002
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

1. To stop Confluent, move into the extracted `confluent-<version>` directory and stop Confluent:

    ~~~ shell
    $ ./bin/confluent local services stop
    ~~~

    To terminate all Confluent processes, use:

    ~~~ shell
    $ ./bin/confluent local destroy
    ~~~
