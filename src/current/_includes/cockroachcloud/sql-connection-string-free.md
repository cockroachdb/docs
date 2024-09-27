    <section class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<username>:<password>@<cluster-host>:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/.postgresql/root.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<username>:<password>@<cluster-host>:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/.postgresql/root.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="windows">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<username>:<password>@<cluster-host>:26257/defaultdb?sslmode=verify-full&sslrootcert=$env:appdata/.postgresql/root.crt"
    ~~~

    </section>

    Where:
    - `<username>` is the SQL user. By default, this is your CockroachDB {{ site.data.products.cloud }} account username.
    - `<password>` is the password for the SQL user. The password will be shown only once in the **Connection info** dialog after creating the cluster.
    - `<cluster-hostname>` is the hostname of your CockroachDB {{ site.data.products.cloud }} cluster.
    - `<cluster-id>` is a unique string used to identify your cluster when downloading the CA certificate. For example, `12a3bcde-4fa5-6789-1234-56bc7890d123`.

    You can find these settings in the **Connection parameters** tab of the **Connection info** dialog.
