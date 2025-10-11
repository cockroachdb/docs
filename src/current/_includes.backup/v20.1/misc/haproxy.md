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
    `server` | For each included node, this field specifies the address the node advertises to other nodes in the cluster, i.e., the addressed pass in the [`--advertise-addr` flag](cockroach-start.html#networking) on node startup. Make sure hostnames are resolvable and IP addresses are routable from HAProxy.

    {{site.data.alerts.callout_info}}
    For full details on these and other configuration settings, see the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html).
    {{site.data.alerts.end}}
