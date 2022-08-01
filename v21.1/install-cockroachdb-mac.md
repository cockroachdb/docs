---
title: Install CockroachDB on Mac
summary: Install CockroachDB on Mac, Linux, or Windows. Sign up for product release notes.
tags: download, binary, homebrew
toc: true
key: install-cockroachdb.html
---

<div id="os-tabs" class="clearfix">
  <button id="mac" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button>
  <a href="install-cockroachdb-linux.html"><button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button></a>
  <a href="install-cockroachdb-windows.html"><button id="windows" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button></a>
</div>

<p>See <a href="../releases/{{page.version.version}}.html" class="mac-releasenotes-download" id="mac-releasenotes-download-{{page.version.version}}" data-eventcategory="mac-releasenotes-download">Release Notes</a> for what's new in the latest release, {{ page.release_info.version }}. To upgrade to this release from an older version, see <a href="upgrade-cockroach-version.html">Cluster Upgrade</a>.</p>

{% include cockroachcloud/use-cockroachcloud-instead.md %}

<h2>Install options</h2>

Use one of the options below to install CockroachDB.

<!-- <div id="use-homebrew" class="install-option">
  <h3>Use Homebrew</h3>
  <ol>
    <li>
      <p><a href="http://brew.sh/">Install Homebrew</a>.</p>
    </li>
    <li>
      <p>Instruct Homebrew to install CockroachDB:</p>

      <div class="copy-clipboard">
        <svg data-eventcategory="mac-homebrew-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code data-eventcategory="mac-homebrew-step2"><span class="nv language-shell mac-homebrew-step2" id="mac-homebrew-step2-{{ page.version.version }}" data-eventcategory="mac-homebrew-step2">$ </span>brew install cockroachdb/tap/cockroach</code></pre></div>
    </li>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
        {% include marketo-install.html uid="1" %}
    </li>
  </ol>
{{site.data.alerts.callout_info}}
If you previously installed CockroachDB via Homebrew, run <code>brew uninstall cockroach</code> before installing the new version. If you installed using a different method, you may need to remove the binary before installing via Homebrew.
{{site.data.alerts.end}}
</div> -->

