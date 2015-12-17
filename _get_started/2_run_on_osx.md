---
title: Run on OS X
---

There are four ways to install and run CockroachDB on OS X for local development and testing:

-	[Download the Binary](#download-the-binary)
-	[Use Docker](#use-docker)
- 	[Use Homebrew](#use-homebrew)
-	[Build from Source](#build-from-source)

## Download the Binary

## Use Docker

Docker provides an official CockroachDB image. 

1. 	**Install Docker**  
	For a quick Docker install, run the following commands in your system shell. See [Docker's official documentation](https://docs.docker.com/engine/installation/mac/) for full installation instructions. 

	```bash

	# Install docker and docker-machine: 
	$ brew install docker docker-machine

	# Install VirtualBox: 
	$ brew cask install virtualbox

	# Create and start the virtual machine: 
	$ docker-machine create --driver virtualbox default

	# Set up the environment for the docker client: 
	$ eval $(docker-machine env default)
	```

2. 	**Pull the CockroachDB image**  

	```bash
	$ docker pull cockroachdb/cockroach
	```

3.	**Start up the Cockroach shell**

	```bash
	$ docker run -t -i cockroachdb/cockroach shell
	# root@82cb657cdc42:/cockroach#
	```


## Build from Source


Random code sample:

{% highlight python %}
print('Welcome to the Pig Latin Translator!')
pyg = 'ay'

# Ask user to enter a word.
original = raw_input('Enter a word:')

# Check if user entered something, and check if entry is just letters.
if len(original) > 0 and original.isalpha():
    # Store entry in lowercase.
    word = original.lower()
    # Store just first letter of entry.
    first = word[0]
    # Store concatenation of word and first and pyg variables.
    new_word = word + first + pyg
    # Store new_word with first letter removed.
    new_word = new_word[1:len(new_word)]
    print(new_word)
else:
    print('empty')
{% endhighlight %}

## Download Binary

## Use Homebrew

