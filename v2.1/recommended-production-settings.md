---
title: Production Checklist
summary: Recommended settings for production deployments.
toc: false
---

This page provides important recommendations for production deployments of CockroachDB.

<div id="toc"></div>

## Cluster Topology

### Terminology

To properly plan your cluster's topology, it's important to review some basic CockroachDB-specific terminology:

Term | Definition
-----|------------
**Cluster** | Your CockroachDB deployment, which acts as a single logical application that contains one or more databases.
**Node** | An individual machine running CockroachDB. Many nodes join together to create your cluster.
**Range** | CockroachDB stores all user data and almost all system data in a giant sorted map of key-value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
**Replica** | CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
**Range Lease** | For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### Basic Recommendations

- Run each node on a separate machine. Since CockroachDB replicates across nodes, running more than one node per machine increases the risk of data loss if a machine fails. Likewise, if a machine has multiple disks or SSDs, run one node with multiple `--store` flags and not one node per disk. For more details about stores, see [Start a Node](start-a-node.html).

- When deploying in a single datacenter:
    - To be able to tolerate the failure of any 1 node, use at least 3 nodes with the [default 3-way replication factor](configure-replication-zones.html#view-the-default-replication-zone). In this case, if 1 node fails, each range retains 2 of its 3 replicas, a majority.
    - To be able to tolerate 2 simultaneous node failures, use at least 5 nodes and [increase the replication factor to 5](configure-replication-zones.html#edit-the-default-replication-zone). In this case, if 2 nodes fail at the same time, each range retains 3 of its 5 replicas, a majority.

- When deploying across multiple datacenters in one or more regions:
    - To be able to tolerate the failure of 1 entire datacenter, use at least 3 datacenters and set `--locality` on each node to spread data evenly across datacenters (see next bullet for more details). In this case, if 1 datacenter goes offline, the 2 remaining datacenters retain a majority of replicas.
    - When starting each node, use the [`--locality`](start-a-node.html#locality) flag to describe the node's location, for example, `--locality=region=west,datacenter=us-west-1`. The key-value pairs should be ordered from most to least inclusive, and the keys and order of key-value pairs must be the same on all nodes.
        - CockroachDB spreads the replicas of each piece of data across as diverse a set of localities as possible, with the order determining the priority. However, locality can also be used to influence the location of data replicas in various ways using [replication zones](configure-replication-zones.html#replication-constraints).
        - When there is high latency between nodes, CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance, also known as ["follow-the-workload"](demo-follow-the-workload.html). In a deployment across more than 3 datacenters, however, to ensure that all data benefits from "follow-the-workload", you must [increase the replication factor](configure-replication-zones.html#edit-the-default-replication-zone) to match the total number of datacenters.
        - Locality is also a prerequisite for using the [table partitioning](partitioning.html) and [**Node Map**](enable-node-map.html) enterprise features.        

{{site.data.alerts.callout_success}}For added context about CockroachDB's fault tolerance and automated repair capabilities, see <a href="training/fault-tolerance-and-automated-repair.html">this training</a>.{{site.data.alerts.end}}

## Hardware

### Basic Recommendations

- Nodes should have sufficient CPU, RAM, network, and storage capacity to handle your workload. It's important to test and tune your hardware setup before deploying to production.

- At a bare minimum, each node should have **2 GB of RAM and one entire core**. More data, complex workloads, higher concurrency, and faster performance require additional resources.
    {{site.data.alerts.callout_danger}}Avoid "burstable" or "shared-core" virtual machines that limit the load on a single core.{{site.data.alerts.end}}

- For best performance:
    - Use SSDs over HDDs.
    - Use larger/more powerful nodes. Adding more CPU is usually more beneficial than adding more RAM.

- For best resilience:
    - Use many smaller nodes instead of fewer larger ones. Recovery from a failed node is faster when data is spread across more nodes.
    - Use [zone configs](configure-replication-zones.html) to increase the replication factor from 3 (the default) to 5. You can do this for the [entire cluster](configure-replication-zones.html#edit-the-default-replication-zone) or for specific [databases](configure-replication-zones.html#create-a-replication-zone-for-a-database) or [tables](configure-replication-zones.html#create-a-replication-zone-for-a-table).

### Cloud-Specific Recommendations

Cockroach Labs recommends the following cloud-specific configurations based on our own internal testing. Before using configurations not recommended here, be sure to test them exhaustively.

#### AWS

- Use `m` (general purpose), `c` (compute-optimized), or `i` (storage-optimized) [instances](https://aws.amazon.com/ec2/instance-types/), with SSD-backed [EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSVolumeTypes.html) or [Instance Store volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ssd-instance-store.html).

    For example, Cockroach Labs has used `m3.large` instances (2 vCPUs and 7.5 GiB of RAM per instance) for internal testing.
- **Do not** use ["burstable" `t2` instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/t2-instances.html), which limit the load on a single core.

#### Azure

- Use storage-optimized [Ls-series](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/sizes-storage) VMs with [Premium Storage](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/premium-storage) or local SSD storage with a Linux filesystem such as `ext4` (not the Windows `ntfs` filesystem).

    For example, Cockroach Labs has used `Standard_L4s` VMs (4 vCPUs and 32 GiB of RAM per VM) for internal testing.
- If you choose local SSD storage, on reboot, the VM can come back with the `ntfs` filesystem. Be sure your automation monitors for this and reformats the disk to the Linux filesystem you chose initially.
- **Do not** use ["burstable" B-series](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/b-series-burstable) VMs, which limit the load on a single core. Also, Cockroach Labs has experienced data corruption issues on A-series VMs and irregular disk performance on D-series VMs, so we recommend avoiding those as well.

#### Digital Ocean

- Use any [droplets](https://www.digitalocean.com/pricing/) except standard droplets with only 1 GB of RAM, which is below our minimum requirement. All Digital Ocean droplets use SSD storage.

#### GCE

- Use `n1-standard` or `n1-highcpu` [predefined VMs](https://cloud.google.com/compute/pricing#predefined_machine_types), or [custom VMs](https://cloud.google.com/compute/pricing#custommachinetypepricing), with [Local SSDs](https://cloud.google.com/compute/docs/disks/#localssds) or [SSD persistent disks](https://cloud.google.com/compute/docs/disks/#pdspecs).

    For example, Cockroach Labs has used custom VMs (8 vCPUs and 16 GiB of RAM per VM) for internal testing.
- **Do not** use `f1` or `g1` [shared-core machines](https://cloud.google.com/compute/docs/machine-types#sharedcore), which limit the load on a single core.

## Security

An insecure cluster comes with serious risks:

- Your cluster is open to any client that can access any node's IP addresses.
- Any user, even `root`, can log in without providing a password.
- Any user, connecting as `root`, can read or write any data in your cluster.
- There is no network encryption or authentication, and thus no confidentiality.

Therefore, to deploy CockroachDB in production, it is strongly recommended to use TLS certificates to authenticate the identity of nodes and clients and to encrypt in-flight data between nodes and clients. You can use either the built-in [`cockroach cert` commands](create-security-certificates.html) or [`openssl` commands](create-security-certificates-openssl.html) to generate security certificates for your deployment. Regardless of which option you choose, you'll need the following files:

- A certificate authority (CA) certificate and key, used to sign all of the other certificates.
- A separate certificate and key for each node in your deployment, with the common name `node`.
- A separate certificate and key for each client and user you want to connect to your nodes, with the common name set to the username. The default user is `root`.

    Alternatively, CockroachDB supports [password authentication](create-and-manage-users.html#user-authentication), although we typically recommend using client certificates instead.

## Load Balancing

Each CockroachDB node is an equally suitable SQL gateway to a cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. To ensure that traffic is not directed to failed nodes or nodes that are not ready to receive requests, load balancers should use [CockroachDB's readiness health check](monitoring-and-alerting.html#health-ready-1).
    {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

For guidance on load balancing, see the tutorial for your deployment environment:

Environment | Featured Approach
------------|---------------------
[On-Premises](deploy-cockroachdb-on-premises.html#step-6-set-up-haproxy-load-balancers) | Use HAProxy.
[AWS](deploy-cockroachdb-on-aws.html#step-4-set-up-load-balancing) | Use Amazon's managed load balancing service.
[Azure](deploy-cockroachdb-on-microsoft-azure.html#step-4-set-up-load-balancing) | Use Azure's managed load balancing service.
[Digital Ocean](deploy-cockroachdb-on-digital-ocean.html#step-3-set-up-load-balancing) | Use Digital Ocean's managed load balancing service.
[GCE](deploy-cockroachdb-on-google-cloud-platform.html#step-4-set-up-tcp-proxy-load-balancing) | Use GCE's managed TCP proxy load balancing service.

## Monitoring and Alerting

{% include prod_deployment/monitor-cluster.md %}

## Clock Synchronization

{% include faq/clock-synchronization-effects.html %}

## Cache and SQL Memory Size

<span class="version-tag">Changed in v1.1: </span>By default, each node's cache size and temporary SQL memory size is `128MiB` respectively. These defaults were chosen to facilitate development and testing, where users are likely to run multiple CockroachDB nodes on a single computer. When running a production cluster with one node per host, however, it's recommended to increase these values:

- Increasing a node's **cache size** will improve the node's read performance.
- Increasing a node's **SQL memory size** will increase the number of simultaneous client connections it allows (the `128MiB` default allows a maximum of 6200 simultaneous connections) as well as the node's capacity for in-memory processing of rows when using `ORDER BY`, `GROUP BY`, `DISTINCT`, joins, and window functions.

To manually increase a node's cache size and SQL memory size, start the node using the [`--cache`](start-a-node.html#flags-changed-in-v2-0) and [`--max-sql-memory`](start-a-node.html#flags-changed-in-v2-0) flags:

~~~ shell
$ cockroach start --cache=25% --max-sql-memory=25% <other start flags>
~~~

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

- [Per-Process Limit](#per-process-limit)
- [System-Wide Limit](#system-wide-limit)

#### Per-Process Limit

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

#### System-Wide Limit

You should also confirm that the file descriptors limit for the entire Linux system is at least 10 times higher than the per-process limit documented above (e.g., at least 150000).

1. Check the system-wide limit:

    ~~~ shell
    $ cat /proc/sys/fs/file-max
    ~~~

2. If necessary, increase the system-wide limit in the `proc` file system:

    ~~~ shell
    $ echo 150000 > /proc/sys/fs/file-max
    ~~~

</div>
<div id="windowsinstall" markdown="1">

CockroachDB does not yet provide a native Windows binary. Once that's available, we will also provide documentation on adjusting the file descriptors limit on Windows.

</div>

#### Attributions

This section, "File Descriptors Limit", is in part derivative of the chapter *Open File Limits* From the Riak LV 2.1.4 documentation, used under Creative Commons Attribution 3.0 Unported License.
