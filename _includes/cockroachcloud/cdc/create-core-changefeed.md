In this example, you'll set up a core changefeed on your {{ site.data.products.serverless }} cluster.

1. As the `root` user, open the [built-in SQL client](../{{site.versions["cloud"]}}/cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url {CONNECTION STRING} --format=csv
    ~~~

    {% include cockroachcloud/cdc/core-url.md %}

    {% include cockroachcloud/cdc/core-csv.md %}

1. Enable the `kv.rangefeed.enabled` [cluster setting](../{{site.versions["cloud"]}}/cluster-settings.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Create table `foo`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~

1. Insert a row into the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO foo VALUES (0);
    ~~~

1. Start the core changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR foo;
    ~~~
    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    ~~~

1. In a new terminal, add another row:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url {CONNECTION STRING} -e "INSERT INTO foo VALUES (1)"
    ~~~

1. Back in the terminal where the core changefeed is streaming, the following output has appeared:

    ~~~
    foo,[1],"{""after"": {""a"": 1}}"
    ~~~

    Note that records may take a couple of seconds to display in the core changefeed.

1. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.
