Once your cluster is created, the **Connect to cluster-name** dialog displays. Use the information provided in the dialog to set up your cluster connection for the SQL user that was created by default:

1. In your terminal, run the second command from the dialog to create a new `certs` directory on your local machine and download the CA certificate to that directory.

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz | tar -xJ && cp -i cockroach-v21.1.0.darwin -10.9-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-v21.1.0.linux-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ErrorActionPreference = “Stop”; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = ‘SilentlyContinue’; mkdir -p $env:appdata/cockroach; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-amd64.zip -OutFile cockroach.zip; Expand-Archive -Path cockroach.zip; Copy-Item "cockroach/cockroach-v21.1.2.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach; $Env:PATH += “;$env:appdata/cockroach”
    ~~~
    </section>

1. Copy the connection string provided, which will be used in the next steps (and to connect to your cluster in the future).

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. If you forget your password, you can reset it by going to the [**SQL Users** page](https://www.cockroachlabs.com/docs/cockroachcloud/user-authorization.html).
    {{site.data.alerts.end}}
