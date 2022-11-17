    <section class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url 'postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="windows">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full"
    ~~~

    </section>

    Where:
    - `<username>` is the SQL user. By default, this is your {{ site.data.products.db }} account username.
    - `<password>` is the password for the SQL user. The password will be shown only once in the **Connection info** dialog after creating the cluster.
    - `<serverless-host>` is the hostname of the {{ site.data.products.serverless }} cluster.

    You can find these settings in the **Connection parameters** tab of the **Connection info** dialog.