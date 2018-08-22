---
title: Backup and Restore
toc: true
toc_not_nested: true
block_search: true
sidebar_data: sidebar-data-training.json
redirect_from: /training/backup-and-restore.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSAoyGJwUQ2qVI76XXi15S8VVz1iKgZTglx-klRxv3kKOdjhijORByoq-HYWAnMp2JEkE7_4yGgNSel/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before You Begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a 3-node cluster

Start and initialize an insecure cluster like you did in previous modules.

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In a new terminal, start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

## Step 2. Perform a "Core" backup

1. Use the [`cockroach gen`](../generate-cockroachdb-resources.html) command to generate an example `startrek` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen example-data startrek | ./cockroach sql --insecure
    ~~~

2. Check the contents of the `startrek` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT * FROM startrek.episodes LIMIT 1;" \
    --execute="SELECT * FROM startrek.quotes LIMIT 1;"
    ~~~

    ~~~
    +----+--------+-----+--------------+----------+
    | id | season | num |    title     | stardate |
    +----+--------+-----+--------------+----------+
    |  1 |      1 |   1 | The Man Trap |   1531.1 |
    +----+--------+-----+--------------+----------+
    (1 row)
    +----------------------------------------------------------------------+------------------------+----------+---------+
    |                                quote                                 |       characters       | stardate | episode |
    +----------------------------------------------------------------------+------------------------+----------+---------+
    | "... freedom ... is a worship word..." "It is our worship word too." | Cloud William and Kirk | NULL     |      52 |
    +----------------------------------------------------------------------+------------------------+----------+---------+
    (1 row)
    ~~~

3. Use the [`cockroach dump`](../sql-dump.html) command to create a SQL dump file for the `startrek` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach dump startrek --insecure > startrek_backup.sql
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

## Step 3. Perform a "Core" restore

Now imagine the tables in the `startrek` database have changed and you want to restore them to their state at the time of the dump.

1. Drop the tables in the `startrek` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="DROP TABLE startrek.episodes,startrek.quotes CASCADE;"
    ~~~

2. Confirm that the tables in the `startrek` database are gone:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SHOW TABLES FROM startrek;"
    ~~~

    ~~~
    +-------+
    | Table |
    +-------+
    +-------+
    (0 rows)
    ~~~

3. Restore the tables in the `startrek` database from the dump file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql --insecure --database=startrek < startrek_backup.sql
    ~~~

3. Check the contents of the `startrek` database again:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT * FROM startrek.episodes LIMIT 1;" \
    --execute="SELECT * FROM startrek.quotes LIMIT 1;"
    ~~~

    ~~~
    +----+--------+-----+--------------+----------+
    | id | season | num |    title     | stardate |
    +----+--------+-----+--------------+----------+
    |  1 |      1 |   1 | The Man Trap |   1531.1 |
    +----+--------+-----+--------------+----------+
    (1 row)
    +----------------------------------------------------------------------+------------------------+----------+---------+
    |                                quote                                 |       characters       | stardate | episode |
    +----------------------------------------------------------------------+------------------------+----------+---------+
    | "... freedom ... is a worship word..." "It is our worship word too." | Cloud William and Kirk | NULL     |      52 |
    +----------------------------------------------------------------------+------------------------+----------+---------+
    (1 row)
    ~~~

## Step 4. Perform an "Enterprise" backup

Next, you'll use the enterprise `BACKUP` feature to create a backup of the `startrek` database on S3. Before you can use this or any enterprise feature, you must obtain an enterprise license from Cockroach Labs. For this training, we've created a temporary license.

1. Enable the temporary enterprise license:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SET CLUSTER SETTING cluster.organization = 'Cockroach Labs Training';"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SET CLUSTER SETTING enterprise.license = '{{site.training.ccl_license}}';"
    ~~~

2. Use the `BACKUP` SQL statement to generate a backup of the `startrek` database and store it on S3. To ensure your backup doesn't conflict with anyone else's, prefix the filename with your initials:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="BACKUP DATABASE startrek TO 's3://cockroach-training/[initials]-training?AWS_ACCESS_KEY_ID={{site.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{site.training.aws_secret_access_key}}';"
    ~~~

    ~~~
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    |       job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    | 322827820562808833 | succeeded |                  1 |  279 |           200 |             15 | 34673 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)
    ~~~

## Step 5. Perform an "Enterprise" restore

Again, imagine the tables in the `startrek` database have changed and you want to restore them from the enterprise backup.

1. Drop the tables in the `startrek` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="DROP TABLE startrek.episodes,startrek.quotes CASCADE;"
    ~~~

2. Confirm that the tables in the `startrek` database are gone:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SHOW TABLES FROM startrek;"
    ~~~

    ~~~
    +-------+
    | Table |
    +-------+
    +-------+
    (0 rows)
    ~~~

3. Restore the `startrek` database from the enterprise backup, again making sure to prefix the filename with your initials:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="RESTORE startrek.* FROM 's3://cockroach-training/[initials]-training?AWS_ACCESS_KEY_ID={{site.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{site.training.aws_secret_access_key}}';"
    ~~~

    ~~~
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    |       job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    | 322828729641959425 | succeeded |                  1 |  279 |           200 |              0 | 24704 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)
    ~~~

4. Check the contents of the `startrek` database again:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT * FROM startrek.episodes LIMIT 1;" \
    --execute="SELECT * FROM startrek.quotes LIMIT 1;"
    ~~~

    ~~~
    +----+--------+-----+--------------+----------+
    | id | season | num |    title     | stardate |
    +----+--------+-----+--------------+----------+
    |  1 |      1 |   1 | The Man Trap |   1531.1 |
    +----+--------+-----+--------------+----------+
    (1 row)
    +----------------------------------------------------------------------+------------------------+----------+---------+
    |                                quote                                 |       characters       | stardate | episode |
    +----------------------------------------------------------------------+------------------------+----------+---------+
    | "... freedom ... is a worship word..." "It is our worship word too." | Cloud William and Kirk | NULL     |      52 |
    +----------------------------------------------------------------------+------------------------+----------+---------+
    (1 row)
    ~~~

## What's Next?

- [Cluster Upgrade](cluster-upgrade.html)
