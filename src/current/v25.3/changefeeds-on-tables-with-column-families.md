---
title: Changefeeds on Tables with Column Families
summary: Understand how changefeeds work on tables with column families.
toc: true
docs_area: stream_data
---

You can create changefeeds on tables with more than one [column family]({% link {{ page.version.version }}/column-families.md %}). Changefeeds will emit individual messages per column family on a table.

For further detail, see the following sections:

- [Syntax](#syntax)
- [Message format](#message-format)
- [Examples](#create-a-changefeed-on-a-table-with-column-families)

## Syntax

To target a table with multiple column families, set the [`split_column_families` option]({% link {{ page.version.version }}/create-changefeed.md %}#split-column-families) when creating a changefeed:

~~~ sql
CREATE CHANGEFEED FOR TABLE {table} INTO {sink} WITH split_column_families;
~~~

To emit messages for a specific column family, use the `FAMILY` keyword:

~~~ sql
CREATE CHANGEFEED FOR TABLE {table} FAMILY {family} INTO {sink};
~~~

{{site.data.alerts.callout_info}}
You can also use [sinkless changefeeds]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}?filters=sinkless#create-a-sinkless-changefeed-on-a-table-with-column-families) on tables with column families by using the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) statement without a sink with `split_column_families` or the `FAMILY` keyword.
{{site.data.alerts.end}}

If a table has multiple column families, the `FAMILY` keyword will ensure the changefeed emits messages for **each** column family you define with `FAMILY` in the `CREATE CHANGEFEED` statement. If you do not specify `FAMILY`, then the changefeed will emit messages for **all** the table's column families.

To specify multiple families on the same table, it is necessary to define the table and family in both instances:

~~~ sql
CREATE CHANGEFEED FOR TABLE tbl FAMILY f_1, TABLE tbl FAMILY f_2;
~~~

## Message format

The response will follow a typical [changefeed message format]({% link {{ page.version.version }}/changefeed-messages.md %}), but with the family name appended to the table name with a `.`, in the format `table.family`:

~~~
{"after":{"column":"value"},"key":[1],"topic":"table.family"}
~~~

For [cloud storage sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink), the filename will include the family name appended to the table name with a `+`, in the format `table+primary`.

[Avro]({% link {{ page.version.version }}/changefeed-messages.md %}#avro) schema names will include the family name concatenated to the table name.

The primary key columns will appear in the `key` for **all** column families, and will also appear in the value **only** for the families that they are a member of.

For example, if the table `office_dogs` has a column family `primary`, containing the primary key and a `STRING` column, and a `secondary` column family containing a different `STRING` column, then you'll receive two messages for an insert.

~~~ sql
CREATE TABLE office_dogs (
   id INT PRIMARY KEY,
   name STRING,
   owner STRING,
   FAMILY primary (id, name),
   FAMILY secondary (owner)
 );
~~~

The changefeed targeting this table (started with `split_column_families`) will emit the following when there are inserts to the table:

~~~
{"after":{"id":4,"name":"Toby"},"key":[4],"topic":"office_dogs.primary"}],"length":1}
{"after":{"owner":"Ashley"},"key":[4],"topic":"office_dogs.secondary"}],"length":1}
~~~

The output shows the `primary` column family with `4` in the value (`{"id":4,"name":"Toby"}`) and the key (`"key":[4]`). The `secondary` family doesn't contain the `id` column, so the primary key `4` is only in the key and **not** the value. For an update that only affects data in one column family, the changefeed will send one message for that update relating to the family.

## Considerations

- If you create a table **without** column families and then start a changefeed with the `split_column_families` option, it is not possible to add column families. A subsequent `ALTER TABLE` statement adding a column family to the table will cause the changefeed to fail.
- When you do not specify column family names in the `CREATE` or `ALTER TABLE` statement, the family names will default to either of the following:
    - `primary`: Since `primary` is a key word, you'll receive a syntax error if you run `CREATE CHANGEFEED FOR table FAMILY primary`. To avoid this syntax error, use double quotes: `CREATE CHANGEFEED FOR table FAMILY "primary"`. You'll receive output from the changefeed like: `table.primary`.
    - `fam_<zero-indexed family id>_<delimited list of columns>`: For a table that does not include a name for the family: `FAMILY (id, name)`, you'll receive output from the changefeed containing: `table.fam_0_id_name`. This references the table, the family ID and the two columns that this column family includes.
