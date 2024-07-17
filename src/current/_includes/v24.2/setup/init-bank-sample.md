1. Set the `DATABASE_URL` environment variable to the connection string for your cluster:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="{connection-string}"
    ~~~

    Where `{connection-string}` is the connection string you copied earlier.

    </section>


1. To initialize the example database, use the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) command to execute the SQL statements in the `dbinit.sql` file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cat dbinit.sql | cockroach sql --url $DATABASE_URL
    ~~~

    The SQL statement in the initialization file should execute:

    ~~~
    CREATE TABLE


    Time: 102ms
    ~~~
