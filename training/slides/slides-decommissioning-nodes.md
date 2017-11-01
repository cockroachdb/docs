# Goals

https://www.cockroachlabs.com/docs/v1.1/remove-nodes.html

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- Process
- Gotchas

/----------------------------------------/

## What is it?

You can safely remove nodes from the cluster by decommissioning it.

In this process, all data is rebalanced off of the node.

/----------------------------------------/

## Process

### Live Nodes

~~~ shell
$ cockroach quit --decommission --certs-dir=certs --host=[address of node to remove]
~~~

### Dead Nodes

1. Get node id:

~~~ shell
$ cockroach node status  --certs-dir=certs
~~~

2. Decommission node:

~~~ shell
$ cockroach node decommission [node ID] --wait=live --certs-dir=certs --host=[address of live node]
~~~

/----------------------------------------/

## Gotchas

Does _not_ let you underreplicate!

# Lab