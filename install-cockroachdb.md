---
title: Install CockroachDB
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

<div id="macinstall" markdown="1">
There are four ways to install CockroachDB on Mac OS X. See [Release Notes]({{site.data.strings.version}}.html) for what's new in the latest version.

<div id="mac-installs" class="clearfix">
<a href="#download-the-binary" class="install-button mac-button current" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-binary">Download the <div class="c2a">Binary</div></a>
<a href="#use-homebrew" class="install-button mac-button" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-homebrew">Use <div class="c2a">Homebrew</div></a>
<a href="#build-from-source" class="install-button mac-button" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-source">Build from <div class="c2a">Source</div></a>
<a href="#use-docker" class="install-button mac-button" data-eventcategory="buttonClick-doc-install" data-eventaction="mac-docker">Use <div class="c2a">Docker</div></a>
</div>

<div id="download-the-binary" class="install-option" markdown="1">
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>

## Download the Binary

1.  Download the latest <a href="https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.darwin-10.9-amd64.tgz" data-eventcategory="mac-binary-step1">CockroachDB tarball for OS X</a>.

2.  Extract the binary:
    
    <div class="highlighter-rouge">
      <pre class="highlight"><code data-eventcategory="mac-binary-step2"><span class="gp" data-eventcategory="mac-binary-step2">$ </span>tar xfz cockroach-{{site.data.strings.version}}.darwin-10.9-amd64.tgz</code></pre>
    </div>

3.  Add the directory containing the binary to your `PATH`. This makes it easy to execute [cockroach commands](cockroach-commands.html) from any shell.

4.  Keep up-to-date with software releases and usage best practices:
    
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

## What's Next?

[Quick start](start-a-local-cluster.html) a single- or multi-node cluster locally and talk to it via the built-in SQL client.

</div>

<div id="use-homebrew" class="install-option" style="display: none;" markdown="1">

## Use Homebrew

