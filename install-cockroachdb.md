---
title: Install CockroachDB
summary: Simple instructions for installing CockroachDB on Mac, Linux, or Windows.
toc: false
---

<script>
$(document).ready(function(){
    
    //detect os and display corresponding tab by default
    if (navigator.appVersion.indexOf("Mac")!=-1) { 
        $('#os-tabs').find('button').removeClass('current');
        $('#mac').addClass('current');
        toggleMac(); 
    }
    if (navigator.appVersion.indexOf("Linux")!=-1) { 
        $('#os-tabs').find('button').removeClass('current');
        $('#linux').addClass('current');
        toggleLinux(); 
    }
    if (navigator.appVersion.indexOf("Win")!=-1) { 
        $('#os-tabs').find('button').removeClass('current');
        $('#windows').addClass('current');
        toggleWindows(); 
    }

    var install_option = $('.install-option'), 
        install_button = $('.install-button');

    install_button.on('click', function(e){
      e.preventDefault();
      var hash = $(this).prop("hash");

      install_button.removeClass('current');
      $(this).addClass('current');
      install_option.hide();
      $(hash).show();

    });

    //handle click event for os-tab buttons
    $('#os-tabs').on('click', 'button', function(){
        $('#os-tabs').find('button').removeClass('current');
        $(this).addClass('current');

        if($(this).is('#mac')){ toggleMac(); }
        if($(this).is('#linux')){ toggleLinux(); }
        if($(this).is('#windows')){ toggleWindows(); }
    });

    function toggleMac(){
        $(".mac-button:first").trigger('click');
        $("#macinstall").show();
        $("#linuxinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleLinux(){
        $(".linux-button:first").trigger('click');
        $("#linuxinstall").show();
        $("#macinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleWindows(){
        $("#windowsinstall").show();
        $("#macinstall").hide();
        $("#linuxinstall").hide(); 
    }
});
</script>

<div id="os-tabs" class="clearfix">
    <button id="mac" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button>
    <button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button>
    <button id="windows" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button>
</div>

<div id="macinstall">
<p>There are four ways to install CockroachDB on Mac OS X. See <a href="{{site.data.strings.version}}.html">Release Notes</a> for what's new in the latest version. </p>

<div id="mac-installs" class="clearfix">
<a href="#download-the-binary" class="install-button mac-button current" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-binary">Download the <div class="c2a">Binary</div></a>
<a href="#use-homebrew" class="install-button mac-button" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-homebrew">Use <div class="c2a">Homebrew</div></a>
<a href="#build-from-source" class="install-button mac-button" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-source">Build from <div class="c2a">Source</div></a>
<a href="#use-docker" class="install-button mac-button" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-docker">Use <div class="c2a">Docker</div></a>
</div>

<div id="download-the-binary" class="install-option">
  <h2>Download the Binary</h2>

  <ol>
    <li>
      <p>Download the latest <a href="https://binaries.cockroachdb.com/cockroach-latest.darwin-10.9-amd64.tgz" data-eventcategory="mac-binary-step1">CockroachDB tarball for OS X</a>.</p>
    </li>
    <li>
      <p>Extract the binary:</p>

      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-binary-step2"><span class="gp" data-eventcategory="mac-binary-step2">$ </span>tar xfz cockroach-latest.darwin-10.9-amd64.tgz</code></pre>
      </div>
    </li>
    <li>
      <p>Add the directory containing the binary to your <code>PATH</code>. This makes it easy to execute <a href="cockroach-commands.html">cockroach commands</a> from any shell.</p>
    </li>
    <li>
      <p>Make sure CockroachDB installed successfully:</p>
    
      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-binary-step4"><span class="gp" data-eventcategory="mac-binary-step4">$ </span>cockroach version</code></pre></div>
    </li>
    <li>
      <p>Get future release notes emailed to you:</p>
      <div class="hubspot-install-form install-form-1 clearfix">
        <script>
          hbspt.forms.create({ 
            css: '',
            cssClass: 'install-form',
            portalId: '1753393',
            formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
            formInstanceId: 1,
            target: '.install-form-1'
          });
        </script>
      </div>
    </li>
  </ol>
</div>

<div id="use-homebrew" class="install-option" style="display: none;">
  <h2>Use Homebrew</h2>

  <ol>
    <li>
      <p><a href="http://brew.sh/">Install Homebrew</a>.</p>
    </li>
    <li>
      <p>Run our brew recipe to get the CockroachDB code and build the binary:</p>

      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-homebrew-step2"><span class="gp" data-eventcategory="mac-homebrew-step2">$ </span>brew install https://raw.githubusercontent.com/cockroachdb/cockroach/master/build/cockroach.rb</code></pre>
      </div>
    </li>
    <li>
      <p>Make sure CockroachDB installed successfully:</p>
    
      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-homebrew-step3"><span class="gp" data-eventcategory="mac-homebrew-step3">$ </span>cockroach version</code></pre></div>
    </li>
    <li>
      <p>Get future release notes emailed to you:</p>
      <div class="hubspot-install-form install-form-2 clearfix">
        <script>
          hbspt.forms.create({ 
            css: '',
            cssClass: 'install-form',
            portalId: '1753393',
            formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
            formInstanceId: 2,
            target: '.install-form-2'
          });
        </script>
      </div>
    </li>
  </ol>
</div>

<div id="build-from-source" class="install-option" style="display: none;">
<h2>Build from Source</h2>
<ol>
  <li>
    <p>Install the following prerequisites, as necessary:</p>

    <ul>
      <li>
        <p>A C++ compiler that supports C++11. Note that GCC prior to 6.0 does not work due to <a href="https://gcc.gnu.org/bugzilla/show_bug.cgi?id=48891">this issue</a>. On Mac OS X, Xcode should suffice.</p>
      </li>
      <li>
        <p>A <a href="http://golang.org/doc/code.html">Go environment</a> with a recent 64-bit version of the toolchain. The Makefile enforces the specific version required, as it is updated frequently. Be sure to set the <code class="highlighter-rouge">$GOPATH</code> and <code class="highlighter-rouge">$PATH</code> environment variables as described <a href="https://golang.org/doc/code.html#GOPATH">here</a>.</p>
      </li>
      <li>
        <p>Git 1.8+</p>
      </li>
      <li>
        <p><a href="https://www.gnu.org/software/bash/">Bash</a></p>
      </li>
    </ul>
    <p>Note that at least 2GB of RAM is required to build from source. If you plan to run our test suite as well, you'll need closer to 4GB of RAM.</p>
  </li>
  <li>
    <p>Get the CockroachDB code:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-source-step2"><span class="gp" data-eventcategory="mac-source-step2">$ </span>go get -d github.com/cockroachdb/cockroach</code></pre></div>
  </li>
  <li>
    <p>Compile the CockroachDB binary:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-source-step3"><span class="gp" data-eventcategory="mac-source-step3">$ </span><span class="nb">cd</span> <span class="nv">$GOPATH</span>/src/github.com/cockroachdb/cockroach<br>$ git checkout {{site.data.strings.version}}<br><span class="gp">$ </span>make install</code></pre></div>

    <p>The first time you run <code class="highlighter-rouge">make install</code>, it can take awhile to download and install various dependencies.</p>
  </li>
  <li>
    <p>The <code class="highlighter-rouge">make install</code> command puts the binary in <code class="highlighter-rouge"><span class="nv">$GOPATH</span>/bin</code>. Add this directory to your <code class="highlighter-rouge">PATH</code>, if it isn't already there. This makes it easy to execute <a href="cockroach-commands.html">cockroach commands</a> from any shell.</p>
  </li>
  <li>
    <p>Make sure CockroachDB installed successfully:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-source-step5"><span class="gp" data-eventcategory="mac-source-step5">$ </span>cockroach version</code></pre></div>
  </li>
  <li>
    <p>Get future release notes emailed to you:</p>
    <div class="hubspot-install-form install-form-3 clearfix">
      <script>
        hbspt.forms.create({ 
          css: '',
          cssClass: 'install-form',
          portalId: '1753393',
          formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
          formInstanceId: 3,
          target: '.install-form-3'
        });
      </script>
    </div>
  </li>
</ol>
</div>

<div id="use-docker" class="install-option" style="display: none;">
<h2>Use Docker</h2>

{{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.{{site.data.alerts.end}}

<ol>
  <li>
    <p>Install <a href="https://docs.docker.com/docker-for-mac/">Docker for Mac</a>. Please carefully check that you meet all prerequisites.</p>
  </li>
  <li>
    <p>Confirm that the Docker daemon is running in the background:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code>$ docker version</code></pre>
    </div>
    <p>If you don't see the server listed, start the <strong>Docker</strong> application.</p>
  </li>
  <li>
    <p>Pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/" data-eventcategory="mac-docker-step3">Docker Hub</a>:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-docker-step3"><span class="gp" data-eventcategory="mac-docker-step3">$ </span>docker pull cockroachdb/cockroach:{{site.data.strings.version}}</code></pre>
    </div>
  </li>
  <li>
    <p>Make sure CockroachDB installed successfully:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="mac-docker-step4"><span class="gp" data-eventcategory="mac-docker-step4">$ </span>docker run --rm cockroachdb/cockroach:{{site.data.strings.version}} version</code></pre></div>
  </li>
  <li>
    <p>Get future release notes emailed to you:</p>
    <div class="hubspot-install-form install-form-4 clearfix">
      <script>
        hbspt.forms.create({ 
          css: '',
          cssClass: 'install-form',
          portalId: '1753393',
          formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
          formInstanceId: 4,
          target: '.install-form-4'
        });
      </script>
    </div>
  </li>
</ol>
</div>
<h2 id="whats-next">What's Next?</h2>

<p><a href="start-a-local-cluster.html">Quick start</a> a single- or multi-node cluster locally and talk to it via the built-in SQL client.</p>
</div>

<div id="linuxinstall" style="display: none;">
<p>There are three ways to install CockroachDB on Linux. See <a href="{{site.data.strings.version}}.html">Release Notes</a> for what's new in the latest version.</p>

<div id="linux-installs" class="clearfix">    
<a href="#download-the-binary-linux" class="install-button linux-button current" data-eventcategory="buttonClick-doc-install" data-eventaction="linux-binary" data-eventlabel="">Download the <div class="c2a">Binary</div></a>
<a href="#build-from-source-linux" class="install-button linux-button" data-eventcategory="buttonClick-doc-install" data-eventaction="linux-source">Build from <div class="c2a">Source</div></a>
<a href="#use-docker-linux" class="install-button linux-button" data-eventcategory="buttonClick-doc-install" data-eventaction="linux-docker">Use <div class="c2a">Docker</div></a>
</div>

<div id="download-the-binary-linux" class="install-option"> 
  <h2>Download the Binary</h2>

  <ol>
    <li>
      <p>Download the latest <a href="https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz" data-eventcategory="linux-binary-step1">CockroachDB tarball for Linux</a>.</p>
    </li>
    <li>
      <p>Extract the binary:</p>

      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-binary-step2"><span class="gp" data-eventcategory="linux-binary-step2">$ </span>tar xfz cockroach-latest.linux-amd64.tgz</code></pre>
      </div>
    </li>
    <li>
      <p>Add the directory containing the binary to your <code>PATH</code>. This makes it easy to execute <a href="cockroach-commands.html">cockroach commands</a> from any shell.</p>
    </li>
    <li>
      <p>Make sure CockroachDB installed successfully:</p>

      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-binary-step3"><span class="gp" data-eventcategory="linux-binary-step3">$ </span>cockroach version</code></pre></div>
    </li>
    <li>
      <p>Get future release notes emailed to you:</p>
      <div class="hubspot-install-form install-form-5 clearfix">
        <script>
          hbspt.forms.create({ 
            css: '',
            cssClass: 'install-form',
            portalId: '1753393',
            formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
            formInstanceId: 5,
            target: '.install-form-5'
          });
        </script>
      </div>
    </li>
  </ol>
</div>

<div id="build-from-source-linux" class="install-option" style="display: none;">
<h2>Build from Source</h2>
<ol>
  <li>
    <p>Install the following prerequisites, as necessary:</p>

    <ul>
      <li>
        <p>A C++ compiler that supports C++11. Note that GCC prior to 6.0 does not work due to <a href="https://gcc.gnu.org/bugzilla/show_bug.cgi?id=48891">this issue</a>.</p>
      </li>
      <li>
        <p>A <a href="http://golang.org/doc/code.html">Go environment</a> with a recent 64-bit version of the toolchain. The Makefile enforces the specific version required, as it is updated frequently. Be sure to set the <code class="highlighter-rouge">$GOPATH</code> and <code class="highlighter-rouge">$PATH</code> environment variables as described <a href="https://golang.org/doc/code.html#GOPATH">here</a>.</p>
      </li>
      <li>
        <p>Git 1.8+</p>
      </li>
      <li>
        <p><a href="https://www.gnu.org/software/bash/">Bash</a></p>
      </li>
    </ul>
    <p>Note that at least 2GB of RAM is required to build from source. If you plan to run our test suite as well, you'll need closer to 4GB of RAM.</p>
  </li>
  <li>
    <p>Get the CockroachDB code:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-source-step2"><span class="gp" data-eventcategory="linux-source-step2">$ </span>go get -d github.com/cockroachdb/cockroach</code></pre></div>
  </li>
  <li>
    <p>Compile the CockroachDB binary:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-source-step3"><span class="gp" data-eventcategory="linux-source-step3">$ </span><span class="nb" data-eventcategory="linux-source-step3">cd</span> <span class="nv" data-eventcategory="linux-source-step3">$GOPATH</span>/src/github.com/cockroachdb/cockroach<br>$ git checkout {{site.data.strings.version}}<br><span class="gp">$ </span>make install</code></pre></div>

    <p>The first time you run <code class="highlighter-rouge">make install</code>, it can take awhile to download and install various dependencies.</p>
  </li>
  <li>
    <p>The <code class="highlighter-rouge">make install</code> command puts the binary in <code class="highlighter-rouge"><span class="nv">$GOPATH</span>/bin</code>. Add this directory to your <code class="highlighter-rouge">PATH</code>, if it isn't already there. This makes it easy to execute <a href="cockroach-commands.html">cockroach commands</a> from any shell.</p>
  </li>
  <li>
      <p>Make sure CockroachDB installed successfully:</p>

      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-source-step5"><span class="gp" data-eventcategory="linux-source-step5">$ </span>cockroach version</code></pre></div>
  </li>
  <li>
      <p>Get future release notes emailed to you:</p>
      <div class="hubspot-install-form install-form-6 clearfix">
        <script>
          hbspt.forms.create({ 
            css: '',
            cssClass: 'install-form',
            portalId: '1753393',
            formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
            formInstanceId: 6,
            target: '.install-form-6'
          });
        </script>
      </div>
    </li>
</ol>
</div>

<div id="use-docker-linux" class="install-option" style="display: none;">
<h2>Use Docker</h2>

{{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.{{site.data.alerts.end}}

<ol>
  <li>
    <p>Install <a href="https://docs.docker.com/engine/installation/linux/ubuntulinux/">Docker for Linux</a>. Please carefully check that you meet all prerequisites.</p>
  </li>
  <li>
    <p>Confirm that the Docker daemon is running in the background:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code>$ sudo docker version</code></pre>
    </div>
    <p>If you don't see the server listed, start the Docker daemon. </p>

    <div class="bs-callout bs-callout-info">On Linux, Docker needs sudo privileges.</div>
  </li>
  <li>
    <p>Pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/" data-eventcategory="linux-docker-step3">Docker Hub</a>:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-docker-step3"><span class="gp" data-eventcategory="linux-docker-step3">$ </span>sudo docker pull cockroachdb/cockroach:{{site.data.strings.version}}</code></pre>
    </div>
  </li>
  <li>
      <p>Make sure CockroachDB installed successfully:</p>

      <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-docker-step4"><span class="gp" data-eventcategory="linux-docker-step4">$ </span>sudo docker run --rm cockroachdb/cockroach:{{site.data.strings.version}} version</code></pre></div>
  </li>
  <li>
    <p>Get future release notes emailed to you:</p>
    <div class="hubspot-install-form install-form-7 clearfix">
      <script>
        hbspt.forms.create({ 
          css: '',
          cssClass: 'install-form',
          portalId: '1753393',
          formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
          formInstanceId: 7,
          target: '.install-form-7'
        });
      </script>
    </div>
  </li>
</ol>
</div>
<h2 id="whats-next">What's Next?</h2>

<p><a href="start-a-local-cluster.html">Quick start</a> a single- or multi-node cluster locally and talk to it via the built-in SQL client.</p>
</div>

<div id="windowsinstall" style="display: none;" markdown="1">

<p>At this time, it's only possible to run CockroachDB on Windows in a Docker virtual environment. See <a href="{{site.data.strings.version}}.html">Release Notes</a> for what's new in the latest version of CockroachDB.</p>

{{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker and is not recommended for production deployments. To run a physically distributed cluster in containers, use an orchestration tool like Kubernetes or Docker Swarm. See <a href="orchestration.html">Orchestration</a> for more details.{{site.data.alerts.end}}

<ol>
  <li>
    <p>Install <a href="https://docs.docker.com/docker-for-windows/">Docker for Windows</a>. Please carefully check that you meet all prerequisites.</p> 
  </li>
  <li>
    <p>Open PowerShell and confirm that the Docker daemon is running in the background:</p>

    <div class="language-powershell highlighter-rouge"><pre class="highlight"><code><span class="nb">PS </span>C:\Users\username&gt; docker version</code></pre></div>

    <p>If you don't see the server listed, start <strong>Docker for Windows</strong>.</p>
  </li>
  <li>
    <p><a href="https://docs.docker.com/docker-for-windows/#/shared-drives">Share your local drives</a>. This makes it possible to mount local directories as data volumes to persist node data after containers are stopped or deleted.</p>
  </li>
  <li>
    <p>Pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/" data-eventcategory="win-docker-step3">Docker Hub</a>:</p>

    <div class="language-powershell highlighter-rouge"><pre class="highlight"><code data-eventcategory="win-docker-step3"><span class="nb" data-eventcategory="win-docker-step3">PS </span>C:\Users\username&gt; docker pull cockroachdb/cockroach:{{site.data.strings.version}}</code></pre></div>
  </li>
  <li>
      <p>Make sure CockroachDB installed successfully:</p>

      <div class="language-powershell highlighter-rouge"><pre class="highlight"><code data-eventcategory="win-docker-step4"><span class="nb" data-eventcategory="win-docker-step4">PS </span>C:\Users\username&gt; docker run --rm cockroachdb/cockroach:{{site.data.strings.version}} version</code></pre></div>

  </li>
  <li>
    <p>Get future release notes emailed to you:</p>
    <div class="hubspot-install-form install-form-8 clearfix">
      <script>
        hbspt.forms.create({ 
          css: '',
          cssClass: 'install-form',
          portalId: '1753393',
          formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
          formInstanceId: 8,
          target: '.install-form-8'
        });
      </script>
    </div>
  </li>
</ol>
<h2 id="whats-next">What's Next?</h2>

<p><a href="start-a-local-cluster-in-docker.html">Quick start</a> a multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data, or explore running a physically distributed cluster in containers using <a href="orchestration.html">orchestration</a> tools.</p>
</div>
