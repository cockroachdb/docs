---
title: Backup and Restore
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSAoyGJwUQ2qVI76XXi15S8VVz1iKgZTglx-klRxv3kKOdjhijORByoq-HYWAnMp2JEkE7_4yGgNSel/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a 3-node cluster

Start and initialize an insecure cluster like you did in previous modules.

1. Start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

2. Start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Perform a "core" backup

1. Use the [`cockroach gen`](../cockroach-gen.html) command to generate an example `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen example-data startrek | cockroach sql --insecure
    ~~~

2. Check the contents of the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT * FROM startrek.episodes LIMIT 1;" \
    --execute="SELECT * FROM startrek.quotes LIMIT 1;"
    ~~~

    ~~~
      id | season | num |    title     |  stardate
    +----+--------+-----+--------------+-------------+
       1 |      1 |   1 | The Man Trap | 1531.100000
    (1 row)
                                     quote                                 |       characters       | stardate | episode
    +----------------------------------------------------------------------+------------------------+----------+---------+
      "... freedom ... is a worship word..." "It is our worship word too." | Cloud William and Kirk | NULL     |      52
    (1 row)
    ~~~

3. Use the [`cockroach dump`](../cockroach-dump.html) command to create a SQL dump file for the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach dump startrek \
    --insecure \
    --host=localhost:26257 > startrek_backup.sql
    ~~~

4. Take a look at the generated `startrek_backup.sql` file.

    You'll see that it contains the SQL for recreating the two tables in the `startrek` database and inserting all current rows into those tables.

    ~~~
    CREATE TABLE episodes (
    	id INT NOT NULL,
    	season INT NULL,
    	num INT NULL,
    	title STRING NULL,
    	stardate DECIMAL NULL,
    	CONSTRAINT "primary" PRIMARY KEY (id ASC),
    	FAMILY "primary" (id, season, num, title, stardate)
    );

    CREATE TABLE quotes (
    	quote STRING NULL,
    	characters STRING NULL,
    	stardate DECIMAL NULL,
    	episode INT NULL,
    	CONSTRAINT fk_episode_ref_episodes FOREIGN KEY (episode) REFERENCES episodes (id),
    	INDEX quotes_episode_idx (episode ASC),
    	FAMILY "primary" (quote, characters, stardate, episode, rowid)
    );

    INSERT INTO episodes (id, season, num, title, stardate) VALUES
    	(1, 1, 1, 'The Man Trap', 1531.1),
    	(2, 1, 2, 'Charlie X', 1533.6),
    	(3, 1, 3, 'Where No Man Has Gone Before', 1312.4),
    	(4, 1, 4, 'The Naked Time', 1704.2),
    	(5, 1, 5, 'The Enemy Within', 1672.1),
      ...
    ~~~

## Step 3. Perform a "core" restore

Now imagine the tables in the `startrek` database have changed and you want to restore them to their state at the time of the dump.

1. Drop the tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="DROP TABLE startrek.episodes,startrek.quotes CASCADE;"
    ~~~

2. Confirm that the tables in the `startrek` database are gone:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW TABLES FROM startrek;"
    ~~~

    ~~~
      table_name
    +------------+
    (0 rows)
    ~~~

3. Restore the tables in the `startrek` database from the dump file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database=startrek < startrek_backup.sql
    ~~~

3. Check the contents of the `startrek` database again:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT * FROM startrek.episodes LIMIT 1;" \
    --execute="SELECT * FROM startrek.quotes LIMIT 1;"
    ~~~

    ~~~
      id | season | num |    title     |  stardate
    +----+--------+-----+--------------+-------------+
       1 |      1 |   1 | The Man Trap | 1531.100000
    (1 row)
                                     quote                                 |       characters       | stardate | episode
    +----------------------------------------------------------------------+------------------------+----------+---------+
      "... freedom ... is a worship word..." "It is our worship word too." | Cloud William and Kirk | NULL     |      52
    (1 row)
    ~~~

## Step 4. Perform an "enterprise" backup

Next, you'll use the enterprise `BACKUP` feature to create a backup of the `startrek` database on S3.

1. If you requested and enabled a trial enterprise license in the [Geo-Partitioning](geo-partitioning.html) module, skip to step 2. Otherwise, [request a trial enterprise license](https://www.cockroachlabs.com/get-cockroachdb/) and then enable your license:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SET CLUSTER SETTING cluster.organization = '<your organization>';"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SET CLUSTER SETTING enterprise.license = '<your license key>';"
    ~~~

2. Use the `BACKUP` SQL statement to generate a backup of the `startrek` database and store it on S3. To ensure your backup doesn't conflict with anyone else's, prefix the filename with your name:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="BACKUP DATABASE startrek TO 's3://cockroach-training/[name]-training?AWS_ACCESS_KEY_ID={{site.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{site.training.aws_secret_access_key}}';"
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
      441707640059723777 | succeeded |                  1 |  279 |           200 |              0 | 30519
    (1 row)
    ~~~

## Step 5. Perform an "enterprise" restore

Again, imagine the tables in the `startrek` database have changed and you want to restore them from the enterprise backup.

1. Drop the tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="DROP TABLE startrek.episodes,startrek.quotes CASCADE;"
    ~~~

2. Confirm that the tables in the `startrek` database are gone:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW TABLES FROM startrek;"
    ~~~

    ~~~
      table_name
    +------------+
    (0 rows)
    ~~~

3. Restore the `startrek` database from the enterprise backup, again making sure to prefix the filename with your name:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="RESTORE startrek.* FROM 's3://cockroach-training/[name]-training?AWS_ACCESS_KEY_ID={{site.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{site.training.aws_secret_access_key}}';"
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
      441707928464261121 | succeeded |                  1 |  279 |           200 |              0 | 30519
    (1 row)
    ~~~

4. Check the contents of the `startrek` database again:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT * FROM startrek.episodes LIMIT 1;" \
    --execute="SELECT * FROM startrek.quotes LIMIT 1;"
    ~~~

    ~~~
      id | season | num |    title     |  stardate
    +----+--------+-----+--------------+-------------+
       1 |      1 |   1 | The Man Trap | 1531.100000
    (1 row)
                                     quote                                 |       characters       | stardate | episode
    +----------------------------------------------------------------------+------------------------+----------+---------+
      "... freedom ... is a worship word..." "It is our worship word too." | Cloud William and Kirk | NULL     |      52
    (1 row)
    ~~~

## Step 6. Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Terminate all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3
    ~~~

## What's next?

[Cluster Upgrade](cluster-upgrade.html)
