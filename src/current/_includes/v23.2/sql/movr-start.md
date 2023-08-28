- Run [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with the `movr` dataset preloaded:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo
    ~~~

- Load the `movr` dataset into a persistent local cluster and open an interactive SQL shell:
    1. Start a [secure]({% link {{ page.version.version }}/secure-a-cluster.md %}) or [insecure]({% link {{ page.version.version }}/start-a-local-cluster.md %}) local cluster.
    1. Use [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}) to load the `movr` dataset:

        <div class="filters filters-big clearfix">
          <button class="filter-button" data-scope="secure">Secure</button>
          <button class="filter-button" data-scope="insecure">Insecure</button>
        </div>

        <section class="filter-content" markdown="1" data-scope="secure">

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cockroach workload init movr 'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
        ~~~

        </section>

        <section class="filter-content" markdown="1" data-scope="insecure">

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cockroach workload init movr 'postgresql://root@localhost:26257?sslmode=disable'
        ~~~

        </section>
    1. Use [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) to open an interactive SQL shell and set `movr` as the  [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database):

        <section class="filter-content" markdown="1" data-scope="secure">

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cockroach sql --certs-dir=certs --host=localhost:26257
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > USE movr;
        ~~~

        </section>

        <section class="filter-content" markdown="1" data-scope="insecure">

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cockroach sql --insecure --host=localhost:26257
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > USE movr;
        ~~~        

        </section>
