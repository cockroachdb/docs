1. Launch a temporary interactive pod and start the [built-in SQL client](use-the-built-in-sql-client.html) inside it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
    -- sql --insecure --host=cockroachdb-public
    ~~~

2. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
    +----+---------+
    | id | balance |
    +----+---------+
    |  1 |  1000.5 |
    +----+---------+
    (1 row)
    ~~~

3. Exit the SQL shell and delete the temporary pod:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~
