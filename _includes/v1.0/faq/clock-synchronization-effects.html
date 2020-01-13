CockroachDB requires moderate levels of clock synchronization to preserve data consistency. For this reason, when a node detects that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default), it spontaneously shuts down. While [serializable consistency](https://en.wikipedia.org/wiki/Serializability) is maintained regardless of clock skew, skew outside the configured clock offset bounds can result in violations of single-key linearizability between causally dependent transactions. It's therefore important to prevent clocks from drifting too far by running [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

The one rare case to note is when a node's clock suddenly jumps beyond the maximum offset before the node detects it. Although extremely unlikely, this could occur, for example, when running CockroachDB inside a VM and the VM hypervisor decides to migrate the VM to different hardware with a different time. In this case, there can be a small window of time between when the node's clock becomes unsynchronized and when the node spontaneously shuts down. During this window, it would be possible for a client to read stale data and write data derived from stale reads.

For guidance on synchronizing clocks, see the tutorial for your deployment environment:

Environment | Featured Approach
------------|---------------------
[On-Premises](deploy-cockroachdb-on-premises.html#step-1-synchronize-clocks) | Use NTP with Google's external NTP service.
[AWS](deploy-cockroachdb-on-aws.html#step-3-synchronize-clocks) | Use the Amazon Time Sync Service.
[Azure](deploy-cockroachdb-on-microsoft-azure.html#step-3-synchronize-clocks) | Disable Hyper-V time synchronization and use NTP with Google's external NTP service.
[Digital Ocean](deploy-cockroachdb-on-digital-ocean.html#step-2-synchronize-clocks) | Use NTP with Google's external NTP service.
[GCE](deploy-cockroachdb-on-google-cloud-platform.html#step-3-synchronize-clocks) | Use NTP with Google's internal NTP service.

{{site.data.alerts.callout_info}}In most cases, we recommend Google's external NTP service because they handle <a href="https://developers.google.com/time/smear">"smearing" the leap second</a>. If you use a different NTP service that doesn't smear the leap second, you must configure client-side smearing manually and do so in the same way on each machine.{{site.data.alerts.end}}
