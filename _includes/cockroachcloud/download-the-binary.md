    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-v21.1.0.darwin-10.9-amd64.tgz | tar -xJ && cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-v21.1.0.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; mkdir -p $env:appdata/cockroach; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-v21.1.2.windows-6.2-amd64.zip -OutFile cockroach.zip; Expand-Archive -Path cockroach.zip; Copy-Item "cockroach/cockroach-{{ page.release_info.version }}.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach; $Env:PATH += ";$env:appdata/cockroach"
    ~~~
    </section>