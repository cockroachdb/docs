<section class="filter-content" markdown="1" data-scope="local">

1. In the SQL shell, create the `bank` database that your application will use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

1. Create a SQL user for your app:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER <username> WITH PASSWORD <password>;
    ~~~

    Take note of the username and password. You will use it in your application code later.

1. Give the user the necessary permissions:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE bank TO <username>;
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

1. If you haven't already, [download the CockroachDB binary]({% link {{ page.version.version }}/install-cockroachdb.md %}).
1. Start the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) using the connection string you got from the CockroachDB {{ site.data.products.cloud }} Console:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='<connection-string>'
    ~~~

1. In the SQL shell, create the `bank` database that your application will use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

1. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~


</section>