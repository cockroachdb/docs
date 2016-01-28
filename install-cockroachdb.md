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

    //handle click event for os-tab buttons
    $('#os-tabs').on('click', 'button', function(){
        $('#os-tabs').find('button').removeClass('current');
        $(this).addClass('current');

        if($(this).is('#mac')){ toggleMac(); }
        if($(this).is('#linux')){ toggleLinux(); }
        if($(this).is('#windows')){ toggleWindows(); }
    });

    function toggleMac(){
        $("#macinstall").show();
        $("#linuxinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleLinux(){
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

<div id="os-tabs">
    <button id="mac" class="current">Mac</button>
    <button id="linux">Linux</button>
    <button id="windows">Windows</button>
</div>

<div id="macinstall">
<p>There are currently two ways to install CockroachDB locally on OSX:</p>

<ul>
<li><a href="#download-the-binary">Download the Binary</a></li>
<li><a href="#build-from-source">Build from Source</a></li>
</ul>

<h2 id="download-the-binary">Download the Binary</h2>

<ol>
<li><p>Download the <a href="http://cockroachlabs.com/download/osx">CockroachDB binary for OS X</a>.</p></li>
<li><p>Make the binary executible:</p>
<div class="highlight"><pre><code class="language-" data-lang="">$ chmod +x &lt;binary file name&gt;
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>. </p></li>
</ol>

<h2 id="build-from-source">Build from Source</h2>

<ol>
<li><p>Make sure you have the following prerequisites:</p>

<ul>
<li>A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice. </li>
<li>A <a href="http://golang.org/doc/code.html">Go environment</a> with a 64-bit version of Go 1.5. You can download the <a href="https://golang.org/dl/">Go binary</a> directly from the official site. On OS X, you can also use <a href="http://brew.sh">homebrew</a>: <code>brew install go</code>. </li>
<li>Git 1.8+ </li>
</ul></li>
<li><p>Get the CockroachDB code:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>go get -d github.com/cockroachdb/cockroach
</code></pre></div></li>
<li><p>Compile the CockroachDB binary:</p>
<div class="highlight"><pre><code class="language-" data-lang="">$ cd $GOPATH/src/github.com/cockroachdb/cockroach
$ make build
</code></pre></div>
<p>The first time you run <code>make</code>, it can take awhile to download and install various dependencies.</p></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>. </p></li>
</ol>
</div>

<div id="linuxinstall" style="display: none;">
<p>There are currently two ways to install CockroachDB locally on Linux:</p>

<ul>    
<li><a href="#download-the-binary-linux">Download the Binary</a></li>
<li><a href="#build-from-source-linux">Build from Source</a></li>
<li><a href="#use-docker-linux">Use Docker</a></li>
</ul>

<h2 id="download-the-binary-linux">Download the Binary</h2>

<ol>
<li><p>Download the <a href="http://cockroachlabs.com/download/osx">CockroachDB binary for OS X</a>.</p></li>
<li><p>Make the binary executible:</p>
<div class="highlight"><pre><code class="language-" data-lang="">$ chmod +x &lt;binary file name&gt;
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>. </p></li>
</ol>

<h2 id="build-from-source-linux">Build from Source</h2>

<ol>
<li><p>Make sure you have the following prerequisites:</p>

<ul>
<li>A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice. </li>
<li>A <a href="http://golang.org/doc/code.html">Go environment</a> with a 64-bit version of Go 1.5. You can download the <a href="https://golang.org/dl/">Go binary</a> directly from the official site. On OS X, you can also use <a href="http://brew.sh">homebrew</a>: <code>brew install go</code>. </li>
<li>Git 1.8+ </li>
</ul></li>
<li><p>Get the CockroachDB code:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>go get -d github.com/cockroachdb/cockroach
</code></pre></div></li>
<li><p>Compile the CockroachDB binary:</p>
<div class="highlight"><pre><code class="language-" data-lang="">$ cd $GOPATH/src/github.com/cockroachdb/cockroach
$ make build
</code></pre></div>
<p>The first time you run <code>make</code>, it can take awhile to download and install various dependencies.</p></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>. </p></li>
</ol>

<h2 id="use-docker-linux">Use Docker</h2>

<ol>
<li><p><a href="https://docs.docker.com/engine/installation/ubuntulinux/">Install Docker</a>, as described in Docker&#39;s installation instructions for Linux.   </p></li>
<li><p>If you don&#39;t already have the Docker daemon running in the background, run:  </p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>sudo docker -d &amp;
</code></pre></div>
<div class="bs-callout bs-callout-info"> On Linux, Docker needs sudo privileges in order to work.</div></li>
<li><p>Pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/">Docker Hub</a>:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>sudo docker pull cockroachdb/cockroach
</code></pre></div></li>
<li><p>Start a new Docker container and load the CockroachDB image into it:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>sudo docker run -t -i cockroachdb/cockroach shell
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>.  </p>

<p>When following the <a href="/start-a-local-cluster.html">start a local cluster</a> instructions, be sure to run the commands from within your Docker container. Also, it&#39;s simplest to start the built-in SQL client from within the same container as the CockroachDB cluster, but to do so, you&#39;ll have to start the cluster in the background by adding <code>&amp;</code> to the end of the command:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>./cockroach start --dev &amp;
</code></pre></div></li>
</ol>
</div>

<div id="windowsinstall" style="display: none;">
<p>At this time, the only way to run CockroachDB on Windows is to use Docker. 

<ol>
<li><p><a href="https://docs.docker.com/mac/step_one/">Install Docker</a>, as described in Docker&#39;s installation instructions for OS X.   </p></li>
<li><p>To start CockroachDB, run this command in your terminal:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>docker run -t -i cockroachdb/cockroach shell
</code></pre></div>
<p>The first time you do this, Docker pulls the official CockroachDB image from Docker Hub. From that point on, the image remains on your local system. You can run <code>docker images</code> to list all of your local images.</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>docker images

REPOSITORY              TAG         IMAGE ID            CREATED             VIRTUAL SIZE
cockroachdb/cockroach   latest      e707dfaf8703        2 days ago          278.2 MB
hello-world             latest      0a6ba66e537a        9 weeks ago         960 B
</code></pre></div></li>
</ol>
</div>
<!--
There are currently two ways to install CockroachDB locally on OSX:

- [Download the Binary](#download-the-binary)
- [Build from Source](#build-from-source)

## Download the Binary

1. Download the [CockroachDB binary for OS X](http://cockroachlabs.com/download/osx).

2. Make the binary executible:
    
    ```
    $ chmod +x <binary file name>
    ```

3. [Start a local cluster](/start-a-local-cluster.html). 

## Build from Source

1.  Make sure you have the following prerequisites:
    - A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice. 
    - A [Go environment](http://golang.org/doc/code.html) with a 64-bit version of Go 1.5. You can download the [Go binary](https://golang.org/dl/) directly from the official site. On OS X, you can also use [homebrew](http://brew.sh): `brew install go`. 
    - Git 1.8+ 

2.  Get the CockroachDB code:

    ```bash
    $ go get -d github.com/cockroachdb/cockroach
    ```

3. Compile the CockroachDB binary:

	```
    $ cd $GOPATH/src/github.com/cockroachdb/cockroach
	$ make build
	```

	The first time you run `make`, it can take awhile to download and install various dependencies.

4. [Start a local cluster](/start-a-local-cluster.html). 

## Use Docker

Deploying CockroachDB in Docker is quick and easy. Once you've installed Docker, just run Cockroach in the default Docker container.  

1. 	[Install Docker](https://docs.docker.com/mac/step_one/), as described in Docker's installation instructions for OS X.   

2.	To start CockroachDB, run this command in your terminal:

	```bash
	$ docker run -t -i cockroachdb/cockroach shell
	```

	The first time you do this, Docker pulls the official CockroachDB image from Docker Hub. From that point on, the image remains on your local system. You can run `docker images` to list all of your local images.

	```bash
	$ docker images

	REPOSITORY              TAG			IMAGE ID            CREATED             VIRTUAL SIZE
	cockroachdb/cockroach   latest 		e707dfaf8703        2 days ago			278.2 MB
	hello-world             latest      0a6ba66e537a        9 weeks ago         960 B
	```
-->