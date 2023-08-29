Start the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

In the SQL shell, issue the following statements to create the `maxroach` user and `bank` database:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Give the `maxroach` user the necessary permissions:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO maxroach;
~~~

Exit the SQL shell:

{% include_cached copy-clipboard.html %}
~~~ sql
> \q
~~~
