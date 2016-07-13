---
title: Recommended Production Settings
summary: Recommended settings for production deployments.
toc: false
---

This page provides recommended settings for production deployments. 

<div id="toc"></div>

## Cluster Topology

Put each node on a different machine. Since CockroachDB [replicates](configure-replication-zones.html) across nodes, placing more than one node on a single machine increases the risk of data unavailability when a machine fails.

## Clock Synchronization

Run [NTP](http://www.ntp.org/) or other clock synchronization software on each machine. CockroachDB needs moderately accurate time; if the machines’ clocks drift too far apart, [transactions](transactions.html) will never succeed and the cluster will crash.

## File Descriptor Limit (Max Open Files)

CockroachDB can consume a large number of open file handles, often more than is available by default. Therefore, please note the following recommendations.

For each CockroachDB node:

- At a **minimum**, the file descriptor limit must be 256 per store plus 256 for networking. If the limit is below this threshold, the node will not start. 
- The **recommended** file descriptor limit is 5000 per store plus 5000 for networking. These higher limits ensure performance and accommodate cluster growth. 
- When the file descriptor limit is between these minimum and recommended amounts, CockroachDB will allocate 256 to networking and evently split the rest across stores.

### Increase the File Descriptor Limit

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

This section helps you check and increase the file descriptor limit on different operating systems. 

The following are helpful resources for checking and increasing the max file descriptor limit on popular operating systems:

- [OS X](http://krypted.com/mac-os-x/maximum-files-in-mac-os-x/)
- [CentOS Linux](http://www.cyberciti.biz/faq/linux-increase-the-maximum-number-of-open-files/)
- [Ubuntu Linux](https://underyx.me/2015/05/18/raising-the-maximum-number-of-file-descriptors)
- [Windows](https://serverfault.com/questions/249477/windows-server-2008-r2-max-open-files-limit)
