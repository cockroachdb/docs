Start the [built-in SQL shell](cockroach-sql.html):

~~~ shell
$ cockroach sql --insecure
~~~

In the SQL shell, issue the following statements to create the `maxroach` user and `bank` database:

~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

~~~ sql
> CREATE DATABASE bank;
~~~

Give the `maxroach` user the necessary permissions:

~~~ sql
> GRANT ALL ON DATABASE bank TO maxroach;
~~~

Exit the SQL shell:

~~~ sql
> \q
~~~
