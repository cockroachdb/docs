---
title: Users and Privileges
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false

---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRCnd6jA1VlsfozEjJukJSZgrMA83qTFeWiMc5mP7moYxy3tOcTT8NHsEnt2eAkHKT9J6XVjDUgbiTv/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

1. Make sure you have already completed [SQL Basics](sql-basics.html).

2. Use the `cockroach gen` command to generate an example `startrek` database with 2 tables, `episodes` and `quotes`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen example-data startrek | cockroach sql \
    --insecure \
    --host=localhost:26257
    ~~~

## Step 1. Check initial privileges

Initially, no users other than `root` have privileges, and root has `ALL` privileges on everything in the cluster.

1. Check the privileges on the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW GRANTS ON DATABASE startrek;"
    ~~~

    You'll see that only the `root` user (and `admin` role to which `root` belongs) has access to the database:

    ~~~
      database_name |    schema_name     | grantee | privilege_type
    +---------------+--------------------+---------+----------------+
      startrek      | crdb_internal      | admin   | ALL
      startrek      | crdb_internal      | root    | ALL
      startrek      | information_schema | admin   | ALL
      startrek      | information_schema | root    | ALL
      startrek      | pg_catalog         | admin   | ALL
      startrek      | pg_catalog         | root    | ALL
      startrek      | public             | admin   | ALL
      startrek      | public             | root    | ALL
    (8 rows)
    ~~~

2. Check the privileges on the tables inside in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW GRANTS ON startrek.episodes, startrek.quotes;"
    ~~~

    Again, you'll see that only the `root` user (and `admin` role to which `root` belongs) has access to the database:

    ~~~
      database_name | schema_name | table_name | grantee | privilege_type
    +---------------+-------------+------------+---------+----------------+
      startrek      | public      | episodes   | admin   | ALL
      startrek      | public      | episodes   | root    | ALL
      startrek      | public      | quotes     | admin   | ALL
      startrek      | public      | quotes     | root    | ALL
    (4 rows)
    ~~~

## Step 2. Create a user

1. Create a new user, `spock`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=localhost:26257 \
    --execute="CREATE USER spock;"
    ~~~

2. Try to read from a table in the `startrek` database as `spock`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --user=spock \
    --database=startrek \
    --execute="SELECT count(*) FROM episodes;"
    ~~~

    Initially, `spock` has no privileges, so the query fails:

    ~~~
    Error: pq: user spock does not have SELECT privilege on relation episodes
    Failed running "sql"
    ~~~

## Step 3. Grant privileges to the user

1. As the `root` user, grant `spock` the `SELECT` privilege on all tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="GRANT SELECT ON TABLE startrek.* TO spock;"
    ~~~

2. As the `root` user, grant `spock` the `INSERT` privilege on just the `startrek.quotes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="GRANT INSERT ON TABLE startrek.quotes TO spock;"
    ~~~

3. As the `root` user, show the privileges granted on tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW GRANTS ON TABLE startrek.quotes, startrek.episodes;"
    ~~~

    ~~~
      database_name | schema_name | table_name | grantee | privilege_type
    +---------------+-------------+------------+---------+----------------+
      startrek      | public      | episodes   | admin   | ALL
      startrek      | public      | episodes   | root    | ALL
      startrek      | public      | episodes   | spock   | SELECT
      startrek      | public      | quotes     | admin   | ALL
      startrek      | public      | quotes     | root    | ALL
      startrek      | public      | quotes     | spock   | INSERT
      startrek      | public      | quotes     | spock   | SELECT
    (7 rows)
    ~~~

## Step 4. Connect as the user

1. As the `spock` user, read from the tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --user=spock \
    --execute="SELECT count(*) FROM startrek.quotes;" \
    --execute="SELECT count(*) FROM startrek.episodes;"
    ~~~

    Because `spock` has the `SELECT` privilege on the tables, the query succeeds:

    ~~~
      count
    +-------+
        200
    (1 row)
      count
    +-------+
         79
    (1 row)
    ~~~

2. As the `spock` user, insert a row into the `startrek.quotes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --user=spock \
    --execute="INSERT INTO startrek.quotes VALUES ('Blah blah', 'Spock', NULL, 52);"
    ~~~

    Because `spock` has the `INSERT` privilege on the table, the query succeeds:

    ~~~
    INSERT 1
    ~~~

3. As the `spock` user, try to insert a row into the `startrek.episodes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --user=spock \
    --execute="INSERT INTO startrek.episodes VALUES (80, 3, 25, 'The Episode That Never Was', 5951.5);"
    ~~~

    Because `spock` does not have the `INSERT` privilege on the table, the query fails:

    ~~~
    Error: pq: user spock does not have INSERT privilege on relation episodes
    Failed running "sql"
    ~~~

## Step 5. Revoke privileges from the user

1. As the `root` user, show the privileges granted on tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW GRANTS ON TABLE startrek.quotes, startrek.episodes;"
    ~~~

    ~~~
      database_name | schema_name | table_name | grantee | privilege_type
    +---------------+-------------+------------+---------+----------------+
      startrek      | public      | episodes   | admin   | ALL
      startrek      | public      | episodes   | root    | ALL
      startrek      | public      | episodes   | spock   | SELECT
      startrek      | public      | quotes     | admin   | ALL
      startrek      | public      | quotes     | root    | ALL
      startrek      | public      | quotes     | spock   | INSERT
      startrek      | public      | quotes     | spock   | SELECT
    (7 rows)
    ~~~

2. As the `root` user, revoke the `SELECT` privilege on the `startrek.episodes` table from `spock`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="REVOKE SELECT ON TABLE startrek.episodes FROM spock;"
    ~~~

3. As the `root` user, again show the privileges granted on tables in the `startrek` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW GRANTS ON TABLE startrek.quotes, startrek.episodes;"
    ~~~

    Note that `spock` no longer has the `SELECT` privilege on the `episodes` table.

    ~~~
      database_name | schema_name | table_name | grantee | privilege_type
    +---------------+-------------+------------+---------+----------------+
      startrek      | public      | episodes   | admin   | ALL
      startrek      | public      | episodes   | root    | ALL
      startrek      | public      | quotes     | admin   | ALL
      startrek      | public      | quotes     | root    | ALL
      startrek      | public      | quotes     | spock   | INSERT
      startrek      | public      | quotes     | spock   | SELECT
    (6 rows)
    ~~~

4. Now as the `spock` user, try to read from the `startrek.episodes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --user=spock \
    --execute="SELECT count(*) FROM startrek.episodes;"
    ~~~

    Because `spock` no longer has the `SELECT` privilege on the table, the query fails:

    ~~~
    Error: pq: user spock does not have SELECT privilege on relation episodes
    Failed running "sql"
    ~~~

## Step 6. Clean up

In the next module, you'll start with a fresh cluster, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario.

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3
    ~~~

## What's next?

[Security](security.html)
