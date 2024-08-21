---
title: Install CockroachDB on Windows
summary: Install CockroachDB on Mac, Linux, or Windows. Sign up for product release notes.
tags: download, binary, homebrew
toc: true
key: install-cockroachdb.html
docs_area: deploy
---

<div id="os-tabs" class="clearfix">
    <a href="install-cockroachdb-mac.html"><button id="mac" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button></a>
    <a href="install-cockroachdb-linux.html"><button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button></a>
    <button id="windows" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button>
</div>

{% include cockroachcloud/use-cockroachcloud-instead.md %}

{% include latest-release-details.md %}

{% include windows_warning.md %}

Use one of the options below to install CockroachDB. To upgrade an existing cluster, refer to [Upgrade to {{ page.version.version }}]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}).

<section id="download-the-binary-windows" markdown="1" class="install-option">
<h2 id="install-binary">Download the executable</h2>

1. Using PowerShell, run the following script to download the [CockroachDB {{ page.release_info.version }} archive for Windows](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip) and copy the binary into your `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    $ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;$ProgressPreference = 'SilentlyContinue'; $null = New-Item -Type Directory -Force $env:appdata/cockroach; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip -OutFile cockroach.zip; Expand-Archive -Force -Path cockroach.zip; Copy-Item -Force "cockroach/cockroach-{{ page.release_info.version }}.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach; $Env:PATH += ";$env:appdata/cockroach"
    ~~~

    {{site.data.alerts.callout_success}}
    To run a PowerShell script from a file, use syntax like `powershell.exe -Command "{path_to_script}"`.
    {{site.data.alerts.end}}

    We recommend adding `;$env:appdata/cockroach` to the `PATH` variable for your system environment so you can execute [cockroach commands](cockroach-commands.html) from any shell. See [Microsoft's environment variable documentation](https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_environment_variables#saving-changes-to-environment-variables) for more information.

1. In PowerShell or the Windows terminal, check that the installation succeeded:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach version
    ~~~

1. Keep up-to-date with CockroachDB releases and best practices:

    {% include marketo-install.html uid="1" %}

</section>

<section id="use-kubernetes" markdown="1" class="install-option">
<h2 id="install-kubernetes">Use Kubernetes</h2>

To orchestrate CockroachDB locally using <a href="https://kubernetes.io/">Kubernetes</a>, either with configuration files or the <a href="https://helm.sh/">Helm</a> package manager, see <a href="orchestrate-a-local-cluster-with-kubernetes.html">Orchestrate CockroachDB Locally with Minikube</a>.
</section>

<div id="use-docker-windows" markdown="1" class="install-option">
<h2 id="install-docker">Use Docker</h2>

{% include {{ page.version.version }}/install-docker-steps.md %}

</div>

<h2 id="whats-next">What&#39;s next?</h2>

{% include {{ page.version.version }}/misc/install-next-steps.html %}

{% include {{ page.version.version }}/misc/diagnostics-callout.html %}
