1. Run some basic [CockroachDB SQL statements]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

1. [Create a user with a password]({% link {{ page.version.version }}/create-user.md %}#create-a-user-with-a-password):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

      You will need this username and password to access the DB Console later.

1. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~