Run [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) with the [`--nodes`]({% link {{ page.version.version }}/cockroach-demo.md %}#flags) and [`--demo-locality`]({% link {{ page.version.version }}/cockroach-demo.md %}#flags) flags This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database).

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo --nodes=3 --demo-locality=region=us-east1:region=us-central1:region=us-west1
    ~~~
