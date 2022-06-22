In this example, you'll set up a core changefeed for a single-node cluster.

1. Use the [`cockroach start-single-node`](cockroach-start-single-node.html) command to start a single-node cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --listen-addr=localhost \
    --background
    ~~~

2. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --format=csv \
    --insecure
    ~~~

    {% include {{ page.version.version }}/cdc/core-csv.md %}

3. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

4. Create table `foo`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~

5. Insert a row into the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO foo VALUES (0);
    ~~~

6. Start the core changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR foo
        WITH resolved = '10s';
    ~~~
    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    NULL,NULL,"{""resolved"":""1590611959605806000.0000000000""}"
    ~~~

    This changefeed will emit [`resolved` timestamps](changefeed-for.html#options) every 10 seconds. Depending on how quickly you insert into your watched table, the output could look different than what is shown here.

7. In a new terminal, add another row:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure -e "INSERT INTO foo VALUES (1)"
    ~~~

8. Back in the terminal where the core changefeed is streaming, the following output has appeared:

    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    NULL,NULL,"{""resolved"":""1590611959605806000.0000000000""}"
    foo,[1],"{""after"": {""a"": 1}}"
    NULL,NULL,"{""resolved"":""1590611970141415000.0000000000""}"
    ~~~

    Note that records may take a couple of seconds to display in the core changefeed.

9. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.

10. To stop `cockroach`, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~
