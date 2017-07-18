---
title: How to Deploy CockroachDB to Production
summary: Get an overview of how best to deploy CockroachDB as a consistent, scalable database for your application.
toc: false
---

Though CockroachDB itself is easy to use, deploying a database to production requires a lot of preparation. This page attempts to cover common things you need to understand before deploying CockroachDB––or any service––to a production environment.

{{site.data.alerts.callout_info}}For help training your team on CockroachDB's deployments or best practices, <a href="https://www.cockroachlabs.com/pricing/sales/">contact the Cockroach Labs team</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Deployment Architecture

To deploy CockroachDB to production, you need the following infrastructure.

#### Nodes

3+ machines that can communicate with one another.

- Use at least three nodes to ensure that a majority of replicas (2/3) remains available if a node fails. Configurations with odd numbers of replicas are more robust than those with even numbers. Clusters of three and four nodes can each tolerate one node failure and still reach a majority (2/3 and 3/4 respectively), so the fourth replica doesn't add any extra fault-tolerance. To survive two simultaneous failures, you must have five replicas.

- Run each node on a separate machine. Since CockroachDB replicates across nodes, running more than one node per machine increases the risk of data loss if a machine fails. Likewise, if a machine has multiple disks or SSDs, run one node with multiple `--store` flags and not one node per disk. For more details about stores, see [Start a Node](start-a-node.html).

- Ideally, these machines should be located in you would want these machines located in separate locations to maximize survivability.

#### Load Balancer

A highly available load balancer (such as those provided by Google Cloud or through an orchestration tool like Kubernetes). You'll use this to connect to multiple nodes in your cluster; you don't want to rely on a single node, because if it goes down, your application will go down despite having other available nodes.

#### Service Discovery

Service discovery (such as Zookeeper or through an orchestration tool like Kubernetes) so new nodes can be found.

#### Monitoring

It's crucial to know when machines fail and be alerted. While CockroachDB provides an Admin UI with this information, you will also want to integrate your cluster with a tool like Prometheus to alert your team of outages.

## Platform

To deploy CockroachDB, it's important to understand the platform on which you plan to deploy it. 

### Networking

While CockroachDB can easily be deployed on Google Cloud, AWS, Microsoft Azure, or Digital Ocean, each of them has idiosyncrasies, particularly around how they handle networking. Important elements of your network to understand include:

- Hostnames
- Firewalls

#### Hostnames

CockroachDB requires nodes to communicate with one another, as well as accept client requests from your application. This is often handled by hostnames, but it's important to understand what those are on your platform, or if they're accessible network names.

Depending on how you plan to deploy Cockroach, you need to ensure that the following hostnames resolve:

- **Client communication** to let your application or load balancer communicate with your cluster. This defaults to the node's `$HOSTNAME`, but can be controlled with `cockroach start`'s `--host` flag.
- **Inter-node communication** so nodes can communicate with one another. This defaults to the same value as the client communication hostname (i.e., `$HOSTNAME` or the value of `--host`), but can be independently controlled with `cockroach start`'s `--advertise-host` flag.

#### Firewalls

Because CockroachDB benefits from widely distributed deployments, it's crucial to ensure that nodes can communicate with one another. There are two common ports that you should make sure nodes can use:

- `26257` is the default port for the `cockroach` binary to accept client requests, as well as communicate with one another
- `8080` is the default port for Admin UI of CockroachDB.

#### Troubleshooting

