---
title: Production Checklist
summary: Recommended settings for production deployments.
toc: true
toc_not_nested: true
---

This page provides important recommendations for production deployments of CockroachDB.

## Topology

When planning your deployment, it's important to carefully review and choose the [topology patterns](topology-patterns.html) that best meet your latency and resiliency requirements. This is especially crucial for multi-region deployments.

Also keep in mind some basic topology recommendations:

{% include {{ page.version.version }}/prod-deployment/topology-recommendations.md %}

## Software

We recommend running a [glibc](https://www.gnu.org/software/libc/)-based Linux distribution and Linux kernel version from the last 5 years, such as [Ubuntu](https://ubuntu.com/), [Red Hat Enterprise Linux (RHEL)](https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux), [CentOS](https://www.centos.org/), or [Container-Optimized OS](https://cloud.google.com/container-optimized-os/docs).

## Hardware

{{site.data.alerts.callout_info}}
Mentions of "CPU resources" refer to vCPUs, which are also known as hyperthreads.
{{site.data.alerts.end}}

### Basic hardware recommendations

This hardware guidance is meant to be platform agnostic and can apply to bare-metal, containerized, and orchestrated deployments. Also see our [cloud-specific](#cloud-specific-recommendations) recommendations.

| Value | Recommendation | Reference
|-------|----------------|----------
| RAM per vCPU | 4 GiB | [CPU and memory](#cpu-and-memory)
| Capacity per vCPU | 150 GiB | [Storage](#storage)
| IOPS per vCPU | 500 | [Disk I/O](#disk-i-o)
| MB/s per vCPU | 30 | [Disk I/O](#disk-i-o)

Before deploying to production, test and tune your hardware setup for your application workload. For example, read-heavy and write-heavy workloads will place different emphases on [CPU](#cpu-and-memory), [RAM](#cpu-and-memory), [storage](#storage), [I/O](#disk-i-o), and [network](#networking) capacity.

#### CPU and memory

Each node should have **at least 2 vCPUs**. For best performance, we recommend at least 4 vCPUs per node. Provision **4 GiB of RAM per vCPU**.

- To optimize for throughput, use larger nodes with up to 32 vCPUs. To further increase throughput, add more nodes to the cluster instead of increasing node size.

      {{site.data.alerts.callout_info}}
      Based on internal testing, 32 vCPUs is a sweet spot for OLTP workloads. It is not a hard limit, especially for deployments using physical hardware rather than cloud instances.
      {{site.data.alerts.end}}

      {{site.data.alerts.callout_info}}
      The benefits to having more RAM decrease as the number of vCPUs increases.
      {{site.data.alerts.end}}

- To optimize for resiliency, use many smaller nodes instead of fewer larger nodes. Recovery from a failed node is faster when data is spread across more nodes.

- Avoid "burstable" or "shared-core" virtual machines that limit the load on CPU resources.

- To ensure consistent SQL performance, make sure all nodes have a uniform configuration.

- Disable Linux memory swapping. CockroachDB manages its own [memory caches](#cache-and-sql-memory-size) (configured via the `--cache` and `--max-sql-memory` flags), independent of the operating system. Over-allocating memory on production machines can lead to unexpected performance issues when pages have to be read back into memory.

{{site.data.alerts.callout_info}}
Under-provisioning RAM results in reduced performance (due to reduced caching and increased spilling to disk), and in some cases can cause OOM crashes. Under-provisioning CPU generally results in poor performance, and in extreme cases can lead to cluster unavailability. For more information, see [capacity planning issues](cluster-setup-troubleshooting.html#capacity-planning-issues) and [memory issues](cluster-setup-troubleshooting.html#memory-issues).
{{site.data.alerts.end}}

#### Storage

We recommend provisioning volumes with **150 GiB per vCPU**. It's fine to have less storage per vCPU if your workload does not have significant capacity needs.

- The maximum recommended storage capacity per node is 2.5 TiB, regardless of the number of vCPUs.

- Use dedicated volumes for the CockroachDB [store](architecture/storage-layer.html). Do not share the store volume with any other I/O activity.

    We suggest storing CockroachDB [log files](debug-and-error-logs.html) in a separate volume from CockroachDB data so that logging is not impacted by I/O throttling.

- The recommended Linux filesystems are [ext4](https://ext4.wiki.kernel.org/index.php/Main_Page) and [XFS](https://xfs.wiki.kernel.org/).

- Always keep some of your disk capacity free on production. Doing so accommodates fluctuations in routine database operations and supports continuous data growth.

    We strongly recommend [monitoring](monitoring-and-alerting.html#node-is-running-low-on-disk-space) your storage utilization and rate of growth, and taking action to add capacity well before you hit the limit.

- Place a [ballast file](cockroach-debug-ballast.html) in each node's storage directory. In the unlikely case that a node runs out of disk space and shuts down, you can delete the ballast file to free up enough space to be able to restart the node.

- Use [zone configs](configure-replication-zones.html) to increase the replication factor from 3 (the default) to 5 (across at least 5 nodes).

    This is especially recommended if you are using local disks with no RAID protection rather than a cloud provider's network-attached disks that are often replicated under the hood, because local disks have a greater risk of failure. You can do this for the [entire cluster](configure-replication-zones.html#edit-the-default-replication-zone) or for specific [databases](configure-replication-zones.html#create-a-replication-zone-for-a-database), [tables](configure-replication-zones.html#create-a-replication-zone-for-a-table), or [rows](configure-replication-zones.html#create-a-replication-zone-for-a-partition) (enterprise-only).

{{site.data.alerts.callout_info}}
Underprovisioning storage leads to node crashes when the disks fill up. Once this has happened, it is difficult to recover from. To prevent your disks from filling up, provision enough storage for your workload, monitor your disk usage, and use a ballast file as described above. For more information, see [capacity planning issues](cluster-setup-troubleshooting.html#capacity-planning-issues) and [storage issues](cluster-setup-troubleshooting.html#storage-issues).
{{site.data.alerts.end}}

##### Disk I/O

Disks must be able to achieve **500 IOPS and 30 MB/s per vCPU**.

- Monitor IOPS for higher service times. If they exceed 1-5 ms, you will need to add more devices or expand the cluster to reduce the disk latency. To monitor IOPS, use tools such as `iostat` (part of `sysstat`).

- To calculate IOPS, use [sysbench](https://github.com/akopytov/sysbench). If IOPS decrease, add more nodes to your cluster to increase IOPS.

- The optimal configuration for striping more than one device is [RAID 10](https://en.wikipedia.org/wiki/Nested_RAID_levels#RAID_10_(RAID_1+0)). RAID 0 and 1 are also acceptable from a performance perspective.

{{site.data.alerts.callout_info}}
Disk I/O especially affects performance on write-heavy workloads. For more context, see [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html#write-scenario).
{{site.data.alerts.end}}

##### Node density testing configuration

In a narrowly-scoped test, we were able to successfully store 4.32 TiB of logical data per node. The results of this test may not be applicable to your specific situation; testing with your workload is _strongly_ recommended before using it in a production environment.

These results were achieved using the ["bank" workload](cockroach-workload.html#bank-workload) running on AWS using 6x c5d.4xlarge nodes, each with 5 TiB of gp2 EBS storage.

Results:

| Value                 | Result          |
|-----------------------+-----------------|
| vCPU per Node         | 16              |
| Logical Data per Node | 4.32 TiB        |
| RAM per Node          | 32 GiB          |
| Data per Core         | ~270 GiB / vCPU |
| Data per RAM          | ~135 GiB / GiB  |

### Cloud-specific recommendations

Cockroach Labs recommends the following cloud-specific configurations based on our own [internal testing](https://www.cockroachlabs.com/blog/2018_cloud_report/). Before using configurations not recommended here, be sure to test them exhaustively.

#### AWS

- Use `m` (general purpose) or `c` (compute-optimized) [instances](https://aws.amazon.com/ec2/instance-types/).

    For example, Cockroach Labs has used `c5d.4xlarge` (16 vCPUs and 32 GiB of RAM per instance, EBS) for internal testing. Note that the instance type depends on whether EBS is used or not. If you're using EBS, use a `c5` instance.

    {{site.data.alerts.callout_danger}}
    Do not use ["burstable" `t` instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html), which limit the load on CPU resources.
    {{site.data.alerts.end}}

- Use `c5` instances with EBS as a primary AWS configuration. To simulate bare-metal deployments, use `c5d` with [SSD Instance Store volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ssd-instance-store.html).

    [Provisioned IOPS SSD-backed (`io1`) EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSVolumeTypes.html#EBSVolumeTypes_piops) need to have IOPS provisioned, which can be very expensive. Cheaper `gp2` volumes can be used instead, if your performance needs are less demanding. Allocating more disk space than you will use can improve performance of `gp2` volumes.

#### Azure

- Use compute-optimized [F-series](https://docs.microsoft.com/en-us/azure/virtual-machines/fsv2-series) VMs.
    For example, Cockroach Labs has used `Standard_F16s_v2` VMs (16 vCPUs and 32 GiB of RAM per VM) for internal testing.

    {{site.data.alerts.callout_danger}}
    Do not use ["burstable" B-series](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/b-series-burstable) VMs, which limit the load on CPU resources. Also, Cockroach Labs has experienced data corruption issues on A-series VMs and irregular disk performance on D-series VMs, so we recommend avoiding those as well.
    {{site.data.alerts.end}}

- Use [Premium Storage](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/premium-storage) or local SSD storage with a Linux filesystem such as `ext4` (not the Windows `ntfs` filesystem). Note that [the size of a Premium Storage disk affects its IOPS](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/premium-storage#premium-storage-disk-limits).

- If you choose local SSD storage, on reboot, the VM can come back with the `ntfs` filesystem. Be sure your automation monitors for this and reformats the disk to the Linux filesystem you chose initially.

#### Digital Ocean

- Use any [droplets](https://www.digitalocean.com/pricing/) except standard droplets with only 1 GiB of RAM, which is below our minimum requirement. All Digital Ocean droplets use SSD storage.

#### GCP

- Use `n1-standard` or `n1-highcpu` [predefined VMs](https://cloud.google.com/compute/pricing#predefined_machine_types), or [custom VMs](https://cloud.google.com/compute/pricing#custommachinetypepricing).

    For example, Cockroach Labs has used `n1-standard-16` (16 vCPUs and 60 GiB of RAM per VM, local SSD) for [performance benchmarking](performance-benchmarking-with-tpcc-small.html). We have also found benefits in using the [Skylake platform](https://cloud.google.com/compute/docs/cpu-platforms).

    {{site.data.alerts.callout_danger}}
    Do not use `f1` or `g1` [shared-core machines](https://cloud.google.com/compute/docs/machine-types#sharedcore), which limit the load on CPU resources.
    {{site.data.alerts.end}}

- Use [Local SSDs](https://cloud.google.com/compute/docs/disks/#localssds) or [SSD persistent disks](https://cloud.google.com/compute/docs/disks/#pdspecs). Note that [the IOPS of SSD persistent disks depends both on the disk size and number of vCPUs on the machine](https://cloud.google.com/compute/docs/disks/performance#optimizessdperformance).
- `nobarrier` can be used with SSDs, but only if it has battery-backed write cache. Without one, data can be corrupted in the event of a crash.

    Cockroach Labs conducts most of our [internal performance tests](https://www.cockroachlabs.com/blog/2018_cloud_report/) using `nobarrier` to demonstrate the best possible performance, but understand that not all use cases can support this option.

## Security

An insecure cluster comes with serious risks:

- Your cluster is open to any client that can access any node's IP addresses.
- Any user, even `root`, can log in without providing a password.
- Any user, connecting as `root`, can read or write any data in your cluster.
- There is no network encryption or authentication, and thus no confidentiality.

Therefore, to deploy CockroachDB in production, it is strongly recommended to [use TLS certificates to authenticate](authentication.html) the identity of nodes and clients and to encrypt in-flight data between nodes and clients. You can use either the built-in [`cockroach cert` commands](cockroach-cert.html) or [`openssl` commands](create-security-certificates-openssl.html) to generate security certificates for your deployment. Regardless of which option you choose, you'll need the following files:

- A certificate authority (CA) certificate and key, used to sign all of the other certificates.
- A separate certificate and key for each node in your deployment, with the common name `node`.
- A separate certificate and key for each client and user you want to connect to your nodes, with the common name set to the username. The default user is `root`.

    Alternatively, CockroachDB supports [password authentication](authentication.html#client-authentication), although we typically recommend using client certificates instead.

For more information, see the [Security Overview](security-overview.html).

## Networking

### Networking flags

When [starting a node](cockroach-start.html), two main flags are used to control its network connections:

- `--listen-addr` determines which address(es) to listen on for connections from other nodes and clients.
- `--advertise-addr` determines which address to tell other nodes to use.

The effect depends on how these two flags are used in combination:

| | `--listen-addr` not specified | `--listen-addr` specified |
|-|----------------------------|------------------------|
| **`--advertise-addr` not specified** | Node listens on all of its IP addresses on port `26257` and advertises its canonical hostname to other nodes. | Node listens on the IP address/hostname and port specified in `--listen-addr` and advertises this value to other nodes.
| **`--advertise-addr` specified** | Node listens on all of its IP addresses on port `26257` and advertises the value specified in `--advertise-addr` to other nodes. **Recommended for most cases.** | Node listens on the IP address/hostname and port specified in `--listen-addr` and advertises the value specified in `--advertise-addr` to other nodes. If the `--advertise-addr` port number is different than the one used in `--listen-addr`, port forwarding is required.

{{site.data.alerts.callout_success}}
When using hostnames, make sure they resolve properly (e.g., via DNS or `etc/hosts`). In particular, be careful about the value advertised to other nodes, either via `--advertise-addr` or via `--listen-addr` when `--advertise-addr` is not specified.
{{site.data.alerts.end}}

### Cluster on a single network

When running a cluster on a single network, the setup depends on whether the network is private. In a private network, machines have addresses restricted to the network, not accessible to the public internet. Using these addresses is more secure and usually provides lower latency than public addresses.

Private? | Recommended setup
---------|------------------
Yes | Start each node with `--listen-addr` set to its private IP address and do not specify `--advertise-addr`. This will tell other nodes to use the private IP address advertised. Load balancers/clients in the private network must use it as well.
No | Start each node with `--advertise-addr` set to a stable public IP address that routes to the node and do not specify `--listen-addr`. This will tell other nodes to use the specific IP address advertised, but load balancers/clients will be able to use any address that routes to the node.<br><br>If load balancers/clients are outside the network, also configure firewalls to allow external traffic to reach the cluster.

### Cluster spanning multiple networks

When running a cluster across multiple networks, the setup depends on whether nodes can reach each other across the networks.

Nodes reachable across networks? | Recommended setup
---------------------------------|------------------
Yes | This is typical when all networks are on the same cloud. In this case, use the relevant [single network setup](#cluster-on-a-single-network) above.
No | This is typical when networks are on different clouds. In this case, set up a [VPN](https://en.wikipedia.org/wiki/Virtual_private_network), [VPC](https://en.wikipedia.org/wiki/Virtual_private_cloud), [NAT](https://en.wikipedia.org/wiki/Network_address_translation), or another such solution to provide unified routing across the networks. Then start each node with `--advertise-addr` set to the address that is reachable from other networks and do not specify `--listen-addr`. This will tell other nodes to use the specific IP address advertised, but load balancers/clients will be able to use any address that routes to the node.<br><br>Also, if a node is reachable from other nodes in its network on a private or local address, set [`--locality-advertise-addr`](cockroach-start.html#networking) to that address. This will tell nodes within the same network to prefer the private or local address to improve performance. Note that this feature requires that each node is started with the [`--locality`](cockroach-start.html#locality) flag. For more details, see this [example](cockroach-start.html#start-a-multi-node-cluster-across-private-networks).

## Load balancing

Each CockroachDB node is an equally suitable SQL gateway to a cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. To ensure that traffic is not directed to failed nodes or nodes that are not ready to receive requests, load balancers should use [CockroachDB's readiness health check](monitoring-and-alerting.html#health-ready-1).
    {{site.data.alerts.callout_success}}
    With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.
    {{site.data.alerts.end}}

For guidance on load balancing, see the tutorial for your deployment environment:

Environment | Featured Approach
------------|---------------------
[On-Premises](deploy-cockroachdb-on-premises.html#step-6-set-up-load-balancing) | Use HAProxy.
[AWS](deploy-cockroachdb-on-aws.html#step-4-set-up-load-balancing) | Use Amazon's managed load balancing service.
[Azure](deploy-cockroachdb-on-microsoft-azure.html#step-4-set-up-load-balancing) | Use Azure's managed load balancing service.
[Digital Ocean](deploy-cockroachdb-on-digital-ocean.html#step-3-set-up-load-balancing) | Use Digital Ocean's managed load balancing service.
[GCP](deploy-cockroachdb-on-google-cloud-platform.html#step-4-set-up-load-balancing) | Use GCP's managed TCP proxy load balancing service.

## Connection pooling

Multiple active connections to the database enable efficient use of the available database resources. However, creating new authenticated connections to the database is CPU and memory-intensive and also adds to the latency since the application has to wait for database to authenticate the connection.

Connection pooling helps resolve this dilemma by creating a set of authenticated connections that can be reused to connect to the database. To determine the size of the maximum connection pool, our recommendation is to start your testing with a pool size of  `(core_count * 2) + ssd_count)`, where `core_count` is the total number of cores in the cluster, and `ssd_count` is the total number of SSDs in the cluster. The optimal pool size will vary based on your workload and application, and may be smaller than that.

In addition to setting a maximum connection pool size, the idle connection pool size must also be set. Our recommendation is to set the idle connection pool size equal to the maximum pool size. While this uses more application server memory, this allows there to be many connections when concurrency is high, without having to dial a new connection for every new operation.

## Monitoring and alerting

{% include {{ page.version.version }}/prod-deployment/monitor-cluster.md %}

## Clock synchronization

{% include {{ page.version.version }}/faq/clock-synchronization-effects.md %}

## Cache and SQL memory size

Each node has a default cache size of `128MiB` that is passively consumed. The default was chosen to facilitate development and testing, where users are likely to run multiple CockroachDB nodes on a single machine. When running a production cluster with one node per host, we recommend increasing this value.

Each node has a default SQL memory size of `25%`. This memory is used as-needed by active operations to store temporary data for SQL queries.

- Increasing a node's **cache size** will improve the node's read performance.
- Increasing a node's **SQL memory size** will increase the number of simultaneous client connections it allows, as well as the node's capacity for in-memory processing of rows when using `ORDER BY`, `GROUP BY`, `DISTINCT`, joins, and window functions.

To manually increase a node's cache size and SQL memory size, start the node using the [`--cache`](cockroach-start.html#flags) and [`--max-sql-memory`](cockroach-start.html#flags) flags:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --cache=.25 --max-sql-memory=.25 <other start flags>
~~~

{{site.data.alerts.callout_danger}}
Avoid setting `--cache` and `--max-sql-memory` to a combined value of more than 75% of a machine's total RAM. Doing so increases the risk of memory-related failures. Also, since CockroachDB manages its own memory caches, disable Linux memory swapping to avoid over-allocating memory.
{{site.data.alerts.end}}

## Dependencies

The [CockroachDB binary for Linux](install-cockroachdb-linux.html) depends on the following libraries:

Library | Description
-----------|------------
[`glibc`](https://www.gnu.org/software/libc/libc.html) | The standard C library.<br><br>If you build CockroachDB from source, rather than use the official CockroachDB binary for Linux, you can use any C standard library, including MUSL, the C standard library used on Alpine.
`libncurses` | Required by the [built-in SQL shell](cockroach-sql.html).
[`tzdata`](https://www.iana.org/time-zones) | Required by certain features of CockroachDB that use time zone data, for example, to support using location-based names as time zone identifiers. This library is sometimes called `tz` or `zoneinfo`. On Windows, time zone data is derived from a `zoneinfo.zip` file.<br><br>If a machine running a CockroachDB node is missing this time zone data, the node will not be able to start. For workaround steps, see this [known limitation](known-limitations.html#location-based-time-zone-names).

These libraries are found by default on nearly all Linux distributions, with Alpine as the notable exception, but it's nevertheless important to confirm that they are installed and kept up-to-date. For the time zone data in particular, it's important for all nodes to have the same version; when updating the library, do so as quickly as possible across all nodes.

{{site.data.alerts.callout_info}}
In Docker-based deployments of CockroachDB, these dependencies do not need to be manually addressed. The Docker image for CockroachDB includes them and keeps them up to date with each release of CockroachDB.
{{site.data.alerts.end}}

## File descriptors limit

CockroachDB can use a large number of open file descriptors, often more than is available by default. Therefore, please note the following recommendations.

For each CockroachDB node:

- At a **minimum**, the file descriptors limit must be 1956 (1700 per store plus 256 for networking). If the limit is below this threshold, the node will not start.
- It is **recommended** to set the file descriptors limit to unlimited; otherwise, the recommended limit is at least 15000 (10000 per store plus 5000 for networking). This higher limit ensures performance and accommodates cluster growth.
- When the file descriptors limit is not high enough to allocate the recommended amounts, CockroachDB allocates 10000 per store and the rest for networking; if this would result in networking getting less than 256, CockroachDB instead allocates 256 for networking and evenly splits the rest across stores.

### Increase the file descriptors limit

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

<section id="macinstall" markdown="1">

- [Yosemite and later](#yosemite-and-later)
- [Older versions](#older-versions)

#### Yosemite and later

To adjust the file descriptors limit for a single process in Mac OS X Yosemite and later, you must create a property list configuration file with the hard limit set to the recommendation mentioned [above](#file-descriptors-limit). Note that CockroachDB always uses the hard limit, so it's not technically necessary to adjust the soft limit, although we do so in the steps below.

For example, for a node with 3 stores, we would set the hard limit to at least 35000 (10000 per store and 5000 for networking) as follows:

1.  Check the current limits:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ launchctl limit maxfiles
    ~~~
    ~~~
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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ launchctl limit maxfiles
    ~~~
    ~~~
    maxfiles    35000          35000
    ~~~

#### Older versions

To adjust the file descriptors limit for a single process in OS X versions earlier than Yosemite, edit `/etc/launchd.conf` and increase the hard limit to the recommendation mentioned [above](#file-descriptors-limit). Note that CockroachDB always uses the hard limit, so it's not technically necessary to adjust the soft limit, although we do so in the steps below.

For example, for a node with 3 stores, we would set the hard limit to at least 35000 (10000 per store and 5000 for networking) as follows:

1.  Check the current limits:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ launchctl limit maxfiles
    ~~~
    ~~~
    maxfiles    10240          10240
    ~~~

    The last two columns are the soft and hard limits, respectively. If `unlimited` is listed as the hard limit, note that the hidden default limit for a single process is actually 10240.

2.  Edit (or create) `/etc/launchd.conf` and add a line that looks like the following, with the last value set to the new hard limit:

    ~~~
    limit maxfiles 35000 35000
    ~~~

3.  Save the file, and restart the system for the new limits to take effect.

4.  Verify the new limits:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ launchctl limit maxfiles
    ~~~
    ~~~
    maxfiles    35000          35000
    ~~~

</section>

<section id="linuxinstall" markdown="1">

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

    ~~~
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

</section>
<section id="windowsinstall" markdown="1">

CockroachDB does not yet provide a Windows binary. Once that's available, we will also provide documentation on adjusting the file descriptors limit on Windows.

</section>

#### Attributions

This section, "File Descriptors Limit", is in part derivative of the chapter *Open File Limits* From the Riak LV 2.1.4 documentation, used under Creative Commons Attribution 3.0 Unported License.

## Orchestration / Kubernetes

When running CockroachDB on Kubernetes, making the following minimal customizations will result in better, more reliable performance:

* Use [SSDs instead of traditional HDDs](kubernetes-performance.html#disk-type).
* Configure CPU and memory [resource requests and limits](kubernetes-performance.html#resource-requests-and-limits).

For more information and additional customization suggestions, see our full detailed guide to [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

## Transaction Retries

When several transactions are trying to modify the same underlying data concurrently, they may experience [contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) that leads to [transaction retries](transactions.html#transaction-retries).  In order to avoid failures in production, your application should be engineered to handle transaction retries using [client-side retry handling](transactions.html#client-side-intervention).
