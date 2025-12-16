CockroachDB requires moderate levels of clock synchronization to preserve data consistency. For this reason, when a node detects that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed, it spontaneously shuts down. This offset defaults to 500ms but can be changed via the [`--max-offset`]({% link {{ page.version.version }}/cockroach-start.md %}#flags-max-offset) flag when starting each node.

Regardless of clock skew, [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) and [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transactions both serve globally consistent ("non-stale") reads and [commit atomically]({% link {{ page.version.version }}/developer-basics.md %}#how-transactions-work-in-cockroachdb). However, skew outside the configured clock offset bounds can result in violations of single-key linearizability between causally dependent transactions. It's therefore important to prevent clocks from drifting too far by running [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

In very rare cases, CockroachDB can momentarily run with a stale clock. This can happen when using vMotion, which can suspend a VM running CockroachDB, migrate it to different hardware, and resume it. This will cause CockroachDB to be out of sync for a short period before it jumps to the correct time. During this window, it would be possible for a client to read stale data and write data derived from stale reads. By enabling the `server.clock.forward_jump_check_enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), you can be alerted when the CockroachDB clock jumps forward, indicating it had been running with a stale clock. To protect against this on vMotion, however, use the [`--clock-device`](cockroach-start.html#general) flag to specify a [PTP hardware clock](https://www.kernel.org/doc/html/latest/driver-api/ptp.html) for CockroachDB to use when querying the current time. When doing so, you should not enable `server.clock.forward_jump_check_enabled` because forward jumps will be expected and harmless. For more information on how `--clock-device` interacts with vMotion, refer to [this blog post](https://web.archive.org/web/20210420062611/https://core.vmware.com/blog/cockroachdb-vmotion-support-vsphere-7-using-precise-timekeeping).

{{site.data.alerts.callout_danger}}
In CockroachDB versions prior to v22.2.13, and in v23.1 versions prior to v23.1.9, the [`--clock-device`](cockroach-start.html#general) flag had a bug that could cause it to generate timestamps in the far future. This could cause nodes to crash due to incorrect timestamps, or in the worst case irreversibly advance the cluster's HLC clock into the far future. This bug is fixed in CockroachDB v23.2.
{{site.data.alerts.end}}

### Considerations

When setting up clock synchronization:

- All nodes in the cluster must be synced to the same time source, or to different sources that implement leap second smearing in the same way. For example, Google and Amazon have time sources that are compatible with each other (they implement [leap second smearing](https://developers.google.com/time/smear) in the same way), but are incompatible with the default NTP pool (which does not implement leap second smearing).
- For nodes running in AWS, we recommend [Amazon Time Sync Service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html#configure-amazon-time-service). For nodes running in GCP, we recommend [Google's internal NTP service](https://cloud.google.com/compute/docs/instances/configure-ntp#configure_ntp_for_your_instances). For nodes running elsewhere, we recommend [Google Public NTP](https://developers.google.com/time/). Note that the Google and Amazon time services can be mixed with each other, but they cannot be mixed with other time services (unless you have verified leap second behavior). Either all of your nodes should use the Google and Amazon services, or none of them should.
- If you do not want to use the Google or Amazon time sources, you can use [`chrony`](https://chrony.tuxfamily.org/index.html) and enable client-side leap smearing, unless the time source you're using already does server-side smearing. In most cases, we recommend the Google Public NTP time source because it handles smearing the leap second. If you use a different NTP time source that doesn't smear the leap second, you must configure client-side smearing manually and do so in the same way on each machine.
- Do not run more than one clock sync service on VMs where `cockroach` is running.
- {% include {{ page.version.version }}/misc/multiregion-max-offset.md %}

### Tutorials

For guidance on synchronizing clocks, see the tutorial for your deployment environment:

Environment | Featured Approach
------------|---------------------
[On-Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-1-synchronize-clocks) | Use NTP with Google's external NTP service.
[AWS]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}#step-3-synchronize-clocks) | Use the Amazon Time Sync Service.
[Azure]({% link {{ page.version.version }}/deploy-cockroachdb-on-microsoft-azure.md %}#step-3-synchronize-clocks) | Disable Hyper-V time synchronization and use NTP with Google's external NTP service.
[Digital Ocean]({% link {{ page.version.version }}/deploy-cockroachdb-on-digital-ocean.md %}#step-2-synchronize-clocks) | Use NTP with Google's external NTP service.
[GCE]({% link {{ page.version.version }}/deploy-cockroachdb-on-google-cloud-platform.md %}#step-3-synchronize-clocks) | Use NTP with Google's internal NTP service.
