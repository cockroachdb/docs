    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/.postgresql/root.crt&options=--cluster=<cluster-id>'
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/.postgresql/root.crt&options=--cluster=<cluster-id>'
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full&sslrootcert=$env:appdata/.postgresql/root.crt&options=--cluster=<cluster-id>"
    ~~~
    </section>

    Where:
    - `<username>` is the SQL user. By default, this is your {{ site.data.products.db }} account username.
    - `<password>` is the password for the SQL user. The password will be shown only once in the **Connection info** dialog after creating the cluster. If you forgot your password you can reset it by going to the [**SQL Users** page](user-authorization.html).
    - `<serverless-host>` is the hostname of the serverless cluster.
    - `<cluster-name>` is the short name of your cluster plus the tenant ID. For example, `funny-skunk-3`. The `<cluster-name>` is used to identify your tenant cluster on a multitenant host.

    You can find these settings in the **Connection parameters** tab of the **Connection info** dialog.