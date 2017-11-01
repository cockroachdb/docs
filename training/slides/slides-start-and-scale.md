# Goals

Install CockroachDB - https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html
Start a Local Cluster - https://www.cockroachlabs.com/docs/stable/start-a-local-cluster.html
Load balancing (just in talk/diagram)
HAProxy with local cluster - https://www.cockroachlabs.com/docs/stable/demo-automatic-cloud-migration.html

# Presentation

/----------------------------------------/

## Starting & Scaling a Cluster

We're going to run a multi-node, local cluster for this training.

When running multiple nodes on the same machine, specify which node with the `--port` flag.

/----------------------------------------/

## Agenda

- Start a Cluster
- Scale a Cluster
- Work with Load Balancing

Note: CockroachDB runs in a lot of environments with a lot of different options, so we're going to talk about the general case here, but we'll see more gruesome details in the upcoming labs.

/----------------------------------------/

## Start a Cluster

### Install the Binary

Install the `cockroach` binary on each machine.

### Prep Each Node

~~~ shell
$ cockroach start --join=[other node's hosts]
~~~ 

/----------------------------------------/

## Start a Cluster

### One-Time Initialization

On any one node one time

~~~ shell
$ cockroach init
~~~

/----------------------------------------/

## Cluster Status

 - CLI

    ~~~ shell
    $ cockroach node status
    ~~~

 - Admin UI

    ~~~ shell
    $ [any node host]:8080
    ~~~

/----------------------------------------/

## Scale Cluster

You can scale your cluster by installing the binary on a new VM, and then using the same command:

~~~ shell
$ cockroach start --join=[any node in the cluster]
~~~

Because the cluster's already been initialized, the node will automatically join the cluster

/----------------------------------------/

## Load Balancing

### Connecting an App

- PostgreSQL-compatible drivers an ORMs
- Connect to any node in the cluster
- Maximize survivability with load balancing

/----------------------------------------/

## Load Balancing

### HAProxy

Built-in support with `cockroach gen haproxy`

/----------------------------------------/

### Recap

- Start all `cockroach` nodes with the same command: `cockroach start --join`
- Perform a one-time initialization with `cockroach init`
- Scale your cluster with `cockroach start --join`
- CockroachDB requires load balancing for survivability and comes bundled with HAProxy support through `cockroach gen haproxy`

# Lab