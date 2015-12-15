---
title: Run on OS X
---

To install and run CockroachDB on OSX, you can download and install the binary directly, use the popular OS X package manager [Homebrew](/http://brew.sh/) to install the binary, pull the CockroachDB image into a [Docker](/https://docs.docker.com/engine/installation/mac/#from-your-shell) container, or build CockroachDB from source. This page walks you through all options.

## Download Binary

## Homebrew

## Docker

<ol>
    <li>
        Install docker and docker-machine: 
        {% highlight bash %}$ brew install docker docker-machine{% endhighlight %}
    </li>
    <li>
        Install VirtualBox: 
        {% highlight bash %}$ brew cask install virtualbox{% endhighlight %}
    </li>
    <li>
        Create and start the virtual machine: 
        {% highlight bash %}$ docker-machine create --driver virtualbox default{% endhighlight %}
    </li>
    <li>
        Set up the environment for the docker client: 
        {% highlight bash %}$ eval $(docker-machine env default){% endhighlight %}
    </li>
</ol>

## From Source
