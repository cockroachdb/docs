CockroachDB requires moderate levels of clock synchronization to preserve data consistency. For this reason, when a node detects that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default), it spontaneously shuts down. This avoids the risk of violating [serializable consistency](https://en.wikipedia.org/wiki/Serializability) and causing stale reads and write skews, but it's important to prevent clocks from drifting too far in the first place by running [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

The one rare case to note is when a node's clock suddenly jumps beyond the maximum offset before the node detects it. Although extremely unlikely, this could occur, for example, when running CockroachDB inside a VM and the VM hypervisor decides to migrate the VM to different hardware with a different time. In this case, there can be a small window of time between when the node's clock becomes unsynchronized and when the node spontaneously shuts down. During this window, it would be possible for a client to read stale data and write data derived from stale reads.

### Considerations

There are important considerations when setting up clock synchronization:

- We recommend using [Google Public NTP](https://developers.google.com/time/) or [Amazon Time Sync Service](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html) with the clock sync service you are already using (e.g., [`ntpd`](http://doc.ntp.org/), [`chrony`](https://chrony.tuxfamily.org/index.html)). For example, if you are already using `ntpd`, configure `ntpd` to point to the Google or Amazon time server.

    {{site.data.alerts.callout_info}}
    Amazon Time Sync Service is only available within [Amazon EC2](https://aws.amazon.com/ec2/), so hybrid environments should use Google Public NTP instead.
    {{site.data.alerts.end}}

- If you do not want to use the Google or Amazon clock servers, you can use `chrony` and enable client-side leap smearing, unless the clock service you're using already does server-side smearing. In most cases, we recommend the Google Public NTP service because it handles ["smearing" the leap second](https://developers.google.com/time/smear). If you use a different NTP service that doesn't smear the leap second, you must configure client-side smearing manually and do so in the same way on each machine.
- Do not run more than one clock sync service on VMs where `cockroach` is running.

### Tutorials

For guidance on synchronizing clocks, see the tutorial for your deployment environment:

Environment | Featured Approach
------------|---------------------
[On-Premises](deploy-cockroachdb-on-premises.html#step-1-synchronize-clocks) | Use NTP with Google's external NTP service.
[AWS](deploy-cockroachdb-on-aws.html#step-3-synchronize-clocks) | Use the Amazon Time Sync Service.
[Azure](deploy-cockroachdb-on-microsoft-azure.html#step-3-synchronize-clocks) | Disable Hyper-V time synchronization and use NTP with Google's external NTP service.
[Digital Ocean](deploy-cockroachdb-on-digital-ocean.html#step-2-synchronize-clocks) | Use NTP with Google's external NTP service.
[GCE](deploy-cockroachdb-on-google-cloud-platform.html#step-3-synchronize-clocks) | Use NTP with Google's internal NTP service.