Because networking between CockroachDB nodes is by far the most confounding element of deploying it, if you run into issues, check out our [Networking Troubleshooting documentation](cluster-setup-troubleshooting.html#networking-troubleshooting).

### Topology & Availability Zones

Because CockroachDB doesn't have an intrinsic understanding of your deployment's topology, you must manually identify the node's location (also known as "availability zones") using the `--locality` flag when starting your nodes. CockroachDB then uses these flags as a way of replicating data in a way that ensures survivability.

Your nodes' `--locality` flag should express a hierarchy of topologies. For example:

1. Country
2. Region
3. Datacenter

For a deployment in the United States, your `--locality` flags might look like: 

- `--locality=country=us,region=east,datacenter=us-east-1`
- `--locality=country=us,region=east,datacenter=us-east-2`
- `--locality=country=us,region=central,datacenter=us-central-1`
- `--locality=country=us,region=central,datacenter=us-central-2`
- `--locality=country=us,region=west,datacenter=us-west-1`
- `--locality=country=us,region=west,datacenter=us-west-2`

{{site.data.alerts.callout_info}}When replicating across datacenters, it's recommended to use datacenters on a single continent to ensure performance (inter-continent scenarios will improve in performance soon).{{site.data.alerts.end}}

For details about controlling the number and location of replicas, see [Configure Replication Zones](configure-replication-zones.html).

## Deployment Methods

Because of CockroachDB's cloud-native design, it works best in conjunction with an **orchestration tool**, such as Kubernetes.

It is certainly possible to run CockroachDB manually, but tasks such as monitoring node liveliness and scaling your cluster are handled much more efficiently with an orchestration tool.

### Load Balancing

If you opt to run CockroachDB outside of an orchestration tool, you will also need to be sure to configure a load balancer manually. This include setting up things like service discovery to ensure that you are aware when new nodes are added to your cluster.

### Service Discovery

If you choose to deploy CockroachDB without an orchestration tool, you'll also need to manually set up a service discovery tool, such as Zookeeper.

At this time, CockroachDB doesn't offer native integration with any service discovery tools, so you will need to manually register nodes with your service discovery tool after starting your node.

### Monitoring

While an orchestration tool can automatically bring up new resources if machines fail, if you choose to deploy CockroachDB manually, you'll need to integrate it with a monitoring tool to alert your team of node failures.

You can monitor your cluster with basically any tool, but we have documentation on integrating CockroachDB with [Prometheus](monitor-cockroachdb-with-prometheus.html).

## Security

To deploy CockroachDB, you *must* use SSL encryption. To make this as simple as possible, the `cockroach` binary can work a certificate authority (CA), which provides everything you need to generate SSLs.

However, CockroachDB supports using any valid certificates, such as those generated by OpenSSL.

Regardless of which option you choose, you'll need the following files:

- A certificate authority (CA) certificate and key, used to sign all of the other certificates
- A separate certificate and key for each node in your deployment, with the common name `node`
- A separate certificate and key for each client and user you want to connect to your nodes, with the common name set to the username. The default user is `root`.
  
  Alternatively, CockroachDB does [support password authentication](create-and-manage-users.html#secure-cluster), though we typically recommend using client certificates instead.

### Deploying Certificates

#### Nodes

Each node requires local copies of the following:

- Your certificate authority (CA) certificate to validate the signature of all other certificates
- A node key and certificate signed by your CA with the common name of `node`
- To run commands locally on nodes, you'll also need to include local copies certificate and key files for a user with the necessary permissions. By default, this is the `root` user.

#### Clients

Each client (e.g., your application or load balancer) requires local copies of the following:

- Your certificate authority (CA) certificate to validate the signature of all other certificates
- A node key and certificate signed by your CA with the common name set to the username. The default user is `root`.

## Hardware Recommendations

Minimum recommendations:

- For a replicated cluster, use at least 3 nodes to ensure availability if a single node fails (see [Cluster Topology](#cluster-topology) for more details).
- Each node should have sufficient CPU, RAM, network, and storage capacity to handle your workload, but the bare minimum is 1 CPU and 2 GB of RAM per node. More data, complex workloads, higher concurrency, and faster performance require additional resources.

For best performance:

- Use SSDs over HDDs.
- Use larger/more powerful nodes. Adding more CPU is usually more beneficial than adding more RAM.

For best resiliency:

- Use many smaller nodes instead of fewer larger ones. Recovery from a failed node is faster when data is spread across more nodes.
- Use [zone configs](configure-replication-zones.html) to increase the replication factor from 3 (the default) to 5. You can do this for the [entire cluster](configure-replication-zones.html#edit-the-default-replication-zone) or for specific [databases](configure-replication-zones.html#create-a-replication-zone-for-a-database) or [tables](configure-replication-zones.html#create-a-replication-zone-for-a-table).

## Clock Synchronization

{% include faq/clock-synchronization.html %}

## Cache Size

If you run multiple applications on the same machine as a CockroachDB node, you might consider manually setting the cache size instead of using the default 25% of available memory.

To manually set the limit of the cache size, start the node using the [`--cache` flag](start-a-node.html#flags). For example, the following command limits a node's cache to 5GB:

```shell
$ cockroach start --cache=5GB <other start flags>
```

## File Descriptors Limit

CockroachDB can use a large number of open file descriptors, often more than is available by default. Therefore, please note the following recommendations.

For each CockroachDB node:

- At a **minimum**, the file descriptors limit must be 1956 (1700 per store plus 256 for networking). If the limit is below this threshold, the node will not start.
- It is **recommended** to set the file descriptors limit to unlimited; otherwise, the recommended limit is at least 15000 (10000 per store plus 5000 for networking). This higher limit ensures performance and accommodates cluster growth.
- When the file descriptors limit is not high enough to allocate the recommended amounts, CockroachDB allocates 10000 per store and the rest for networking; if this would result in networking getting less than 256, CockroachDB instead allocates 256 for networking and evenly splits the rest across stores.

### Increase the File Descriptors Limit

<script>
$(document).ready(function(){

    //detect os and display corresponding tab by default
    if (navigator.appVersion.indexOf("Mac")!=-1) {
        $('#os-tabs').find('button').removeClass('current');
        $('#mac').addClass('current');
        toggleMac();
    }
    if (navigator.appVersion.indexOf("Linux")!=-1) {
        $('#os-tabs').find('button').removeClass('current');
        $('#linux').addClass('current');
        toggleLinux();
    }
    if (navigator.appVersion.indexOf("Win")!=-1) {
        $('#os-tabs').find('button').removeClass('current');
        $('#windows').addClass('current');
        toggleWindows();
    }

    var install_option = $('.install-option'),
        install_button = $('.install-button');

    install_button.on('click', function(e){
      e.preventDefault();
      var hash = $(this).prop("hash");

      install_button.removeClass('current');
      $(this).addClass('current');
      install_option.hide();
      $(hash).show();

    });

    //handle click event for os-tab buttons
    $('#os-tabs').on('click', 'button', function(){
        $('#os-tabs').find('button').removeClass('current');
        $(this).addClass('current');

        if($(this).is('#mac')){ toggleMac(); }
        if($(this).is('#linux')){ toggleLinux(); }
        if($(this).is('#windows')){ toggleWindows(); }
    });

    function toggleMac(){
        $(".mac-button:first").trigger('click');
        $("#macinstall").show();
        $("#linuxinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleLinux(){
        $(".linux-button:first").trigger('click');
        $("#linuxinstall").show();
        $("#macinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleWindows(){
        $("#windowsinstall").show();
        $("#macinstall").hide();
        $("#linuxinstall").hide();
    }
});
</script>

<div id="os-tabs" class="clearfix">
    <button id="mac" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button>
    <button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button>
    <button id="windows" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button>
</div>

<div id="macinstall" markdown="1">

- [Yosemite and later](#yosemite-and-later)
- [Older versions](#older-versions)

#### Yosemite and later

To adjust the file descriptors limit for a single process in Mac OS X Yosemite and later, you must create a property list configuration file with the hard limit set to the recommendation mentioned [above](#file-descriptors-limit). Note that CockroachDB always uses the hard limit, so it's not technically necessary to adjust the soft limit, although we do so in the steps below.

For example, for a node with 3 stores, we would set the hard limit to at least 35000 (10000 per store and 5000 for networking) as follows:

1.  Check the current limits:

    ~~~ shell
    $ launchctl limit maxfiles
    maxfiles    10240          10240
    ~~~

    The last two columns are the soft and hard limits, respectively. If `unlimited` is listed as the hard limit, note that the hidden default limit for a single process is actually 10240.

2.  Create `/Library/LaunchDaemons/limit.maxfiles.plist` and add the following contents, with the final strings in the `ProgramArguments` array set to 35000:

    ~~~ xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      <plist version="1.0">
        <dict>
          <key>Label</key>
            <string>limit.maxfiles</string>
          <key>ProgramArguments</key>
            <array>
              <string>launchctl</string>
              <string>limit</string>
              <string>maxfiles</string>
              <string>35000</string>
              <string>35000</string>
            </array>
          <key>RunAtLoad</key>
            <true/>
          <key>ServiceIPC</key>
            <false/>
        </dict>
      </plist>
    ~~~

    Make sure the plist file is owned by `root:wheel` and has permissions `-rw-r--r--`. These permissions should be in place by default.

3.  Restart the system for the new limits to take effect.

4.  Check the current limits:

    ~~~ shell
    $ launchctl limit maxfiles
    maxfiles    35000          35000
    ~~~

#### Older versions

To adjust the file descriptors limit for a single process in OS X versions earlier than Yosemite, edit `/etc/launchd.conf` and increase the hard limit to the recommendation mentioned [above](#file-descriptors-limit). Note that CockroachDB always uses the hard limit, so it's not technically necessary to adjust the soft limit, although we do so in the steps below.

For example, for a node with 3 stores, we would set the hard limit to at least 35000 (10000 per store and 5000 for networking) as follows:

1.  Check the current limits:

    ~~~ shell
    $ launchctl limit maxfiles
    maxfiles    10240          10240
    ~~~

    The last two columns are the soft and hard limits, respectively. If `unlimited` is listed as the hard limit, note that the hidden default limit for a single process is actually 10240.

2.  Edit (or create) `/etc/launchd.conf` and add a line that looks like the following, with the last value set to the new hard limit:

    ~~~
    limit maxfiles 35000 35000
    ~~~

3.  Save the file, and restart the system for the new limits to take effect.

4.  Verify the new limits:

    ~~~ shell
    $ launchctl limit maxfiles
    maxfiles    35000          35000
    ~~~

</div>

<div id="linuxinstall" markdown="1">

- [Standard](#standard)
- [With Systemd](#with-systemd)

#### Standard

To adjust the file descriptors limit for a single process on Linux, enable PAM user limits and set the hard limit to the recommendation mentioned [above](#file-descriptors-limit). Note that CockroachDB always uses the hard limit, so it's not technically necessary to adjust the soft limit, although we do so in the steps below.

For example, for a node with 3 stores, we would set the hard limit to at least 35000 (10000 per store and 5000 for networking) as follows:

1.  Make sure the following line is present in both `/etc/pam.d/common-session` and `/etc/pam.d/common-session-noninteractive`:

    ~~~ shell
    session    required   pam_limits.so
    ~~~

2.  Edit `/etc/security/limits.conf` and append the following lines to the file:

    ~~~ shell
    *              soft     nofile          35000
    *              hard     nofile          35000
    ~~~

    Note that `*` can be replaced with the username that will be running the CockroachDB server.

4.  Save and close the file.

5.  Restart the system for the new limits to take effect.

6.  Verify the new limits:

    ~~~ shell
    $ ulimit -a
    ~~~

#### With Systemd

Alternately, if you're using [Systemd](https://en.wikipedia.org/wiki/Systemd):

1.  Edit the service definition to configure the maximum number of open files:

    ~~~ ini
    [Service]
    ...
    LimitNOFILE=35000
    ~~~

2.  Reload Systemd for the new limit to take effect:

    ~~~ shell
    $ systemctl daemon-reload
    ~~~

</div>
<div id="windowsinstall" markdown="1">

CockroachDB does not yet provide a native Windows binary. Once that's available, we will also provide documentation on adjusting the file descriptors limit on Windows.

</div>

#### Attributions

This section, "File Descriptors Limit", is a derivative of [Open File Limits](http://docs.basho.com/riak/kv/2.1.4/using/performance/open-files-limit/) by Riak, used under Creative Commons Attribution 3.0 Unported License.

## Deploying to Your Platform

Once you have all of the necessary preparation done, you can deploy to your platform:

- [Kubernetes](orchestrate-cockroachdb-with-kubernetes.html)
- [Docker Swarm](orchestrate-cockroachdb-with-docker-swarm.html)
- [Non-orchestrated cloud deployments](cloud-deployment.html)

## Troubleshooting

If you run into any issues with your deployment, check out our [troubleshooting documentation](troubleshooting-overview.html).
