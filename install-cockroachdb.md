---
title: Install CockroachDB
toc: false
---

There are currently two ways to deploy CockroachDB locally on OSX:

- [Download the Binary](#download-the-binary)
- [Build from Source](#build-from-source)

## Download the Binary


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

	```bash
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