1.  [Install Homebrew](http://brew.sh).

2.  Run our brew recipe to install dependencies, get the CockroachDB code, and build the binary:
    
    <div class="highlighter-rouge">
      <pre class="highlight"><code data-eventcategory="mac-homebrew-step2"><span class="gp" data-eventcategory="mac-homebrew-step2">$ </span>brew install https://raw.githubusercontent.com/cockroachdb/cockroach/master/build/cockroach.rb</code></pre>
    </div>

3.  Keep up-to-date with software releases and usage best practices:
    
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

## What's Next?

[Quick start](start-a-local-cluster.html) a single- or multi-node cluster locally and talk to it via the built-in SQL client.

</div>

<div id="build-from-source" class="install-option" style="display: none;" markdown="1">

## Build from Source

1.  Make sure you have the following prerequisites:
    - A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice.
    - A [Go environment](http://golang.org/doc/code.html) with a 64-bit version of Go 1.6. You can download the [Go binary](https://golang.org/dl/) directly from the official site. Be sure to set the `$GOPATH` and `$PATH` environment variables as described [here](https://golang.org/doc/code.html#GOPATH).
    - Git 1.8+

2.  Get the CockroachDB code:
    
    <div class="highlighter-rouge">
      <pre class="highlight"><code data-eventcategory="mac-source-step2"><span class="gp" data-eventcategory="mac-source-step2">$ </span>go get -d github.com/cockroachdb/cockroach</code></pre>
    </div>

3.  Compile the CockroachDB binary:
    
    <div class="highlighter-rouge">
      <pre class="highlight"><code data-eventcategory="mac-source-step3"><span class="gp" data-eventcategory="mac-source-step3">$ </span><span class="nb">cd</span> <span class="nv">$GOPATH</span>/src/github.com/cockroachdb/cockroach<br><span class="gp" data-eventcategory="mac-source-step3">$ </span>git checkout {{site.data.strings.version}}<br><span class="gp">$ </span>make build</code></pre>
    </div>
    
    The first time you run `make`, it can take awhile to download and install various dependencies.

4.  Add the directory containing the binary to your `PATH`. This makes it easy to execute [cockroach commands](cockroach-commands.html) from any shell.

5.  Keep up-to-date with software releases and usage best practices:
    
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

## What's Next?

[Quick start](start-a-local-cluster.html) a single- or multi-node cluster locally and talk to it via the built-in SQL client.

</div>

<div id="use-docker" class="install-option" style="display: none;" markdown="1">

## Use Docker

1.  [Install Docker](https://docs.docker.com/mac/step_one/).

2.  Open **Launchpad** and start the **Docker Quickstart Terminal**. This opens a new shell, creates and starts a default Docker virtual machine (VM), and points the terminal environment to this VM.

    If you'd rather do this manually, run:

    ~~~ shell
    $ docker-machine env default
    $ eval "$(docker-machine env default)"
    ~~~

3.  In the shell, pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/" data-eventcategory="mac-docker-step3">Docker Hub</a>:

    <div class="highlighter-rouge">
      <pre class="highlight"><code data-eventcategory="mac-docker-step3"><span class="gp" data-eventcategory="mac-docker-step3">$ </span>docker pull cockroachdb/cockroach:{{site.data.strings.version}}</code></pre>
    </div>

4.  Keep up-to-date with software releases and usage best practices:
    
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

## What's Next?

[Quick start](start-a-local-cluster-in-docker.html) a cluster of CockroachDB nodes across multiple Docker containers.

</div>

<div id="linuxinstall" style="display: none;">

There are three ways to install CockroachDB on Linux. See [Release Notes]({{site.data.strings.version}}.html) for what's new in the latest version.

<div id="linux-installs" class="clearfix">    
<a href="#download-the-binary-linux" class="install-button linux-button current" data-eventcategory="buttonClick-doc-install" data-eventaction="linux-binary" data-eventlabel="">Download the <div class="c2a">Binary</div></a>
<a href="#build-from-source-linux" class="install-button linux-button" data-eventcategory="buttonClick-doc-install" data-eventaction="linux-source">Build from <div class="c2a">Source</div></a>
<a href="#use-docker-linux" class="install-button linux-button" data-eventcategory="buttonClick-doc-install" data-eventaction="linux-docker">Use <div class="c2a">Docker</div></a>
</div>

<div id="download-the-binary-linux" class="install-option" markdown="1"> 

## Download the Binary

1.  Download the latest <a href="https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.linux-amd64.tgz" data-eventcategory="linux-binary-step1">CockroachDB tarball for Linux</a>.

2.  Extract the binary:

    <div class="highlighter-rouge">
      <pre class="highlight"><code data-eventcategory="linux-binary-step2"><span class="gp" data-eventcategory="linux-binary-step2">$ </span>tar xfz cockroach-{{site.data.strings.version}}.linux-amd64.tgz</code></pre>
    </div>

3.  Add the directory containing the binary to your `PATH`. This makes it easy to execute [cockroach commands](cockroach-commands.html) from any shell.

4.  Keep up-to-date with software releases and usage best practices:

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

</div>

<div id="build-from-source-linux" class="install-option" style="display: none;">
<h2>Build from Source</h2>

<ol>
  <li>
    <p>Make sure you have the following prerequisites:</p>

    <ul>
      <li>
        <p>A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work).</p>
      </li>
      <li>
        <p>A <a href="http://golang.org/doc/code.html">Go environment</a> with a 64-bit version of Go 1.6. You can download the <a href="https://golang.org/dl/">Go binary</a> directly from the official site. Be sure to set the <code class="highlighter-rouge">$GOPATH</code> and <code class="highlighter-rouge">$PATH</code> environment variables as described <a href="https://golang.org/doc/code.html#GOPATH">here</a>.</p>
      </li>
      <li>
        <p>Git 1.8+</p>
      </li>
    </ul>
  </li>
  <li>
    <p>Get the CockroachDB code:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-source-step2"><span class="gp" data-eventcategory="linux-source-step2">$ </span>go get -d github.com/cockroachdb/cockroach</code></pre></div>
  </li>
  <li>
    <p>Compile the CockroachDB binary:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-source-step3"><span class="gp" data-eventcategory="linux-source-step3">$ </span><span class="nb" data-eventcategory="linux-source-step3">cd</span> <span class="nv" data-eventcategory="linux-source-step3">$GOPATH</span>/src/github.com/cockroachdb/cockroach<br><span class="gp" data-eventcategory="linux-source-step3">$ </span>git checkout {{site.data.strings.version}}<br><span class="gp">$ </span>make build</code></pre></div>

    <p>The first time you run <code class="highlighter-rouge">make</code>, it can take awhile to download and install various dependencies.</p>
  </li>
  <li>
      <p>Add the directory containing the binary to your <code>PATH</code>. This makes it easy to execute <a href="cockroach-commands.html">cockroach commands</a> from any shell.</p>
    </li>
  <li>
      <p>Keep up-to-date with software releases and usage best practices:</p>
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

<ol>
  <li>
    <p><a href="https://docs.docker.com/engine/installation/linux/ubuntulinux/">Install Docker</a>.</p>
  </li>
  <li>
    <p>If you don’t already have the Docker daemon running in the background, run:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-docker-step2"><span class="gp" data-eventcategory="linux-docker-step2">$ </span>sudo docker -d &amp;</code></pre>
    </div>

    <div class="bs-callout bs-callout-info"> On Linux, Docker needs sudo privileges.</div>
  </li>
  <li>
    <p>Pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/" data-eventcategory="linux-docker-step3">Docker Hub</a>:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-docker-step3"><span class="gp" data-eventcategory="linux-docker-step3">$ </span>sudo docker pull cockroachdb/cockroach:{{site.data.strings.version}}</code></pre>
    </div>
  </li>
  <li>
    <p>Start a new Docker container and load the CockroachDB image into it:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="linux-docker-step4"><span class="gp" data-eventcategory="linux-docker-step4">$ </span>sudo docker run -t -i cockroachdb/cockroach shell</code></pre>
    </div>
  </li>
  <li>
    <p>Keep up-to-date with software releases and usage best practices:</p>
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

<div id="windowsinstall" style="display: none;">
<p>You can run CockroachDB on Windows from within a Docker container, which is a stripped-to-basics version of a Linux operating system. See <a href="{{site.data.strings.version}}.html">Release Notes</a> for what's new in the latest version.</p>

<ol>
  <li>
    <p><a href="https://docs.docker.com/engine/installation/windows/">Install Docker</a>.</p>
  </li>
  <li>
    <p>Start the <strong>Docker Quickstart Terminal</strong>. This opens a new shell, creates and starts a default Docker virtual machine (VM), and points the terminal environment to this VM.</p>
  </li>
  <li>
    <p>In the shell, pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/" data-eventcategory="win-docker-step3">Docker Hub</a>:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="win-docker-step3"><span class="gp" data-eventcategory="win-docker-step3">$ </span>docker pull cockroachdb/cockroach:{{site.data.strings.version}}</code></pre>
    </div>
  </li>
  <li>
    <p>Start a new Docker container and load the CockroachDB image into it:</p>

    <div class="highlighter-rouge"><pre class="highlight"><code data-eventcategory="win-docker-step4"><span class="gp" data-eventcategory="win-docker-step4">$ </span>docker run -t -i cockroachdb/cockroach shell</code></pre>
    </div>
  </li>
  <li>
    <p>Keep up-to-date with software releases and usage best practices:</p>
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

<p><a href="start-a-local-cluster.html">Quick start</a> a single- or multi-node cluster locally and talk to it via the built-in SQL client.</p>
</div>
