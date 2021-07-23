    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~
    
    Your `cert` file will be downloaded to `~/.postgres/root.crt`.
    </section>
    
    <section class="filter-content" markdown="1" data-scope="linux">    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~
    
    Your `cert` file will be downloaded to `~/.postgres/root.crt`.
    </section>
    
    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir -p $env:appdata\.postgresql\; Invoke-WebRequest -Uri https://cockroachlabs.cloud/clusters/<cluster-id>/cert -OutFile $env:appdata\.postgresql\root.crt
    ~~~
    
    Your `cert` file will be downloaded to `%APPDATA%/.postgres/root.crt`.
    </section>