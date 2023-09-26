    <section class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/Library/CockroachCloud/certs/<cluster-name>-ca.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~

    Your `cert` file will be downloaded to `~/Library/CockroachCloud/certs/<cluster-name>-ca.crt`.

    </section>

    <section class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/Library/CockroachCloud/certs/<cluster-name>-ca.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~

    Your `cert` file will be downloaded to `~/Library/CockroachCloud/certs/<cluster-name>-ca.crt`.

    </section>

    <section class="filter-content" markdown="1" data-scope="windows">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir -p $env:appdata/CockroachCloud/certs/<cluster-name>-ca.crt; Invoke-WebRequest -Uri https://cockroachlabs.cloud/clusters/<cluster-id>/cert -OutFile $env:appdata/CockroachCloud/certs/<cluster-name>-ca.crt
    ~~~

    Your `cert` file will be downloaded to `%APPDATA%/CockroachCloud/certs/<cluster-name>-ca.crt`.

    </section>