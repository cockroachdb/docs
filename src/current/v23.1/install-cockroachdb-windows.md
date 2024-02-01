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

See [Release Notes](https://www.cockroachlabs.com/docs/releases/{{page.version.version}}) for what's new in the latest release, {{ page.release_info.version }}. To upgrade to this release from an older version, see [Cluster Upgrade](https://www.cockroachlabs.com/docs/releases/{{page.version.version}}/upgrade-cockroach-version).

{% include cockroachcloud/use-cockroachcloud-instead.md %}

Use one of the options below to install CockroachDB.

<section id="download-the-binary-windows" markdown="1" class="install-option">
<h2 id="install-binary">Download the executable</h2>

  {% include windows_warning.md %}

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

<section id="use-docker-windows" markdown="1" class="install-option">
<h2 id="install-docker">Use Docker</h2>

{{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.{{site.data.alerts.end}}

For CockroachDB v22.2.beta-5 and above, Docker images are <a href="https://docs.docker.com/build/building/multi-platform/">multi-platform images</a> that contains binaries for both Intel and ARM. CockroachDB on ARM systems is <b>experimental</b> and is not yet qualified for production use and not eligible for support or uptime SLA commitments. Multi-platform images do not take up additional space on your Docker host.

Docker images for previous releases contain Intel binaries only. Intel binaries can run on ARM systems, but with a significant reduction in performance.

1. Install <a href="https://docs.docker.com/docker-for-windows/install/">Docker for Windows</a>.

    {{site.data.alerts.callout_success}}
    Docker for Windows requires 64bit Windows 10 Pro and Microsoft Hyper-V. Please see the <a href="https://docs.docker.com/docker-for-windows/install/#what-to-know-before-you-install">official documentation</a> for more details. Note that if your system does not satisfy the stated requirements, you can try using <a href="https://docs.docker.com/toolbox/overview/">Docker Toolbox</a>.
    {{site.data.alerts.end}}

1. In PowerShell, confirm that the Docker daemon is running in the background:

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker version
    ~~~

    If you see an error, start Docker for Windows.

1. <a href="https://docs.docker.com/docker-for-windows/#/shared-drives">Share your local drives</a>. This makes it possible to mount local directories as data volumes to persist node data after containers are stopped or deleted.

1. In PowerShell, pull the image for the {{page.release_info.version}} release of CockroachDB from <a href="https://hub.docker.com/r/{{page.release_info.docker_image}}/" class="win-docker-step3" id="win-docker-step3-{{page.version.version}}" data-eventcategory="win-docker-step3">Docker Hub</a>:

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker pull {{page.release_info.docker_image}}:{{page.release_info.version}}
    ~~~

1. Keep up-to-date with CockroachDB releases and best practices:

    {% include marketo-install.html uid="2" %}

</section>

<h2 id="whats-next">What&#39;s next?</h2>

{% include {{ page.version.version }}/misc/install-next-steps.html %}

{% include {{ page.version.version }}/misc/diagnostics-callout.html %}
