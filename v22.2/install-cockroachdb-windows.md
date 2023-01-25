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

<p>See <a href="../releases/{{page.version.version}}.html" class="mac-releasenotes-download" id="mac-releasenotes-download-{{page.version.version}}" data-eventcategory="mac-releasenotes-download">Release Notes</a> for what's new in the latest release, {{ page.release_info.version }}. To upgrade to this release from an older version, see <a href="upgrade-cockroach-version.html">Cluster Upgrade</a>.</p>

{% include cockroachcloud/use-cockroachcloud-instead.md %}

Use one of the options below to install CockroachDB.

<div id="download-the-binary-windows" class="install-option">
  <h2 id="install-binary">Download the executable</h2>

  {% include windows_warning.md %}

  <ol>
    <li>
      <p>Use PowerShell to download the <a href="https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip" class="windows-binary-download" id="windows-binary-download-{{page.version.version}}" data-eventcategory="windows-binary-download">CockroachDB {{ page.release_info.version }} archive for Windows</a> and copy the binary into your <code>PATH</code>:<p>
      <div class="copy-clipboard">
        <svg data-eventcategory="windows-binary-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code><span class="nb">PS </span>$ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;$ProgressPreference = 'SilentlyContinue'; $null = New-Item -Type Directory -Force $env:appdata/cockroach; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip -OutFile cockroach.zip; Expand-Archive -Force -Path cockroach.zip; Copy-Item -Force "cockroach/cockroach-{{ page.release_info.version }}.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach; $Env:PATH += ";$env:appdata/cockroach"</code></pre></div>
      <p>We recommend adding <code>;$env:appdata/cockroach</code> to the <code>PATH</code> variable for your system environment so you can execute <a href="cockroach-commands.html">cockroach commands</a> from any shell. See <a href="https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables#saving-changes-to-environment-variables">Microsoft's environment variable documentation</a> for more information.</p>
    </li>
    <li>
      <p>Run the following command to make sure the installation succeeded:<p>
      <div class="copy-clipboard">
        <svg data-eventcategory="windows-binary-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code><span class="nb">PS </span>cockroach version</code></pre></div>
    </li>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
{% include marketo-install.html uid="1" %}
    </li>
  </ol>
</div>

<div id="use-kubernetes" class="install-option">
  <h2 id="install-kubernetes">Use Kubernetes</h2>

  <p>To orchestrate CockroachDB locally using <a href="https://kubernetes.io/">Kubernetes</a>, either with configuration files or the <a href="https://helm.sh/">Helm</a> package manager, see <a href="orchestrate-a-local-cluster-with-kubernetes.html">Orchestrate CockroachDB Locally with Minikube</a>.</p>
</div>

<div id="use-docker-windows" class="install-option">
  <h2 id="install-docker">Use Docker</h2>

  {{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.{{site.data.alerts.end}}

  <p>For CockroachDB v22.2.beta-5 and above, Docker images are <a href="https://docs.docker.com/build/building/multi-platform/">multi-platform images</a> that contains binaries for both Intel and ARM. CockroachDB on ARM systems is <b>experimental</b> and is not yet qualified for production use. Multi-platform images do not take up additional space on your Docker host.</p><p>Docker images for previous releases contain Intel binaries only. Intel binaries can run on ARM systems, but with a significant reduction in performance.</p>

  <ol>
    <li>
      <p>Install <a href="https://docs.docker.com/docker-for-windows/install/">Docker for Windows</a>.</p>
      <div class="bs-callout bs-callout-info">Docker for Windows requires 64bit Windows 10 Pro and Microsoft Hyper-V. See the <a href="https://docs.docker.com/docker-for-windows/install/#what-to-know-before-you-install">official documentation</a> for more details. Note that if your system does not satisfy the stated requirements, you can try using <a href="https://docs.docker.com/toolbox/overview/">Docker Toolbox</a>.</div>
    </li>
    <li>
      <p>Open PowerShell and confirm that the Docker daemon is running in the background:</p>

      <div class="copy-clipboard">
        <svg data-eventcategory="windows-docker-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code><span class="nb">PS </span>C:\Users\username&gt; docker version</code></pre></div>

      <p>If you do not see the server listed, start <strong>Docker for Windows</strong>.</p>
    </li>
    <li>
      <p><a href="https://docs.docker.com/docker-for-windows/#/shared-drives">Share your local drives</a>. This makes it possible to mount local directories as data volumes to persist node data after containers are stopped or deleted.</p>
    </li>
    <li>
      <p>Pull the image for the {{page.release_info.version}} release of CockroachDB from <a href="https://hub.docker.com/r/{{page.release_info.docker_image}}/" class="win-docker-step3" id="win-docker-step3-{{page.version.version}}" data-eventcategory="win-docker-step3">Docker Hub</a>:</p>

      <div class="copy-clipboard">
        <svg data-eventcategory="windows-docker-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code data-eventcategory="win-docker-step3"><span class="nb win-docker-step3" id="win-docker-step3-{{ page.version.version }}" data-eventcategory="win-docker-step3">PS </span>C:\Users\username&gt; docker pull {{page.release_info.docker_image}}:{{page.release_info.version}}</code></pre></div>
    </li>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
{% include marketo-install.html uid="2" %}
    </li>
  </ol>
</div>

<h2 id="whats-next">What&#39;s next?</h2>

{% include {{ page.version.version }}/misc/install-next-steps.html %}

{% include {{ page.version.version }}/misc/diagnostics-callout.html %}
