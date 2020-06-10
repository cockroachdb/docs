In this example, you'll set up a core changefeed for a single-node cluster.

1. In a terminal window, start `cockroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --listen-addr=localhost \
    --background
    ~~~

2. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url="postgresql://root@127.0.0.1:26257?sslmode=disable" \
    --format=csv
    ~~~

    {% include {{ page.version.version }}/cdc/core-url.md %}

    {% include {{ page.version.version }}/cdc/core-csv.md %}

3. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

4. Create table `foo`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~

5. Insert a row into the table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO foo VALUES (0);
    ~~~

6. Start the core changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR foo;
    ~~~
    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    ~~~

7. In a new terminal, add another row:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure -e "INSERT INTO foo VALUES (1)"
    ~~~

8. Back in the terminal where the core changefeed is streaming, the following output has appeared:

    ~~~
    foo,[1],"{""after"": {""a"": 1}}"
    ~~~

    Note that records may take a couple of seconds to display in the core changefeed.

9. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.

10. To stop `cockroach`, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~
