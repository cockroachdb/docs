---
title: Install CockroachDB on Mac
summary: Install CockroachDB on Mac, Linux, or Windows. Sign up for product release notes.
tags: download, binary, homebrew
toc: true
key: install-cockroachdb.html
docs_area: deploy
---

<div id="os-tabs" class="clearfix">
  <button id="mac" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button>
  <a href="install-cockroachdb-linux.html"><button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button></a>
  <a href="install-cockroachdb-windows.html"><button id="windows" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button></a>
</div>

{% include cockroachcloud/use-cockroachcloud-instead.md %}

{% include latest-release-details.md %}

{% capture arch_note_homebrew %}<p>For CockroachDB v22.2.x and above, Homebrew installs binaries for your system architecture, either Intel or ARM (<a href="https://support.apple.com/HT211814">Apple Silicon</a>).</p><p>For previous releases, Homebrew installs Intel binaries. Intel binaries can run on ARM systems, but with a significant reduction in performance. CockroachDB on ARM for macOS is <b>experimental</b> and is not yet qualified for production use and not eligible for support or uptime SLA commitments.</p>{% endcapture %}

{% capture arch_note_binaries %}<p>For CockroachDB v22.2.x and above, download the binaries for your system architecture, either Intel or ARM (<a href="https://support.apple.com/en-us/HT211814">Apple Silicon</a>).</p><p>For previous releases, download Intel binaries. Intel binaries can run on ARM systems, but with a significant reduction in performance. CockroachDB on ARM for macOS is <b>experimental</b> and is not yet qualified for production use and not eligible for support or uptime SLA commitments.</p>{% endcapture %}

{{site.data.alerts.callout_info}}
CockroachDB on macOS is experimental and not suitable for production deployments.
{{site.data.alerts.end}}

