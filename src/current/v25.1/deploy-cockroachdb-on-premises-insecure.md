---
title: Deploy CockroachDB On-Premises (Insecure)
summary: Learn how to manually deploy an insecure, multi-node CockroachDB cluster on multiple machines.
toc: true
ssh-link: https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2
docs_area:
---


This tutorial shows you how to manually deploy an insecure multi-node CockroachDB cluster on multiple machines, using [HAProxy](http://www.haproxy.org/) load balancers to distribute client traffic.



## Before you begin

### Requirements


### Recommendations


## Step 1. Synchronize clocks


## Step 2. Start nodes


## Step 3. Initialize the cluster


## Step 4. Test the cluster


## Step 5. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.
  {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. SSH to the machine where you want to run HAProxy.

1. Install HAProxy:

  ~~~ shell
  $ apt-get install haproxy
  ~~~

1. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

1. Copy the binary into the `PATH`:

    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

  If you get a permissions error, prefix the command with `sudo`.

1. Run the [`cockroach gen haproxy`]({{ page.version.version }}/cockroach-gen.md) command, specifying the address of any CockroachDB node:

    ~~~ shell
    $ cockroach gen haproxy --insecure \
    --host=<address of any node> \
    --port=26257
    ~~~


1. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

  ~~~ shell
  $ haproxy -f haproxy.cfg
  ~~~

1. Repeat these steps for each additional instance of HAProxy you want to run.

## Step 6. Run a sample workload


## Step 7. Monitor the cluster


## Step 8. Scale the cluster


## Step 9. Use the cluster


## See also
