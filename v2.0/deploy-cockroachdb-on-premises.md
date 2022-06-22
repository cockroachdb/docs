---
title: Deploy CockroachDB On-Premises
summary: Learn how to manually deploy a secure, multi-node CockroachDB cluster on multiple machines.
toc: true
ssh-link: https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2

---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-premises.html"><button class="filter-button current">Secure</button></a>
  <a href="deploy-cockroachdb-on-premises-insecure.html"><button class="filter-button"><strong>Insecure</strong></button></a>
</div>

This tutorial shows you how to manually deploy a secure multi-node CockroachDB cluster on multiple machines, using [HAProxy](http://www.haproxy.org/) load balancers to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.


## Requirements

{% include {{ page.version.version }}/prod-deployment/secure-requirements.md %}

## Recommendations

{% include {{ page.version.version }}/prod-deployment/secure-recommendations.md %}

## Step 1. Synchronize clocks

{% include {{ page.version.version }}/prod-deployment/synchronize-clocks.md %}

## Step 2. Generate certificates

{% include {{ page.version.version }}/prod-deployment/secure-generate-certificates.md %}

## Step 3. Start nodes

{% include {{ page.version.version }}/prod-deployment/secure-start-nodes.md %}

## Step 4. Initialize the cluster

{% include {{ page.version.version }}/prod-deployment/secure-initialize-cluster.md %}

## Step 5. Test the cluster

{% include {{ page.version.version }}/prod-deployment/secure-test-cluster.md %}

## Step 6. Set up HAProxy load balancers

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.
  {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. On your local machine, run the [`cockroach gen haproxy`](generate-cockroachdb-resources.html) command with the `--host` flag set to the address of any node and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
  	~~~ shell
  	$ cockroach gen haproxy \
  	--certs-dir=certs \
  	--host=<address of any node> \
  	--port=26257
  	~~~

  	By default, the generated configuration file is called `haproxy.cfg` and looks as follows, with the `server` addresses pre-populated correctly:

    ~~~
    global
      maxconn 4096

    defaults
        mode                tcp
        # Timeout values should be configured for your specific use.
        # See: https://cbonte.github.io/haproxy-dconv/1.8/configuration.html#4-timeout%20connect
        timeout connect     10s
        timeout client      1m
        timeout server      1m
        # TCP keep-alive on client side. Server already enables them.
        option              clitcpka

    listen psql
        bind :26257
        mode tcp
        balance roundrobin
        option httpchk GET /health?ready=1
        server cockroach1 <node1 address>:26257 check port 8080
        server cockroach2 <node2 address>:26257 check port 8080
        server cockroach3 <node3 address>:26257 check port 8080
    ~~~

  	The file is preset with the minimal [configurations](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html) needed to work with your running cluster:

  	Field | Description
  	------|------------
  	`timeout connect`<br>`timeout client`<br>`timeout server` | Timeout values that should be suitable for most deployments.
  	`bind` | The port that HAProxy listens on. This is the port clients will connect to and thus needs to be allowed by your network configuration.<br><br>This tutorial assumes HAProxy is running on a separate machine from CockroachDB nodes. If you run HAProxy on the same machine as a node (not recommended), you'll need to change this port, as `26257` is likely already being used by the CockroachDB node.
  	`balance` | The balancing algorithm. This is set to `roundrobin` to ensure that connections get rotated amongst nodes (connection 1 on node 1, connection 2 on node 2, etc.). Check the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html#4-balance) for details about this and other balancing algorithms.
    `option httpchk` | The HTTP endpoint that HAProxy uses to check node health. [`/health?ready=1`](monitoring-and-alerting.html#health-ready-1) ensures that HAProxy doesn't direct traffic to nodes that are live but not ready to receive requests.
    `server` | For each node in the cluster, this field specifies the interface that the node listens on (i.e., the address passed in the `--host` flag on node startup) as well as the port to use for HTTP health checks.

  	{{site.data.alerts.callout_info}}For full details on these and other configuration settings, see the <a href="http://cbonte.github.io/haproxy-dconv/1.7/configuration.html">HAProxy Configuration Manual</a>.{{site.data.alerts.end}}

2. Upload the `haproxy.cfg` file to the machine where you want to run HAProxy:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	$ scp haproxy.cfg <username>@<haproxy address>:~/
	~~~

3. SSH to the machine where you want to run HAProxy.

4. Install HAProxy:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ apt-get install haproxy
	~~~

5. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ haproxy -f haproxy.cfg
	~~~

6. Repeat these steps for each additional instance of HAProxy you want to run.

## Step 7. Run a sample workload

{% include {{ page.version.version }}/prod-deployment/secure-test-load-balancing.md %}

## Step 8. Set up monitoring and alerting

{% include {{ page.version.version }}/prod-deployment/monitor-cluster.md %}

## Step 9. Scale the cluster

{% include {{ page.version.version }}/prod-deployment/secure-scale-cluster.md %}

## Step 10. Use the cluster

{% include {{ page.version.version }}/prod-deployment/use-cluster.md %}

## See Also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
