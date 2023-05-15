---
title: Recommended Production Settings
summary: Recommended settings for production deployments of CockroachDB.
toc: true
toc_not_nested: true
---

This page provides recommended settings for production deployments.


## Hardware

Minimum recommendations:

- For a replicated cluster, use at least 3 nodes to ensure availability if a single node fails (see [Cluster Topology](#cluster-topology) for more details).
- Each node should have sufficient CPU, RAM, network, and storage capacity to handle your workload, but the bare minimum is 1 CPU and 2 GB of RAM per node. More data, complex workloads, higher concurrency, and faster performance require additional resources.

For best performance:

- Use SSDs over HDDs.
- Use larger/more powerful nodes. Adding more CPU is usually more beneficial than adding more RAM.

For best resiliency:

- Use many smaller nodes instead of fewer larger ones. Recovery from a failed node is faster when data is spread across more nodes.
- Use [zone configs](configure-replication-zones.html) to increase the replication factor from 3 (the default) to 5. This is especially recommended if you are using local disks rather than a cloud providers' network-attached disks that are often replicated underneath the covers, because local disks have a greater risk of failure. You can do this for the [entire cluster](configure-replication-zones.html#edit-the-default-replication-zone) or for specific [databases](configure-replication-zones.html#create-a-replication-zone-for-a-database) or [tables](configure-replication-zones.html#create-a-replication-zone-for-a-table).

## Cluster Topology

When running a cluster with more than one node, each replica will be on a different node and a majority of replicas must remain available for the cluster to make progress. Therefore:

- Use at least three nodes to ensure that a majority of replicas (2/3) remains available if a node fails.

- Run each node on a separate machine. Since CockroachDB replicates across nodes, running more than one node per machine increases the risk of data loss if a machine fails. Likewise, if a machine has multiple disks or SSDs, run one node with multiple `--store` flags and not one node per disk. For more details about stores, see [Start a Node](start-a-node.html).

- Configurations with odd numbers of replicas are more robust than those with even numbers. Configurations with three replicas and configurations with four replicas can each tolerate one node failure and still reach a majority (2/3 and 3/4 respectively), so the fourth replica doesn't add any extra fault-tolerance. To survive two simultaneous failures, you must have five replicas.

- When replicating across datacenters, it's recommended to specify which datacenter each node is in using the `--locality` flag to ensure even replication (see this [example](configure-replication-zones.html#even-replication-across-datacenters) for more details). If some of your datacenters are much farther apart than others, [specifying multiple levels of locality (such as country and region) is recommended](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes).

- When replicating across datacenters, be aware that the round-trip latency between datacenters will have a direct effect on your database's performance, with cross-continent clusters performing noticeably worse than clusters in which all nodes are geographically close together.

For details about controlling the number and location of replicas, see [Configure Replication Zones](configure-replication-zones.html).

## Clock Synchronization

CockroachDB needs moderately accurate time to preserve data consistency, so it's important to run [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

By default, CockroachDB's maximum allowed clock offset is 500ms. When a node detects that its clock offset, relative to other nodes, is half or more of the maximum allowed, it spontaneously shuts down. While [serializable consistency](https://en.wikipedia.org/wiki/Serializability) is maintained regardless of clock skew, skew outside the configured clock offset bounds can result in violations of single-key linearizability between causally dependent transactions. With NTP or other clock synchronization software running on each node, there's very little risk of ever exceeding the maximum offset and encountering such anomalies, and even on well-functioning hardware not running synchronization software, slow clock drift is most common, which CockroachDB handles safely.

The one rare case to note is when a node's clock suddenly jumps beyond the maximum offset before the node detects it. Although extremely unlikely, this could occur, for example, when running CockroachDB inside a VM and the VM hypervisor decides to migrate the VM to different hardware with a different time. In this case, there can be a small window of time between when the node's clock becomes unsynchronized and when the node spontaneously shuts down. During this window, it would be possible for a client to read stale data and write data derived from stale reads.

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

CockroachDB does not yet provide a Windows binary. Once that's available, we will also provide documentation on adjusting the file descriptors limit on Windows.

</div>

#### Attributions

This section, "File Descriptors Limit", is a derivative of the chapter *Open File Limits* From the Riak LV 2.1.4 documentation, used under Creative Commons Attribution 3.0 Unported License.