<div id="download-the-binary" class="install-option">
  <h3>Download the binary</h3>
  <ol>
    <li>
      <p>Download the <a href="https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz" class="mac-binary-step1" id="mac-binary-step1-{{page.version.version}}" data-eventcategory="mac-binary-step1">CockroachDB archive</a> for OS X and the supporting libraries that are used to provide <a href="spatial-features.html">spatial features</a>, and copy the binary into your <code>PATH</code> so you can execute <a href="cockroach-commands.html">cockroach commands</a> from any shell:</p>
      <div class="copy-clipboard">
        <svg data-eventcategory="mac-binary-step1-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code data-eventcategory="mac-binary-step1"><span class="nv language-shell mac-binary-step1" id="mac-binary-step1-{{ page.version.version }}" data-eventcategory="mac-binary-step1">$ </span>curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz | tar -xJ && cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/</code></pre></div>
      <p>If you get a permissions error, prefix the command with <code>sudo</code>.</p>
    </li>
    <div class="bs-callout bs-callout--info"><div class="bs-callout__label">Note:</div>
    <p>If you plan to use CockroachDB's <a href="spatial-features.html">spatial features</a>, you must complete the following steps. Otherwise, your installation is now complete.</p>
    </div>
    <li>
      <p>CockroachDB uses custom-built versions of the <a href="spatial-glossary.html#geos">GEOS</a> libraries. Copy these libraries to one of the locations where CockroachDB expects to find them.</p>
      <p>By default, CockroachDB looks for external libraries in <code>/usr/local/lib/cockroach</code> or a <code>lib</code> subdirectory of the CockroachDB binary&#39;s current directory. If you place these libraries in another location, you must pass the location in the <a href="cockroach-start.html#flags-spatial-libs"><code>--spatial-libs</code> flag to <code>cockroach start</code></a>. The instructions below assume the <code>/usr/local/lib/cockroach</code> location.</p>
      <ol>
        <li><p>Create the directory where the external libraries will be stored:</p>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>
          <div class="highlight"><pre><code class="language-shell" data-lang="shell"><span class="nb">mkdir</span> <span class="nt">-p</span> /usr/local/lib/cockroach</code></pre></div>
        </li>
        <li><p>Copy the library files to the directory:</p>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>
          <div class="highlight"><pre><code class="language-shell" data-lang="shell"><span class="nb">cp </span>-i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/lib/libgeos.dylib /usr/local/lib/cockroach/</code></pre></div>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>
          <div class="highlight"><pre><code class="language-shell" data-lang="shell"><span class="nb">cp </span>-i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/lib/libgeos_c.dylib /usr/local/lib/cockroach/</code></pre></div>
          <p>If you get a permissions error, prefix the command with <code>sudo</code>.</p>
        </li>
      </ol>
    </li>
    <li><p>Verify that CockroachDB can execute spatial queries.</p>
      <ol>
        <li><p>Make sure the <code>cockroach</code> binary you just installed is the one that runs when you type <code>cockroach</code> in your shell:</p>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>

          <div class="highlight"><pre><code class="language-shell" data-lang="shell">which cockroach</code></pre></div>
          <div class="highlight"><pre><code class="language-" data-lang="">/usr/local/bin/cockroach</code></pre></div>
        </li>
        <li><p>Start a temporary, in-memory cluster using <a href="cockroach-demo.html"><code>cockroach demo</code></a>:</p>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>

          <div class="highlight"><pre><code class="language-shell" data-lang="shell">cockroach demo</code></pre></div>

        <li><p>In the demo cluster's interactive SQL shell, run the following command to test that the spatial libraries have loaded properly:</p>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>

          <div class="highlight"><pre><code class="language-sql" data-lang="sql"><span class="o">&gt;</span><span class="k">SELECT</span> <span class="n">ST_IsValid</span><span class="p">(</span><span class="n">ST_MakePoint</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span><span class="mi">2</span><span class="p">));</span></code></pre></div>
          <p>You should see the following output:</p>
          <div class="highlight"><pre><code class="language-" data-lang="">  st_isvalid
--------------
true
(1 row)</code></pre></div>
          <p>If your <code>cockroach</code> binary is not properly accessing the dynamically linked C libraries in <code>/usr/local/lib/cockroach</code>, it will output an error message like the one below.</p>
          <div class="highlight"><pre><code class="language-" data-lang="">ERROR: st_isvalid(): geos: error during GEOS init: geos: cannot load GEOS from dir "/usr/local/lib/cockroach": failed to execute dlopen
          Failed running "sql"</code></pre></div>
        </li>
      </ol>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
{% include marketo-install.html uid="1" %}
    </li>
  </ol>
</div>

<div id="use-kubernetes" class="install-option">
  <h3>Use Kubernetes</h3>

  <p>To orchestrate CockroachDB locally using <a href="https://kubernetes.io/">Kubernetes</a>, either with configuration files or the <a href="https://helm.sh/">Helm</a> package manager, see <a href="orchestrate-a-local-cluster-with-kubernetes.html">Orchestrate CockroachDB Locally with Minikube</a>.</p>
</div>

