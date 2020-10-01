---
title: Deploy CockroachDB On-Premises (Insecure)
summary: Learn how to manually deploy an insecure, multi-node CockroachDB cluster on multiple machines.
toc: true
ssh-link: https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2
redirect_from: manual-deployment-insecure.html

---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-premises.html"><button class="filter-button">Secure</button></a>
  <a href="deploy-cockroachdb-on-premises-insecure.html"><button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This tutorial shows you how to manually deploy an insecure multi-node CockroachDB cluster on multiple machines, using [HAProxy](http://www.haproxy.org/) load balancers to distribute client traffic.

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

### Requirements

{% include {{ page.version.version }}/prod-deployment/insecure-requirements.md %}

### Recommendations

{% include {{ page.version.version }}/prod-deployment/insecure-recommendations.md %}

## Step 1. Synchronize clocks

{% include {{ page.version.version }}/prod-deployment/synchronize-clocks.md %}

## Step 2. Start nodes

{% include {{ page.version.version }}/prod-deployment/insecure-start-nodes.md %}

## Step 3. Initialize the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-initialize-cluster.md %}

## Step 4. Test the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-test-cluster.md %}

## Step 5. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.
  {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. SSH to the machine where you want to run HAProxy.

2. Install HAProxy:

  {% include copy-clipboard.html %}
  ~~~ shell
  $ apt-get install haproxy
  ~~~

3. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

4. Copy the binary into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

  If you get a permissions error, prefix the command with `sudo`.

5. Run the [`cockroach gen haproxy`](cockroach-gen.html) command, specifying the address of any CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen haproxy --insecure \
    --host=<address of any node> \
    --port=26257
    ~~~

      {% include {{ page.version.version }}/misc/haproxy.md %}

6. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

  {% include copy-clipboard.html %}
  ~~~ shell
  $ haproxy -f haproxy.cfg
  ~~~

7. Repeat these steps for each additional instance of HAProxy you want to run.

## Step 6. Run a sample workload

{% include {{ page.version.version }}/prod-deployment/insecure-test-load-balancing.md %}

## Step 7. Monitor the cluster

{% include {{ page.version.version }}/prod-deployment/monitor-cluster.md %}

## Step 8. Scale the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-scale-cluster.md %}

## Step 9. Use the cluster

{% include {{ page.version.version }}/prod-deployment/use-cluster.md %}

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
