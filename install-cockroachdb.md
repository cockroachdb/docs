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
<p>There are four ways to install CockroachDB locally on Mac OS X:</p>

<ul>
<li><a href="#download-the-binary">Download the Binary</a></li>
<li><a href="#use-homebrew">Use Homebrew</a></li>
<li><a href="#build-from-source">Build from Source</a></li>
<li><a href="#use-docker">Use Docker</a></li>
</ul>

<h2 id="download-the-binary">Download the Binary</h2>

<ol>
<li><p>Download the <a href="http://cockroachlabs.com/download/osx">CockroachDB binary for OS X</a>.</p></li>
<li><p>Make the binary executible:</p>
<div class="highlight"><pre><code class="language-" data-lang="">$ chmod +x &lt;binary file name&gt;
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>. </p></li>
</ol>

<h2 id="use-homebrew">Use Homebrew</h2>

<ol>
<li><p><a href="http://brew.sh/">Install Homebrew</a>.</p></li>
<li><p>Run this single brew command to install dependencies, get the CockroachDB code, and build the CockroachDB binary:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="nv">$ </span>brew install https://raw.githubusercontent.com/cockroachdb/cockroach/master/build/cockroach.rb<span class="o"></span>
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>.  </p></li>
</ol>

<h2 id="build-from-source">Build from Source</h2>

<ol>
<li><p>Make sure you have the following prerequisites:</p>

<ul>
<li>A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice. </li>
<li>A <a href="http://golang.org/doc/code.html">Go environment</a> with a 64-bit version of Go 1.5. You can download the <a href="https://golang.org/dl/">Go binary</a> directly from the official site. Be sure to set the <code>$GOPATH</code> and <code>$PATH</code> environment variables as described <a href="https://golang.org/doc/code.html#GOPATH">here</a>.</li>
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

<h2 id="use-docker">Use Docker</h2>

<ol>
<li><p><a href="https://docs.docker.com/mac/step_one/">Install Docker</a>.   </p></li>
<li><p>Open <strong>Launchpad</strong> and start the <strong>Docker Quickstart Terminal</strong>. This opens a new shell, creates and starts a default Docker virtual machine (VM), and points the terminal environment to this VM.</p></li>
<li><p>In the shell, pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/">Docker Hub</a>:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>docker pull cockroachdb/cockroach
</code></pre></div></li>
<li><p>Start a new Docker container and load the CockroachDB image into it:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>docker run -t -i cockroachdb/cockroach shell
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>.  </p>

<p>When following the <a href="/start-a-local-cluster.html">start a local cluster</a> instructions, be sure to run the commands from within your Docker container. Also, it&#39;s simplest to start the built-in SQL client from within the same container as the CockroachDB cluster, but to do so, you&#39;ll have to start the cluster in the background and quiet the logs by adding <code>&gt; /dev/null 2&gt;&amp;1  &amp;</code> to the end of the command:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>./cockroach start --dev &gt; /dev/null 2&gt;&amp;1  &amp;
<span class="gp">$ </span>./cockroach sql --dev
</code></pre></div></li>
</ol>

<h2 id="what-39-s-next">What&#39;s Next?</h2>

<p>The quickest way to try out the database is to <a href="/start-a-local-cluster.html">start a single-node cluster</a> and talk to it via the built-in SQL client.</p>
</div>

<div id="linuxinstall" style="display: none;">
<p>There are three ways to install CockroachDB locally on Linux:</p>

<ul>    
<li><a href="#download-the-binary-linux">Download the Binary</a></li>
<li><a href="#build-from-source-linux">Build from Source</a></li>
<li><a href="#use-docker-linux">Use Docker</a></li>
</ul>

<h2 id="download-the-binary-linux">Download the Binary</h2>

<ol>
<li><p>Download the <a href="http://cockroachlabs.com/download/osx">CockroachDB binary for Linux</a>.</p></li>
<li><p>Make the binary executible:</p>
<div class="highlight"><pre><code class="language-" data-lang="">$ chmod +x &lt;binary file name&gt;
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>. </p></li>
</ol>

<h2 id="build-from-source-linux">Build from Source</h2>

<ol>
<li><p>Make sure you have the following prerequisites:</p>

<ul>
<li>A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). </li>
<li>A <a href="http://golang.org/doc/code.html">Go environment</a> with a 64-bit version of Go 1.5. You can download the <a href="https://golang.org/dl/">Go binary</a> directly from the official site. Be sure to set the <code>$GOPATH</code> and <code>$PATH</code> environment variables as described <a href="https://golang.org/doc/code.html#GOPATH">here</a>.</li>
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
<li><p><a href="https://docs.docker.com/engine/installation/ubuntulinux/">Install Docker</a>.   </p></li>
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

<p>When following the <a href="/start-a-local-cluster.html">start a local cluster</a> instructions, be sure to run the commands from within your Docker container. Also, it&#39;s simplest to start the built-in SQL client from within the same container as the CockroachDB cluster, but to do so, you&#39;ll have to start the cluster in the background and quiet the logs by adding <code>&gt; /dev/null 2&gt;&amp;1  &amp;</code> to the end of the command:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>./cockroach start --dev &gt; /dev/null 2&gt;&amp;1  &amp;
<span class="gp">$ </span>./cockroach sql --dev
</code></pre></div></li>
</ol>

<h2 id="what-39-s-next">What&#39;s Next?</h2>

