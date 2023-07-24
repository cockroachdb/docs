1. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

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
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

1. [Create a user with a password](create-user.html#create-a-user-with-a-password):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

      You will need this username and password to access the DB Console later.

1. Exit the SQL shell and pod:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~