<div id="use-docker" class="install-option">
  <h3>Use Docker</h3>

  {{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.{{site.data.alerts.end}}

  <ol>
    <li>
      <p>Install <a href="https://docs.docker.com/docker-for-mac/install/">Docker for Mac</a>. Please carefully check that you meet all prerequisites.</p>
    </li>
    <li>
      <p>Confirm that the Docker daemon is running in the background:</p>

      <div class="copy-clipboard">
        <svg data-eventcategory="mac-docker-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code data-eventcategory="mac-docker-step2"><span class="nv language-shell mac-docker-step2" id="mac-docker-step2-{{ page.version.version }}" data-eventcategory="mac-docker-step2">$ </span>docker version</code></pre></div>
      <p>If you do not see the server listed, start the <strong>Docker</strong> daemon.</p>
    </li>
    <li>
      <p>Pull the image for the {{page.release_info.version}} release of CockroachDB from <a href="https://hub.docker.com/r/{{page.release_info.docker_image}}/" class="mac-docker-step3" id="mac-docker-step3-{{page.version.version}}" data-eventcategory="mac-docker-step3">Docker Hub</a>:</p>

      <div class="copy-clipboard">
        <svg data-eventcategory="mac-docker-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code data-eventcategory="mac-docker-step3"><span class="nv language-shell mac-docker-step3" id="mac-docker-step3-{{ page.version.version }}" data-eventcategory="mac-docker-step3">$ </span>docker pull {{page.release_info.docker_image}}:{{page.release_info.version}}</code></pre>
      </div>
    </li>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
{% include marketo-install.html uid="2" %}
    </li>
  </ol>
</div>

<div id="build-from-source" class="install-option">
  <h3>Build from source</h3>
  <ol>
    <li>
      <p>Install the following prerequisites, as necessary:</p>

      <table>
        <tr>
          <td>C++ compiler</td>
          <td>Must support C++ 11. GCC prior to 6.0 does not work due to <a href="https://gcc.gnu.org/bugzilla/show_bug.cgi?id=48891">this issue</a>. On macOS, Xcode should suffice.</td>
        </tr>
        <tr>
          <td>Go</td>
          <td>Version 1.15.11+ is required. Older versions might work via <code>make build IGNORE_GOVERS=1</code>.</td>
        </tr>
        <tr>
          <td>Bash</td>
          <td>Versions 4+ are preferred, but later releases from the 3.x series are also known to work.</td>
        </tr>
        <tr>
          <td>CMake</td>
          <td>Versions 3.17.0+ are known to work.</td>
        </tr>
        <tr>
          <td>Autoconf</td>
          <td>Version 2.68+ is required.</td>
        </tr>
      </table>
      <p>A 64-bit system is strongly recommended. Building or running CockroachDB on 32-bit systems has not been tested. You'll also need at least 2GB of RAM. If you plan to run our test suite, you'll need closer to 4GB of RAM.</p>
    </li>
    <li>
      <p>Download the <a href="https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.src.tgz" class="mac-source-download" id="mac-source-download-{{page.version.version}}" data-eventcategory="mac-source-download">CockroachDB {{ page.release_info.version }} source archive</a>, and extract the sources:</p>

      <div class="copy-clipboard">
        <svg data-eventcategory="mac-source-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code data-eventcategory="mac-source-download"><span class="nv language-shell mac-source-download" id="mac-source-download-{{ page.version.version }}" data-eventcategory="mac-source-download">$ </span>curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.src.tgz | tar -xz</code></pre></div>
    </li>
    <li><p>In the extracted directory, run <code>make build</code>:</p>

      {% include_cached copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="nv language-shell"></span><span class="nb">cd </span>cockroach-{{ page.release_info.version }}</code></pre></div>

      {% include_cached copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="nv language-shell"></span>make build</code></pre></div>

      <p>The build process can take 10+ minutes, so please be patient.</p>
    </li>
    <li>
    <p>Install the <code>cockroach</code> binary into <code>/usr/local/bin/</code> so it's easy to execute <a href="cockroach-commands.html"><code>cockroach</code> commands</a> from any directory:</p>

    {% include_cached copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="nv language-shell"></span>make install</code></pre></div>
    <p>If you get a permissions error, prefix the command with <code>sudo</code>.</p>

    <p>You can also execute the <code>cockroach</code> binary directly from its built location, <code>./src/github.com/cockroachdb/cockroach/cockroach</code>, but the rest of the documentation assumes you have the binary on your <code>PATH</code>.</p>
    </li>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
{% include marketo-install.html uid="3" %}
    </li>
  </ol>
</div>

<h2 id="whats-next">What&#39;s next?</h2>

{% include {{ page.version.version }}/misc/install-next-steps.html %}

{% include {{ page.version.version }}/misc/diagnostics-callout.html %}
