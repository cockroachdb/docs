CockroachDB requires moderate levels of [clock synchronization](recommended-production-settings.html#clock-synchronization) to preserve data consistency. For this reason, when a node detects that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default), it spontaneously shuts down. This avoids the risk of consistency anomalies, but it's best to prevent clocks from drifting too far in the first place by running clock synchronization software on each node.

{% if page.title contains "Digital Ocean" or page.title contains "On-Premises" %}

[`ntpd`](http://doc.ntp.org/) should keep offsets in the single-digit milliseconds, so that software is featured here, but other methods of clock synchronization are suitable as well.

1. SSH to the first machine.

2. Disable `timesyncd`, which tends to be active by default on some Linux distributions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo timedatectl set-ntp no
    ~~~

    Verify that `timesyncd` is off:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ timedatectl
    ~~~

    Look for `Network time on: no` or `NTP enabled: no` in the output.

3. Install the `ntp` package:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install ntp
    ~~~

4. Stop the NTP daemon:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo service ntp stop
    ~~~

5. Sync the machine's clock with Google's NTP service:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo ntpd -b time.google.com
    ~~~

    To make this change permanent, in the `/etc/ntp.conf` file, remove or comment out any lines starting with `server` or `pool` and add the following lines:

    {% include copy-clipboard.html %}
    ~~~
    server time1.google.com iburst
    server time2.google.com iburst
    server time3.google.com iburst
    server time4.google.com iburst
    ~~~

    Restart the NTP daemon:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo service ntp start
    ~~~

    {{site.data.alerts.callout_info}}
    We recommend Google's NTP service because it handles ["smearing" the leap second](https://developers.google.com/time/smear). If you use a different NTP service that doesn't smear the leap second, be sure to configure client-side smearing in the same way on each machine. See the [Production Checklist](recommended-production-settings.html#considerations) for details.
    {{site.data.alerts.end}}

6. Verify that the machine is using a Google NTP server:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo ntpq -p
    ~~~

    The active NTP server will be marked with an asterisk.

7. Repeat these steps for each machine where a CockroachDB node will run.

{% elsif page.title contains "Google" %} 

Compute Engine instances are preconfigured to use [NTP](http://www.ntp.org/), which should keep offsets in the single-digit milliseconds. However, Google can’t predict how external NTP services, such as `pool.ntp.org`, will handle the leap second. Therefore, you should:

- [Configure each GCE instance to use Google's internal NTP service](https://cloud.google.com/compute/docs/instances/managing-instances#configure_ntp_for_your_instances).
- If you plan to run a hybrid cluster across GCE and other cloud providers or environments, note that all of the nodes must be synced to the same time source, or to different sources that implement leap second smearing in the same way. See the [Production Checklist](recommended-production-settings.html#considerations) for details.

{% elsif page.title contains "AWS" %}

Amazon provides the [Amazon Time Sync Service](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html), which uses a fleet of satellite-connected and atomic reference clocks in each AWS Region to deliver accurate current time readings. The service also smears the leap second.

- [Configure each AWS instance to use the internal Amazon Time Sync Service](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html#configure-amazon-time-service).
    - Per the above instructions, ensure that `etc/chrony.conf` on the instance contains the line `server 169.254.169.123 prefer iburst minpoll 4 maxpoll 4` and that other `server` or `pool` lines are commented out.
    - To verify that Amazon Time Sync Service is being used, run `chronyc sources -v` and check for a line containing `* 169.254.169.123`. The `*` denotes the preferred time server.
- If you plan to run a hybrid cluster across GCE and other cloud providers or environments, note that all of the nodes must be synced to the same time source, or to different sources that implement leap second smearing in the same way. See the [Production Checklist](recommended-production-settings.html#considerations) for details.

{% elsif page.title contains "Azure" %}

[`ntpd`](http://doc.ntp.org/) should keep offsets in the single-digit milliseconds, so that software is featured here. However, to run `ntpd` properly on Azure VMs, it's necessary to first unbind the Time Synchronization device used by the Hyper-V technology running Azure VMs; this device aims to synchronize time between the VM and its host operating system but has been known to cause problems.

1. SSH to the first machine.

2. Find the ID of the Hyper-V Time Synchronization device:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/torvalds/linux/master/tools/hv/lsvmbus
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python lsvmbus -vv | grep -w "Time Synchronization" -A 3
    ~~~

    ~~~
    VMBUS ID 12: Class_ID = {9527e630-d0ae-497b-adce-e80ab0175caf} - [Time Synchronization]
        Device_ID = {2dd1ce17-079e-403c-b352-a1921ee207ee}
        Sysfs path: /sys/bus/vmbus/devices/2dd1ce17-079e-403c-b352-a1921ee207ee
        Rel_ID=12, target_cpu=0
    ~~~

3. Unbind the device, using the `Device_ID` from the previous command's output:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo <DEVICE_ID> | sudo tee /sys/bus/vmbus/drivers/hv_util/unbind
    ~~~

4. Install the `ntp` package:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install ntp
    ~~~

5. Stop the NTP daemon:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo service ntp stop
    ~~~

6. Sync the machine's clock with Google's NTP service:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo ntpd -b time.google.com
    ~~~

    To make this change permanent, in the `/etc/ntp.conf` file, remove or comment out any lines starting with `server` or `pool` and add the following lines:

    {% include copy-clipboard.html %}
    ~~~
    server time1.google.com iburst
    server time2.google.com iburst
    server time3.google.com iburst
    server time4.google.com iburst
    ~~~

    Restart the NTP daemon:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo service ntp start
    ~~~

    {{site.data.alerts.callout_info}}
    We recommend Google's NTP service because it handles ["smearing" the leap second](https://developers.google.com/time/smear). If you use a different NTP service that doesn't smear the leap second, be sure to configure client-side smearing in the same way on each machine. See the [Production Checklist](recommended-production-settings.html#considerations) for details.
    {{site.data.alerts.end}}

7. Verify that the machine is using a Google NTP server:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo ntpq -p
    ~~~

    The active NTP server will be marked with an asterisk.

8. Repeat these steps for each machine where a CockroachDB node will run.

{% endif %}
