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

You can download and install CockroachDB for Windows in two ways. Either:

- **Recommended**: Visit [Releases]({% link releases/index.md %}?filters=windows) to download CockroachDB. The archive contains the `cockroach.exe` binary. Extract the archive and optionally copy the `cockroach.exe` binary into your `PATH` so you can execute [cockroach commands]({% link {{ page.version.version }}/cockroach-commands.md %}) from any shell. Releases are rolled out gradually, so the latest version may not yet be downloadable.

- Instead of downloading the binary directly, you can use PowerShell to download and install CockroachDB:
    1. Visit [Releases]({% link releases/index.md %}) and make a note of the full version of CockroachDB to install, such as {{ page.version.name }}. Releases are rolled out gradually, so the latest version may not yet be downloadable.
    1. Save the following PowerShell script and replace the following:
        - `{ VERSION }`: the full version of CockroachDB to download, such as `{{ page.version.name }}`. Replace this value in both the `Invoke-WebRequest` statement and the `Copy-Item` statement.
        - `{ INSTALL_DIRECTORY }`: the local file path where the `cockroachdb.exe` executable will be installed. Replace the value in both the `Destination` argument and the `$Env:PATH` statement, which adds the destination directory to your `PATH`.

            {% include_cached copy-clipboard.html %}
            ~~~ powershell
            $ErrorActionPreference = "Stop";
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;$ProgressPreference = 'SilentlyContinue'; $null = New-Item -Type Directory -Force $env:appdata/cockroach;
            Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{ VERSION }.windows-6.2-amd64.zip -OutFile cockroach.zip;
            Expand-Archive -Force -Path cockroach.zip;
            Copy-Item -Force "cockroach/cockroach-{ VERSION }.windows-6.2-amd64/cockroach.exe" -Destination $env:{ INSTALL_DIRECTORY };$Env:PATH += ";$env:{ INSTALL_DIRECTORY }"
            ~~~
    1. Run the PowerShell script. To run a PowerShell script from a file, use syntax like:

        {% include_cached copy-clipboard.html %}
        ~~~ powershell
        powershell.exe -Command "{path_to_script}"
        ~~~
    1. Check that the installation succeeded and that you can run `cockroach` commands:
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach version
        ~~~

</section>

<div id="use-kubernetes" class="install-option">
  <h2 id="install-kubernetes">Use Kubernetes</h2>

  <p>To orchestrate CockroachDB using <a href="https://kubernetes.io/">Kubernetes</a>, use the official <a href="cockroachdb-operator-overview.html#cockroachdb-operator">CockroachDB operator</a>. <p>You can evaluate a CockroachDB Kubernetes deployment on a local machine with <a href="https://minikube.sigs.k8s.io/docs/start/" >minikube</a>.</p>
</div>

<div id="use-docker-windows" markdown="1" class="install-option">
<h2 id="install-docker">Use Docker</h2>

This section shows how to install CockroachDB on a Windows host using Docker. On a Linux or Windows Docker host, the image creates a Linux container.

{{site.data.alerts.callout_danger}}
Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.
{{site.data.alerts.end}}

Docker images are [multi-platform images](https://docs.docker.com/build/building/multi-platform/) that contain binaries for both Intel and ARM. Multi-platform images do not take up additional space on your Docker host.

Intel binaries can run on ARM systems, but with a significant reduction in performance.

1. Install <a href="https://docs.docker.com/docker-for-windows/install/">Docker for Windows</a>.

    {{site.data.alerts.callout_success}}
    Docker for Windows requires 64-bit Windows 10 Pro and Microsoft Hyper-V. Refer to the [official documentation](https://docs.docker.com/docker-for-windows/install/#what-to-know-before-you-install) for more details. If your system does not satisfy the stated requirements, you can try using [Docker Toolbox](https://docs.docker.com/toolbox/overview/).
    {{site.data.alerts.end}}

1. In PowerShell, confirm that Docker is running in the background:

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker version
    ~~~

    If you see an error, verify your Docker for Windows installation, then try again.

1. [Enable synchronized drive sharing](https://docs.docker.com/desktop/synchronized-file-sharing/) so you can mount local directories as data volumes to persist node data after containers are stopped or deleted.

1. <a id="win-docker-step3-{{ page.version.name }}"></a>Visit [Docker Hub](https://hub.docker.com/layers/{{page.release_info.docker_image}}/) and make a note of the full version of CockroachDB to pull. Releases are rolled out gradually, so the latest version may not yet be available. Using the `latest` tag is not recommended; to pull the latest release within a major version, use a tag like `latest-{{ page.version.version }}`. The following command always pulls the `{{ page.version.name }}` image.

    {% include_cached copy-clipboard.html %}
    ~~~ powershell
    docker pull {{ page.release_info.docker_image }}:{{ page.version.name }}
    ~~~

</section>

Keep up-to-date with CockroachDB releases and best practices:

{% include marketo-install.html uid="1" %}

<h2 id="whats-next">What&#39;s next?</h2>

{% include {{ page.version.version }}/misc/install-next-steps.html %}

{% include {{ page.version.version }}/misc/diagnostics-callout.html %}
