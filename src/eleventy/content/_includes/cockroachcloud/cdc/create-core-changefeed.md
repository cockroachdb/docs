In this example, you'll set up a core changefeed on your CockroachDB {{ site.data.products.standard }} cluster.

1. As the `root` user, open the [built-in SQL client]({% link "{{site.current_cloud_version}}/cockroach-sql.md" %}):

    ~~~ shell
    cockroach sql --url {CONNECTION STRING} --format=csv
    ~~~

    {% include "cockroachcloud/cdc/core-url.md" %}

    {% include "cockroachcloud/cdc/core-csv.md" %}

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link "{{site.current_cloud_version}}/cluster-settings.md" %}):

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

1. Start the core changefeed:

    ~~~ sql
    > EXPERIMENTAL CHANGEFEED FOR foo;
    ~~~
    ~~~
    table,key,value
    foo,[0],"{""after"": {""a"": 0}}"
    ~~~

1. In a new terminal, add another row:

    ~~~ shell
    cockroach sql --url {CONNECTION STRING} -e "INSERT INTO foo VALUES (1)"
    ~~~

1. Back in the terminal where the core changefeed is streaming, the following output has appeared:

    ~~~
    foo,[1],"{""after"": {""a"": 1}}"
    ~~~

    Note that records may take a couple of seconds to display in the core changefeed.

1. To stop streaming the changefeed, enter **CTRL+C** into the terminal where the changefeed is running.
