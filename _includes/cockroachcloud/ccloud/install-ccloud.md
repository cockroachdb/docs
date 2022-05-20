
Choose your OS:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="mac"><strong>Mac</strong></button>
    <button class="filter-button page-level" data-scope="linux"><strong>Linux</strong></button>
    <button class="filter-button page-level" data-scope="windows"><strong>Windows</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">
In a terminal, enter the following command to download and extract the `ccloud` binary and add it to your `PATH`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://binaries.cockroachdb.com/ccloud/ccloud_darwin-amd64_0.1.1.tar.gz | tar -xJ && cp -i ccloud /usr/local/bin/
~~~

Use the ARM 64 binary if you have an M1 Mac:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://binaries.cockroachdb.com/ccloud/ccloud_darwin-arm64_0.1.1.tar.gz | tar -xJ && cp -i ccloud /usr/local/bin/
~~~

</section>
<section class="filter-content" markdown="1" data-scope="linux">
In a terminal, enter the following command to download and extract the `ccloud` binary and add it to your `PATH`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://binaries.cockroachdb.com/ccloud/ccloud_linux-amd64_0.1.1.tar.gz | tar -xz && cp -i ccloud /usr/local/bin/
~~~

</section>
<section class="filter-content" markdown="1" data-scope="windows">
In a PowerShell window, enter the following command to download and extract the `ccloud` binary and add it to your `PATH`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; $null = New-Item -Type Directory -Force $env:appdata/ccloud; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/ccloud/ccloud_windows-amd64_0.1.1.zip -OutFile ccloud.zip; Expand-Archive -Force -Path ccloud.zip; Copy-Item -Force ccloud/ccloud.exe -Destination $env:appdata/ccloud; $Env:PATH += ";$env:appdata/ccloud"; # We recommend adding ";$env:appdata/ccloud" to the Path variable for your system environment. See https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables#saving-changes-to-environment-variables for more information.
~~~
</section>