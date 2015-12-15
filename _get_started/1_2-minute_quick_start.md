---
title: 2-Minute Quick Start
---

Intro text needed. Prerequisites. Info about docker. This is for OSX. How to handle other OSs. Etc.

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