- Creating a changefeed with [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) is not supported on tables with more than one column family.
- When you create a changefeed on a table with more than one column family, the changefeed will emit messages per column family in separate streams. As a result, [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}) for different column families will arrive at the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) under separate topics. For more details, refer to [Message format](#message-format).

<div class="filters clearfix">
  <button class="filter-button" data-scope="cf">Changefeeds</button>
  <button class="filter-button" data-scope="sinkless">Sinkless changefeeds</button>
</div>

<section class="filter-content" markdown="1" data-scope="cf">

## Create a changefeed on a table with column families

In this example, you'll set up changefeeds on two tables that have [column families]({% link {{ page.version.version }}/column-families.md %}). You'll use a single-node cluster sending changes to a webhook sink for this example, but you can use any [changefeed sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) to work with tables that include column families.

1. Use the [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) command to start a single-node cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start-single-node --insecure --listen-addr=localhost
    ~~~

1. As the `root` user, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. In a separate terminal window, set up your HTTP server. Clone the test repository:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    git clone https://github.com/cockroachlabs/cdc-webhook-sink-test-server.git
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cd cdc-webhook-sink-test-server/go-https-server
    ~~~

1. Next make the script executable and then run the server (passing a specific port if preferred, otherwise it will default to `:3000`):

    {% include_cached copy-clipboard.html %}
    ~~~shell
    chmod +x ./server.sh
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~shell
    ./server.sh <port>
    ~~~

1. Back in your SQL shell, create a database called `cdc_demo`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE cdc_demo;
    ~~~

1. Set the database as the default:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    USE cdc_demo;
    ~~~

1. Create a table with two column families:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE office_dogs (
        id INT PRIMARY KEY,
        name STRING,
        dog_owner STRING,
        FAMILY dogs (id, name),
        FAMILY employee (dog_owner)
      );
    ~~~

1. Insert some data into the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO office_dogs (id, name, dog_owner) VALUES (1, 'Petee', 'Lauren'), (2, 'Max', 'Taylor'), (3, 'Patch', 'Sammy'), (4, 'Roach', 'Ashley');
    ~~~

1. Create a second table that also defines column families:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE office_plants (
         id INT PRIMARY KEY,
         plant_name STRING,
         office_floor INT,
         safe_for_dogs BOOL,
         FAMILY dog_friendly (office_floor, safe_for_dogs),
         FAMILY plant (id, plant_name)
       );
    ~~~

1. Insert some data into `office_plants`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO office_plants (id, plant_name, office_floor, safe_for_dogs) VALUES (1, 'Sansevieria', 11, false), (2, 'Monstera', 11, false), (3, 'Peperomia', 10, true), (4, 'Jade', 9, true);
    ~~~

1. Create a changefeed on the `office_dogs` table targeting one of the column families. Use the `FAMILY` keyword in the `CREATE` statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE office_dogs FAMILY employee INTO 'webhook-https://localhost:3000?insecure_tls_skip_verify=true';
    ~~~

    You'll receive one message for each of the inserts that affects the specified column family:

    ~~~
    {"payload":[{"after":{"dog_owner":"Lauren"},"key":[1],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Sammy"},"key":[3],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Taylor"},"key":[2],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Ashley"},"key":[4],"topic":"office_dogs.employee"}],"length":1}
    ~~~

    {{site.data.alerts.callout_info}}
    The ordering of messages is not guaranteed. That is, you may not always receive messages for the same row, or even the same change to the same row, next to each other.
    {{site.data.alerts.end}}

    Alternatively, create a changefeed using the `FAMILY` keyword across two tables:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE office_dogs FAMILY employee, TABLE office_plants FAMILY dog_friendly INTO 'webhook-https://localhost:3000?insecure_tls_skip_verify=true';
    ~~~

    You'll receive one message for each insert that affects the specified column families:

    ~~~
    {"payload":[{"after":{"dog_owner":"Lauren"},"key":[1],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"office_floor":11,"safe_for_dogs":false},"key":[1],"topic":"office_plants.dog_friendly"}],"length":1}
    {"payload":[{"after":{"office_floor":9,"safe_for_dogs":true},"key":[4],"topic":"office_plants.dog_friendly"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Taylor"},"key":[2],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"office_floor":11,"safe_for_dogs":false},"key":[2],"topic":"office_plants.dog_friendly"}],"length":1}
    {"payload":[{"after":{"office_floor":10,"safe_for_dogs":true},"key":[3],"topic":"office_plants.dog_friendly"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Ashley"},"key":[4],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Sammy"},"key":[3],"topic":"office_dogs.employee"}],"length":1}
    ~~~

    This allows you to define particular column families for the changefeed to target, without necessarily specifying every family in a table.

    {{site.data.alerts.callout_info}}
    To create a changefeed specifying two families on **one** table, ensure that you define the table and family in both instances:

    `CREATE CHANGEFEED FOR TABLE office_dogs FAMILY employee, TABLE office_dogs FAMILY dogs INTO {sink};`
    {{site.data.alerts.end}}

1. To create a changefeed that emits messages for all column families in a table, use the [`split_column_families`]({% link {{ page.version.version }}/create-changefeed.md %}#split-column-families) option:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE office_dogs INTO 'webhook-https://localhost:3000?insecure_tls_skip_verify=true' with split_column_families;
    ~~~

    You'll receive output for both of the column families in the `office_dogs` table:

    ~~~
    {"payload":[{"after":{"id":1,"name":"Petee"},"key":[1],"topic":"office_dogs.dogs"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Lauren"},"key":[1],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"id":2,"name":"Max"},"key":[2],"topic":"office_dogs.dogs"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Taylor"},"key":[2],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"id":3,"name":"Patch"},"key":[3],"topic":"office_dogs.dogs"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Sammy"},"key":[3],"topic":"office_dogs.employee"}],"length":1}
    {"payload":[{"after":{"id":4,"name":"Roach"},"key":[4],"topic":"office_dogs.dogs"}],"length":1}
    {"payload":[{"after":{"dog_owner":"Ashley"},"key":[4],"topic":"office_dogs.employee"}],"length":1}
    ~~~

    {{site.data.alerts.callout_info}}
    You can find details of your changefeed job using [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs). Changefeeds streaming to [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or [Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) will populate the `topics` field in the `SHOW CHANGEFEED JOBS` output.

    When using the `FAMILY` keyword, the `topics` field will display in the format `topic.family`, e.g., `office_dogs.employee,office_dogs.dogs`. With the `split_column_families` option set, `topics` will show the topic name and a family placeholder `topic.{family}`, e.g., `office_dogs.{family}`.
    {{site.data.alerts.end}}

1. Update one of the values in the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    UPDATE office_dogs SET name = 'Izzy' WHERE id = 4;
    ~~~

    This only affects one column family, which means you'll receive one message:

    ~~~
    {"payload":[{"after":{"id":4,"name":"Izzy"},"key":[4],"topic":"office_dogs.dogs"}],"length":1}
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="sinkless">

## Create a sinkless changefeed on a table with column families

In this example, you'll set up a sinkless changefeed on two tables that have [column families]({% link {{ page.version.version }}/column-families.md %}). You'll use a single-node cluster with the changefeed sending changes to the client.

1. Use the [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) command to start a single-node cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start-single-node --insecure --listen-addr=localhost
    ~~~

1. As the `root` user, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url="postgresql://root@127.0.0.1:26257?sslmode=disable" --format=csv
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. Create a database called `cdc_demo`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE cdc_demo;
    ~~~

1. Set the database as the default:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    USE cdc_demo;
    ~~~

1. Create a table with two column families:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE office_dogs (
          id INT PRIMARY KEY,
          name STRING,
          dog_owner STRING,
          FAMILY dogs (id, name),
          FAMILY employee (dog_owner)
    	);
    ~~~

1. Insert some data into the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO office_dogs (id, name, dog_owner) VALUES (1, 'Petee', 'Lauren'), (2, 'Max', 'Taylor'), (3, 'Patch', 'Sammy'), (4, 'Roach', 'Ashley');
    ~~~

1. Create another table that also defines two column families:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE office_plants (
         id INT PRIMARY KEY,
         plant_name STRING,
         office_floor INT,
         safe_for_dogs BOOL,
         FAMILY dog_friendly (office_floor, safe_for_dogs),
         FAMILY plant (id, plant_name)
       );
    ~~~

1. Insert some data into `office_plants`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO office_plants (id, plant_name, office_floor, safe_for_dogs) VALUES (1, 'Sansevieria', 11, false), (2, 'Monstera', 11, false), (3, 'Peperomia', 10, true), (4, 'Jade', 9, true);
    ~~~

1. Create a changefeed on the `office_dogs` table targeting one of the column families. Use the `FAMILY` keyword in the statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE office_dogs FAMILY employee;
    ~~~

    You'll receive one message for each of the inserts that affects the specified column family:

    ~~~
    table,key,value
    office_dogs.employee,[1],"{""after"": {""owner"": ""Lauren""}}"
    office_dogs.employee,[2],"{""after"": {""owner"": ""Taylor""}}"
    office_dogs.employee,[3],"{""after"": {""owner"": ""Sammy""}}"
    office_dogs.employee,[4],"{""after"": {""owner"": ""Ashley""}}"
    ~~~

    {{site.data.alerts.callout_info}}
    The ordering of messages is not guaranteed. That is, you may not always receive messages for the same row, or even the same change to the same row, next to each other.
    {{site.data.alerts.end}}

    Alternatively, create a changefeed using the `FAMILY` keyword across two tables:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE office_dogs FAMILY employee, TABLE office_plants FAMILY dog_friendly;
    ~~~

    You'll receive one message for each insert that affects the specified column families:

    ~~~
    table,key,value
    office_plants.dog_friendly,[1],"{""after"": {""office_floor"": 11, ""safe_for_dogs"": false}}"
    office_plants.dog_friendly,[2],"{""after"": {""office_floor"": 11, ""safe_for_dogs"": false}}"
    office_plants.dog_friendly,[3],"{""after"": {""office_floor"": 10, ""safe_for_dogs"": true}}"
    office_plants.dog_friendly,[4],"{""after"": {""office_floor"": 9, ""safe_for_dogs"": true}}"
    office_dogs.employee,[1],"{""after"": {""dog_owner"": ""Lauren""}}"
    office_dogs.employee,[2],"{""after"": {""dog_owner"": ""Taylor""}}"
    office_dogs.employee,[3],"{""after"": {""dog_owner"": ""Sammy""}}"
    office_dogs.employee,[4],"{""after"": {""dog_owner"": ""Ashley""}}"
    ~~~

    This allows you to define particular column families for the changefeed to target, without necessarily specifying every family in a table.

    {{site.data.alerts.callout_info}}
    To create a changefeed specifying two families on **one** table, ensure that you define the table and family in both instances:

    `CREATE CHANGEFEED FOR TABLE office_dogs FAMILY employee, TABLE office_dogs FAMILY dogs;`
    {{site.data.alerts.end}}

1. To create a changefeed that emits messages for all column families in a table, use the [`split_column_families`]({% link {{ page.version.version }}/changefeed-for.md %}#split-column-families) option:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE office_dogs WITH split_column_families;
    ~~~

    In your other terminal window, insert some more values:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure -e "INSERT INTO cdc_demo.office_dogs (id, name, dog_owner) VALUES (5, 'Daisy', 'Cameron'), (6, 'Sage', 'Blair'), (7, 'Bella', 'Ellis');"
    ~~~

    Your changefeed will output the following:

    ~~~
    table,key,value
    office_dogs.dogs,[1],"{""after"": {""id"": 1, ""name"": ""Petee""}}"
    office_dogs.employee,[1],"{""after"": {""owner"": ""Lauren""}}"
    office_dogs.dogs,[2],"{""after"": {""id"": 2, ""name"": ""Max""}}"
    office_dogs.employee,[2],"{""after"": {""owner"": ""Taylor""}}"
    office_dogs.dogs,[3],"{""after"": {""id"": 3, ""name"": ""Patch""}}"
    office_dogs.employee,[3],"{""after"": {""owner"": ""Sammy""}}"
    office_dogs.dogs,[4],"{""after"": {""id"": 4, ""name"": ""Roach""}}"
    office_dogs.employee,[4],"{""after"": {""owner"": ""Ashley""}}"
    office_dogs.dogs,[5],"{""after"": {""id"": 5, ""name"": ""Daisy""}}"
    office_dogs.employee,[5],"{""after"": {""owner"": ""Cameron""}}"
    office_dogs.dogs,[6],"{""after"": {""id"": 6, ""name"": ""Sage""}}"
    office_dogs.employee,[6],"{""after"": {""owner"": ""Blair""}}"
    office_dogs.dogs,[7],"{""after"": {""id"": 7, ""name"": ""Bella""}}"
    office_dogs.employee,[7],"{""after"": {""owner"": ""Ellis""}}"
    ~~~

1. In your other terminal window, update one of the values in the table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure -e "UPDATE cdc_demo.office_dogs SET name = 'Izzy' WHERE id = 4;"
    ~~~

    This only affects one column family, which means you'll receive one message:

    ~~~
    office_dogs.dogs,[4],"{""after"": {""id"": 4, ""name"": ""Izzy""}}"
    ~~~

</section>

## See also

- [`EXPERIMENTAL CHANGEFEED`]({% link {{ page.version.version }}/changefeed-for.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [Changefeed Examples]({% link {{ page.version.version }}/changefeed-examples.md %})
