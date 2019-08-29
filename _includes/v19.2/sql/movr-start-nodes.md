Run [`cockroach demo movr`](cockroach-demo.html) with the [`--nodes`](cockroach-demo.html#general) and [`--demo-locality`](cockroach-demo.html#general) flags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo movr --nodes=3 --demo-locality=region=us-east1,region=us-central1,region=us-west1
    ~~~
