Start the [built-in SQL shell](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

In the SQL shell, issue the following statements to create the `maxroach` user and `bank` database:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Give the `maxroach` user the necessary permissions:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO maxroach;
~~~

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~
