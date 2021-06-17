    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~
    </section>
    
    <section class="filter-content" markdown="1" data-scope="linux">    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~
    </section>
    
    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir -p %APPDATA%/CockroachCloud/certs/<cluster-name>-ca.crt; Invoke-WebRequest -Uri https://cockroachlabs.cloud/clusters/<cluster-id>/cert -OutFile %APPDATA%/.postgresql/root.crt
    ~~~
    </section>