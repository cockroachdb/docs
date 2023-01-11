    <section class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<user>@<cluster-name>-<short-id>.<region>.cockroachlabs.cloud:26257/<database>?sslmode=verify-full&sslrootcert='$HOME'/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<user>@<cluster-name>-<short-id>.<region>.cockroachlabs.cloud:26257/<database>?sslmode=verify-full&sslrootcert='$HOME'/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="windows">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<user>@<cluster-name>-<short-id>.<region>.cockroachlabs.cloud:26257/<database>?sslmode=verify-full&sslrootcert=$env:appdata\CockroachCloud\certs\$<cluster-name>-ca.crt"
    ~~~

    </section>

    Where:
    - `<user>` is the SQL user. By default, this is your {{ site.data.products.db }} account username.
    - `<cluster-name>-<short-id>` is the short name of your cluster plus the short ID. For example, `funny-skunk-3ab`.
    - `<cluster-id>` is a unique string used to identify your cluster when downloading the CA certificate. For example, `12a3bcde-4fa5-6789-1234-56bc7890d123`.
    - `<region>` is the region in which your cluster is running. If you have a multi-region cluster, you can choose any of the regions in which your cluster is running. For example, `aws-us-east-1`.
    - `<database>` is the name for your database. For example, `defaultdb`.

    You can find these settings in the **Connection parameters** tab of the **Connection info** dialog.
