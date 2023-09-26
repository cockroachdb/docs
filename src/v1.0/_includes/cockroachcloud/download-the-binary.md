    <section class="filter-content" markdown="1" data-scope="mac">
    If you have not done so already, run the first command in the dialog to install the CockroachDB binary in `/usr/local/bin`, which is usually in the system `PATH`. To install it into a different location, replace `/usr/local/bin/`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz | tar -xJ && sudo cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    If you have not done so already, run the first command in the dialog to install the CockroachDB binary in `/usr/local/bin`, which is usually in the system `PATH`. To install it into a different location, replace `/usr/local/bin/`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="windows">

    If you have not done so already, use PowerShell to run the first command in the dialog, which is a PowerShell script that installs the CockroachDB binary and adds its location in the system `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;$ProgressPreference = 'SilentlyContinue'; $null = New-Item -Type Directory -Force $env:appdata/cockroach; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip -OutFile cockroach.zip; Expand-Archive -Force -Path cockroach.zip; Copy-Item -Force "cockroach/cockroach-{{ page.release_info.version }}.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach; $Env:PATH += ";$env:appdata/cockroach"
    ~~~

    We recommend adding `;$env:appdata/cockroach` to the `PATH` variable for your system environment so you can run [`cockroach` commands](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-commands) from any shell. See [Microsoft's environment variable documentation](https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_environment_variables#saving-changes-to-environment-variables) for more information.

    </section>
