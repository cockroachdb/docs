---
title: Manual Deployment
summary: Learn how to manually deploy a secure, multi-node CockroachDB cluster on multiple machines.
toc: false
ssh-link: https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2
---

<div class="filters filters-big clearfix">
  <a href="manual-deployment.html"><button class="filter-button current"><strong>Secure</strong></button></a>
  <a href="manual-deployment-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This tutorial shows you how to manually deploy a secure multi-node CockroachDB cluster on multiple machines, using [HAProxy](http://www.haproxy.org/) load balancers to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

<div id="toc"></div>

## Requirements

{% include prod_deployment/secure-requirements.md %}

## Recommendations

{% include prod_deployment/secure-recommendations.md %}

## Step 1. Generate certificates

{% include prod_deployment/secure-generate-certificates.md %}

## Step 2. Start nodes

{% include prod_deployment/secure-start-nodes.md %}

## Step 3. Initialize the cluster

{% include prod_deployment/secure-initialize-cluster.md %}

## Step 4. Test the cluster

{% include prod_deployment/secure-test-cluster.md %}

## Step 5. Set up HAProxy load balancers

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use TCP load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.
  {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. On your local machine, run the [`cockroach gen haproxy`](generate-cockroachdb-resources.html) command with the `--host` flag set to the address of any node and security flags pointing to the CA cert and the client cert and key:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach gen haproxy \
	--certs-dir=certs \
	--host=<address of any node> \
	--port=26257
	~~~

	By default, the generated configuration file is called `haproxy.cfg` and looks as follows, with the `server` addresses pre-populated correctly:

	~~~ shell
	global
	  maxconn 4096

	defaults
	    mode                tcp
	    timeout connect     10s
	    timeout client      1m
	    timeout server      1m

	listen psql
	    bind :26257
	    mode tcp
	    balance roundrobin
	    server cockroach1 <node1 address>:26257
	    server cockroach2 <node2 address>:26257
	    server cockroach3 <node3 address>:26257
	~~~

	The file is preset with the minimal [configurations](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html) needed to work with your running cluster:

	Field | Description
	------|------------
	`timout connect`<br>`timeout client`<br>`timeout server` | Timeout values that should be suitable for most deployments.
	`bind` | The port that HAProxy listens on. This is the port clients will connect to and thus needs to be allowed by your network configuration.<br><br>This tutorial assumes HAProxy is running on a separate machine from CockroachDB nodes. If you run HAProxy on the same machine as a node (not recommended), you'll need to change this port, as `26257` is also used for inter-node communication.
	`balance` | The balancing algorithm. This is set to `roundrobin` to ensure that connections get rotated amongst nodes (connection 1 on node 1, connection 2 on node 2, etc.). Check the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html#4-balance) for details about this and other balancing algorithms.
	`server` | For each node in the cluster, this field specifies the interface that the node listens on, i.e., the address passed in the `--host` flag on node startup.

	{{site.data.alerts.callout_info}}For full details on these and other configuration settings, see the <a href="http://cbonte.github.io/haproxy-dconv/1.7/configuration.html">HAProxy Configuration Manual</a>.{{site.data.alerts.end}}

2. Upload the `haproxy.cfg` file to the machine where you want to run HAProxy:

	{% include copy-clipboard.html %}
	~~~ shell
	$ scp haproxy.cfg <username>@<haproxy address>:~/
	~~~

3. SSH to the machine where you want to run HAProxy.

4. Install HAProxy:

    {% include copy-clipboard.html %}
	~~~ shell
	$ apt-get install haproxy
	~~~

5. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

    {% include copy-clipboard.html %}
	~~~ shell
	$ haproxy -f haproxy.cfg
	~~~

6. Repeat these steps for each additional instance of HAProxy you want to run.

## Step 6. Test load balancing

{% include prod_deployment/secure-test-load-balancing.md %}

## Step 7. Use the cluster

{% include prod_deployment/use-cluster.md %}

## Step 8. Monitor the cluster

{% include prod_deployment/secure-monitor-cluster.md %}

## Step 9. Scale the cluster

{% include prod_deployment/secure-scale-cluster.md %}

## See Also

- [Cloud Deployment](cloud-deployment.html)
- [Orchestration](orchestration.html)
- [Monitoring](monitor-cockroachdb-with-prometheus.html)
- [Start a Local Cluster](start-a-local-cluster.html)
