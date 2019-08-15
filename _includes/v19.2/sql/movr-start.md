- Run [`cockroach demo movr`](cockroach-demo.html) to start a temporary, in-memory cluster with the `movr` dataset pre-loaded:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo movr
    ~~~

- Load the `movr` dataset into a persistent local cluster and open an interactive SQL shell:
    1. Start a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
    1. Use [`cockroach workload`](cockroach-workload.html) to load the `movr` dataset:

        <div class="filters filters-big clearfix">
          <button class="filter-button" data-scope="secure">Secure</button>
          <button class="filter-button" data-scope="insecure">Insecure</button>
        </div>

        <section class="filter-content" markdown="1" data-scope="secure">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ cockroach workload init movr --certs-dir=certs --host=localhost:26257
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="insecure">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ cockroach workload init movr --insecure --host=localhost:26257
        ~~~
        </section>
    1. Use [`cockroach sql`](use-the-built-in-sql-client.html) to open an interactive SQL shell and set `movr` as the  [current database](sql-name-resolution.html#current-database):

        <section class="filter-content" markdown="1" data-scope="secure">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ cockroach sql --certs-dir=certs --host=localhost:26257
        ~~~

        {% include copy-clipboard.html %}
        ~~~ sql
        > USE movr;
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="insecure">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ cockroach sql --insecure --host=localhost:26257
        ~~~

        {% include copy-clipboard.html %}
        ~~~ sql
        > USE movr;
        ~~~        
        </section>