<p>The quickest way to try out the database is to <a href="/start-a-local-cluster.html">start a single-node cluster</a> and talk to it via the built-in SQL client.</p>
</div>

<div id="windowsinstall" style="display: none;">
<p>At this time, it's possible to run CockroachDB on Windows only from within a Docker container, which is a stripped-to-basics version of a Linux operating system. 

<ol>
<li><p><a href="https://docs.docker.com/engine/installation/windows/">Install Docker</a>.   </p></li>
<li><p>Start the <strong>Docker Quickstart Terminal</strong> application. This opens a new shell, creates and starts a default Docker virtual machine (VM), and points the terminal environment to this VM. </p></li>
<li><p>In the shell, pull the official CockroachDB image from <a href="https://hub.docker.com/r/cockroachdb/cockroach/">Docker Hub</a>:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>docker pull cockroachdb/cockroach
</code></pre></div></li>
<li><p>Start a new Docker container and load the CockroachDB image into it:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>docker run -t -i cockroachdb/cockroach shell
</code></pre></div></li>
<li><p><a href="/start-a-local-cluster.html">Start a local cluster</a>.  </p>

<p>When following the <a href="/start-a-local-cluster.html">start a local cluster</a> instructions, be sure to run the commands from within your Docker container. Also, it&#39;s simplest to start the built-in SQL client from within the same container as the CockroachDB cluster, but to do so, you&#39;ll have to start the cluster in the background and quiet the logs by adding <code>&gt; /dev/null 2&gt;&amp;1  &amp;</code> to the end of the command:</p>
<div class="highlight"><pre><code class="language-bash" data-lang="bash"><span class="gp">$ </span>./cockroach start --dev &gt; /dev/null 2&gt;&amp;1  &amp;
<span class="gp">$ </span>./cockroach sql --dev
</code></pre></div></li>
</ol>

<h2 id="what-39-s-next">What&#39;s Next?</h2>

<p>The quickest way to try out the database is to <a href="/start-a-local-cluster.html">start a single-node cluster</a> and talk to it via the built-in SQL client.</p>
</div>

<!-- Below is some of the page's content in Markdown. To get correct html, it's easiest to let Jeyll translate the Markdown and then use that html above.

## Download the Binary

1. Download the [CockroachDB binary for OS X](http://cockroachlabs.com/download/osx).

2. Make the binary executible:
    
    ```
    $ chmod +x <binary file name>
    ```

3. [Start a local cluster](/start-a-local-cluster.html). 

## Use Homebrew

1. [Install Homebrew](http://brew.sh/).

2. Run this single brew command to install dependencies, get the CockroachDB code, and build the CockroachDB binary:

    ```bash
    $ brew install https://raw.githubusercontent.com/cockroachdb/cockroach/master/build/cockroach.rb)
    ``` 

3. [Start a local cluster](/start-a-local-cluster.html).

## Build from Source

1.  Make sure you have the following prerequisites:
    - A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice. 
    - A [Go environment](http://golang.org/doc/code.html) with a 64-bit version of Go 1.5. You can download the [Go binary](https://golang.org/dl/) directly from the official site. Be sure to set the `$GOPATH` and `$PATH` environment variables as described [here](https://golang.org/doc/code.html#GOPATH). 
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

## Use Docker (Mac)

1.  [Install Docker](https://docs.docker.com/mac/step_one/).   

2.  Open **Launchpad** and start the **Docker Quickstart Terminal**. This opens a new shell, creates and starts a default Docker virtual machine (VM), and points the terminal environment to this VM. 

3.  In the shell, pull the official CockroachDB image from [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/):

    ```bash
    $ docker pull cockroachdb/cockroach
    ```

4.  Start a new Docker container and load the CockroachDB image into it:

    ```bash
    $ docker run -t -i cockroachdb/cockroach shell
    ```

5. [Start a local cluster](/start-a-local-cluster.html).  

    When following the [start a local cluster](/start-a-local-cluster.html) instructions, be sure to run the commands from within your Docker container. Also, it's simplest to start the built-in SQL client from within the same container as the CockroachDB cluster, but to do so, you'll have to start the cluster in the background and quiet the logsby adding `> /dev/null 2>&1  &` to the end of the command:

    ```bash
    $ ./cockroach start --dev > /dev/null 2>&1  &
    $ ./cockroach sql --dev
    ```

## Use Docker (Linux)

1.  [Install Docker](https://docs.docker.com/engine/installation/ubuntulinux/).   

2.  If you don't already have the Docker daemon running in the background, run:  
    
    ```bash
    $ sudo docker -d &
    ```
    {{site.data.alerts.callout_info}} On Linux, Docker needs sudo privileges in order to work.{{site.data.alerts.end}}

3. Pull the official CockroachDB image from [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/):

    ```bash
    $ sudo docker pull cockroachdb/cockroach
    ```

4.  Start a new Docker container and load the CockroachDB image into it:

    ```bash
    $ sudo docker run -t -i cockroachdb/cockroach shell
    ```

5. [Start a local cluster](/start-a-local-cluster.html).  

    When following the [start a local cluster](/start-a-local-cluster.html) instructions, be sure to run the commands from within your Docker container. Also, it's simplest to start the built-in SQL client from within the same container as the CockroachDB cluster, but to do so, you'll have to start the cluster in the background and quiet the logs by adding `> /dev/null 2>&1  &` to the end of the command:

    ```bash
    $ ./cockroach start --dev > /dev/null 2>&1  &
    $ ./cockroach sql --dev
    ```
-->