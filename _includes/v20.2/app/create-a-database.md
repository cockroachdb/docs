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

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Start the [built-in SQL shell](cockroach-sql.html) using the connection string you got from the {{ site.data.products.db }} Console [earlier](#set-up-your-cluster-connection):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<cluster_name>.defaultdb?sslmode=verify-full&sslrootcert=<certs_dir>/cc-ca.crt'
    ~~~

    In the connection string copied from the {{ site.data.products.db }} Console, your username, password and cluster name are pre-populated. Replace the `<certs_dir>` placeholder with the path to the `certs` directory that you created [earlier](#set-up-your-cluster-connection).

1. In the SQL shell, create the `bank` database that your application will use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

</section>
