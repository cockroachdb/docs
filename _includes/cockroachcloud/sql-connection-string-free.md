    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<user>@<free-tier-host>.<region>.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster=<cluster-name>-<tenant-id>"
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<user>@<free-tier-host>.<region>.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster=<cluster-name>-<tenant-id>"
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<user>@<free-tier-host>.<region>.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%APPDATA%/.postgresql/root.crt&options=--cluster=<cluster-name>-<tenant-id>"
    ~~~
    </section>