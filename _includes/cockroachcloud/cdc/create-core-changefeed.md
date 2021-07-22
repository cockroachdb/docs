In this example, you'll set up a core changefeed on your CockroachCloud Free (beta) cluster.

2. As the `root` user, open the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url {CONNECTION STRING} --format=csv
    ~~~

    {% include cockroachcloud/cdc/core-url.md %}

    {% include cockroachcloud/cdc/core-csv.md %}

3. Enable the `kv.rangefeed.enabled` [cluster setting](../{{site.versions["stable"]}}/cluster-settings.html):

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
    cockroach sql --url {CONNECTION STRING} -e "INSERT INTO foo VALUES (1)"
    ~~~

8. Back in the terminal where the core changefeed is streaming, the following output has appeared:

    ~~~
    foo,[1],"{""after"": {""a"": 1}}"
    ~~~

    Note that records may take a couple of seconds to display in the core changefeed.

9. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.
