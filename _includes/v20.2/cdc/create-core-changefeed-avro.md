In this example, you'll set up a core changefeed for a single-node cluster that emits Avro records. CockroachDB's Avro binary encoding convention uses the [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/docs/serializer-formatter.html) to store Avro schemas.

1. Use the [`cockroach start-single-node`](cockroach-start-single-node.html) command to start a single-node cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --listen-addr=localhost \
    --background
    ~~~

2. Download and extract the [Confluent Open Source platform](https://www.confluent.io/download/).

3. Move into the extracted `confluent-<version>` directory and start Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent start
    ~~~

    Only `zookeeper`, `kafka`, and `schema-registry` are needed. To troubleshoot Confluent, see [their docs](https://docs.confluent.io/current/installation/installing_cp.html#zip-and-tar-archives).

4. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url="postgresql://root@127.0.0.1:26257?sslmode=disable" --format=csv
    ~~~

    {% include {{ page.version.version }}/cdc/core-url.md %}

    {% include {{ page.version.version }}/cdc/core-csv.md %}

5. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

6. Create table `bar`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bar (a INT PRIMARY KEY);
    ~~~

7. Insert a row into the table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bar VALUES (0);
    ~~~

8. Start the core changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR bar WITH format = experimental_avro, confluent_schema_registry = 'http://localhost:8081';
    ~~~

    ~~~
    table,key,value
    bar,\000\000\000\000\001\002\000,\000\000\000\000\002\002\002\000
    ~~~

9. In a new terminal, add another row:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure -e "INSERT INTO bar VALUES (1)"
    ~~~

10. Back in the terminal where the core changefeed is streaming, the output will appear:

    ~~~
    bar,\000\000\000\000\001\002\002,\000\000\000\000\002\002\002\002
    ~~~

    Note that records may take a couple of seconds to display in the core changefeed.

11. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.

12. To stop `cockroach`, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~

13. To stop Confluent, move into the extracted `confluent-<version>` directory and stop Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent stop
    ~~~

    To terminate all Confluent processes, use:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent destroy
    ~~~
