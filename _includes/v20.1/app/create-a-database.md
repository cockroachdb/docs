<section class="filter-content" markdown="1" data-scope="local">

1. In the SQL shell, create the `bank` database that your application will use:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

1. Create a SQL user for your app:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER <username> WITH PASSWORD <password>;
    ~~~

    Take note of the username and password. You will use it in your application code later.

1. Give the user the necessary permissions:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE bank TO <username>;
    ~~~

</section>

{% comment %}
<section class="filter-content" markdown="1" data-scope="cockroachcloud">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Start the [built-in SQL shell](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257?sslmode=verify-full&sslrootcert=<certs_dir>/<ca.crt>'
    ~~~

    For the `--url` flag, use the connection string you got from the CockroachCloud Console [earlier](#get-the-connection-string):
       - Replace `<username>` and `<password>` with the SQL user and password that you created.
       - Replace `<certs_dir>/<ca.crt>` with the path to the CA certificate that you downloaded.

1. In the SQL shell, create the `bank` database that your application will use:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

1. Give the user the necessary permissions:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE bank TO <username>;
    ~~~

</section>
{% endcomment %}