Use one of the options below to install CockroachDB. To upgrade an existing cluster, refer to [Upgrade to {{ page.version.version }}]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}). For limitations specific to geospatial features, refer to [Limitations](#limitations).

<div id="use-homebrew" markdown="1" class="install-option">

  <h2 id="install-homebrew">Use Homebrew</h2>
  {{ arch_note_homebrew }}
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
{{site.data.alerts.callout_success}}
If you previously installed CockroachDB via Homebrew, you can [upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) the CockroachDB binary to the next major version or to a patch version using HomeBrew. After updating the binary on each node, restart the `cockroach` process on the node. When upgrading to a new major version, you must complete additional steps to [finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade. If you need to upgrade through multiple major versions, you must complete each major-version upgrade separately, including finalizing the upgrade, before beginning the next one.

Before starting the upgrade, review the [release notes]({% link releases/{{ page.version.version }}.md %}), including temporary limitations during the upgrade.

To upgrade CockroachDB via HomeBrew:

{% include_cached copy-clipboard.html %}
~~~ shell
brew update
~~~
~~~ shell
brew update
brew upgrade cockroach
~~~
{{site.data.alerts.end}}
</div>

{% capture binary_arm_geos_unquarantine %}
{% include_cached copy-clipboard.html %}
~~~ shell
xattr -d com.apple.quarantine lib/libgeos*
~~~
{% endcapture %}

{% capture st_invalid_output %}
~~~ shell
st_isvalid
--------------
true
(1 row)
~~~
{% endcapture %}

<div id="download-the-binary" class="install-option">
  <a id="install-the-binary"></a><h2 id="install-binary">Download the binary</h2>
  {{ arch_note_binaries }}
  <ol>
    <li>
      <p>Visit <a href="/docs/releases/index.html">Releases</a> to download the CockroachDB archive for the architecture of your macOS host. The archive contains the <code>cockroach</code> binary and the supporting libraries that are used to provide <a href="spatial-data-overview.html">spatial features</a>.</p>
      <p>You can download the binary using a web browser or you can copy the link and use a utility like <code>curl</code> to download it. If you download the ARM binary using a web browser and you plan to use CockroachDB&apos;s spatial features, an additional step is required before you can install the library, as outlined in the next step.</p>
      <p>Extract the archive and optionally copy the <code>cockroach</code> binary into your <code>PATH</code> so you can execute <a href="cockroach-commands.html">cockroach commands</a> from any shell. If you get a permission error, use <code>sudo</code>.</p>
      <div class="bs-callout bs-callout--info"><div class="bs-callout__label">Note:</div>
        <p>If you plan to use CockroachDB&apos;s <a href="spatial-data-overview.html">spatial features</a>, you must complete all of the following steps. Otherwise, your installation is now complete.</p>
      </div>
    </li>
    <li>
      <p>CockroachDB uses custom-built versions of the <a href="architecture/glossary.html#geos">GEOS</a> libraries. To install those libraries:</p>
      <ol>
        <li><p>Note that <a href="spatial-data-overview.html#known-limitations">spatial features are currently disabled for Mac ARM users</a>, for whom these steps do not apply. For an upcoming patch release where this functionality is reenabled, if you downloaded the CockroachDB ARM binary archive using a web browser, macOS flags the GEOS libraries in the extracted archive as quarantined. This flag must be removed before CockroachDB can use the libraries. To remove the quarantine flag from the libraries:</p>
        {{ binary_arm_geos_unquarantine }}
        <p>This step is not required for Intel systems.</p></li>
        <li>Copy these libraries to one of the locations where CockroachDB expects to find them. By default, CockroachDB looks for external libraries in <code>/usr/local/lib/cockroach</code> or a <code>lib</code> subdirectory of the CockroachDB binary&#39;s current directory. If you place these libraries in another location, you must pass the location in the <a href="cockroach-start.html#flags-spatial-libs"><code>--spatial-libs</code> flag to <code>cockroach start</code></a>. The instructions below assume the <code>/usr/local/lib/cockroach</code> location.
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
        </li>
        <li><p>In the demo cluster&apos;s interactive SQL shell, run the following command to test that the spatial libraries have loaded properly:</p>
          <div class="copy-clipboard">
            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
            <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
          </div>
          <div class="highlight"><pre><code class="language-sql" data-lang="sql"><span class="o">&gt;</span> <span class="k">SELECT</span> <span class="n">ST_IsValid</span><span class="p">(</span><span class="n">ST_MakePoint</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span><span class="mi">2</span><span class="p">));</span></code></pre></div>
          <p>You should see the following output:</p>
          {{ st_invalid_output }}
          <p>If your <code>cockroach</code> binary is not properly accessing the dynamically linked C libraries in <code>/usr/local/lib/cockroach</code>, it will output an error message like the one below.</p>
          <div class="highlight"><pre><code class="language-" data-lang="">ERROR: st_isvalid(): geos: error during GEOS init: geos: cannot load GEOS from dir "/usr/local/lib/cockroach": failed to execute dlopen
          Failed running "sql"</code></pre></div>
        </li>
      </ol>
    <li>
      <p>Keep up-to-date with CockroachDB releases and best practices:</p>
{% include marketo-install.html uid="2" %}
    </li>
  </ol>
</div>

<div id="use-kubernetes" class="install-option">
  <h2 id="install-kubernetes">Use Kubernetes</h2>

  <p>To orchestrate CockroachDB locally using <a href="https://kubernetes.io/">Kubernetes</a>, either with configuration files or the <a href="https://helm.sh/">Helm</a> package manager, see <a href="orchestrate-a-local-cluster-with-kubernetes.html">Orchestrate CockroachDB Locally with Minikube</a>.</p>
</div>

<div id="use-docker" markdown="1" class="install-option">
<h2 id="install-docker">Use Docker</h2>

{% include {{ page.version.version }}/install-docker-steps.md %}

</div>

<div id="build-from-source" class="install-option">
  <h2 id="install-source">Build from source</h2>
  <p>See the <a href="https://wiki.crdb.io/wiki/spaces/CRDB/pages/181338446/Getting+and+building+CockroachDB+from+source">public wiki</a> for guidance. When building on the ARM architecture, refer to <a href="#limitations">Limitations</a>.</p>
</div>

<h2 id="limitations">Limitations</h2>

CockroachDB runtimes built for the ARM architecture have the following limitations:

- CockroachDB on ARM for macOS is <b>experimental</b> and is not yet qualified for production use and not eligible for support or uptime SLA commitments.
- Clusters with a mix of Intel and ARM nodes are untested. Cockroach Labs recommends that all cluster nodes have identical CockroachDB versions, hardware, and software.
- Floating point operations may yield different results on ARM than on Intel, particularly [Fused Multiply Add (FMA) intrinsics](https://developer.arm.com/documentation/dui0375/g/Compiler-specific-Features/Fused-Multiply-Add--FMA--intrinsics).
- When [building from source](#install-source) on ARM, consider disabling FMA intrinsics in your compiler. For GCC, refer to [Options That Control Optimization](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) in the GCC documentation.

<h2 id="whats-next">What&#39;s next?</h2>

{% include {{ page.version.version }}/misc/install-next-steps.html %}

{% include {{ page.version.version }}/misc/diagnostics-callout.html %}

## Limitations

{% comment %}v22.2.0+{% endcomment %}

On macOS ARM systems, [spatial features]({% link {{ page.version.version }}/spatial-data-overview.md %}) are disabled due to an issue with macOS code signing for the <a href="https://libgeos.org/">GEOS</a> libraries. Users needing spatial features on an ARM Mac may instead [run the Intel binary](#install-the-binary) or use the[Docker container image](#use-docker). Refer to [GitHub issue #93161](https://github.com/cockroachdb/cockroach/issues/93161)</a> for more information.
