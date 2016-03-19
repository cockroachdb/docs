---
title: Install CockroachDB in Markdown
toc: false
---

## Get the Binary - Mac and Linux

<!-- For Linux, just change the download link in step 1 to  https://binaries.cockroachdb.com/cockroach.linux-amd64.tgz -->

1. Download the latest [CockroachDB tarball for OS X](https://binaries.cockroachdb.com/cockroach.darwin-10.9-amd64.tgz).  

2. Extract the binary:
   
   ~~~ shell
   $ tar xfz <tarball file name>
   ~~~ 

## Use Homebrew - Mac

1. [Install Homebrew](http://brew.sh/).

2. Run our brew recipe to install dependencies, get the CockroachDB code, and build the CockroachDB binary:

   ~~~ shell
   $ brew install https://raw.githubusercontent.com/cockroachdb/cockroach/master/build/cockroach.rb
   ~~~

## Build from Source - Mac and Linux

<!-- For Linux, just remove "On Mac OS X..." from the first bullet. -->

1. Make sure you have the following prerequisites:

   - A C++ compiler that supports C++11 (GCC 4.9+ and clang 3.6+ are known to work). On Mac OS X, Xcode should suffice. 

   - A [Go environment](http://golang.org/doc/code.html) with a 64-bit version of Go 1.6. You can download the [Go binary](https://golang.org/dl/) directly from the official site. Be sure to set the `$GOPATH` and `$PATH` environment variables as described [here](https://golang.org/doc/code.html#GOPATH). 

    - Git 1.8+ 

2. Get the CockroachDB code:

   ~~~ shell
   $ go get -d github.com/cockroachdb/cockroach
   ~~~

3. Compile the CockroachDB binary:

   ~~~ shell
   $ cd $GOPATH/src/github.com/cockroachdb/cockroach
   $ make build
   ~~~

    The first time you run `make`, it can take awhile to download and install various dependencies.

## Use Docker - Mac & Windows

<!-- For Windows, change link in step 1 to https://docs.docker.com/engine/installation/windows/ and remove "Open Launchpad and" from step 2. -->

1. [Install Docker](https://docs.docker.com/mac/step_one/).   

2. Open **Launchpad** and start the **Docker Quickstart Terminal**. This opens a new shell, creates and starts a default Docker virtual machine (VM), and points the terminal environment to this VM. 

3. In the shell, pull the official CockroachDB image from [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/):

   ~~~ shell
   $ docker pull cockroachdb/cockroach
   ~~~

4. Start a new Docker container and load the CockroachDB image into it:

   ~~~ shell
   $ docker run -t -i cockroachdb/cockroach shell
   ~~~ 

## Use Docker - Linux

1. [Install Docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/).   

2. If you don't already have the Docker daemon running in the background, run:

   ~~~ shell
   $ sudo docker -d &
   ~~~

   {{site.data.alerts.callout_info}} On Linux, Docker needs sudo privileges.{{site.data.alerts.end}}

3. Pull the official CockroachDB image from [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/):

   ~~~ shell
   $ sudo docker pull cockroachdb/cockroach
   ~~~

4. Start a new Docker container and load the CockroachDB image into it:

   ~~~ shell
   $ sudo docker run -t -i cockroachdb/cockroach shell
   ~~~ 

## What's Next? - Mac, Linux, Windows

[Quick start](start-a-local-cluster.html) a single- or multi-node cluster locally and talk to it via the built-in SQL client.