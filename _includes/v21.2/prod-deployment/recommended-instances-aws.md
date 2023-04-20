- Use general-purpose [`m6i` or `m6a`](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose-instances.html) VMs with SSD-backed [EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html). For example, Cockroach Labs has used `m6i.2xlarge` for performance benchmarking. If your workload requires high per-node throughput, use network-optimized `m6n` instances. To simulate bare-metal deployments, use `m6idn` with [SSD Instance Store volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ssd-instance-store.html).

    - `m5` and `m5a` instances, and [compute-optimized `c5`, `c5a`, and `c5n`](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/compute-optimized-instances.html) instances, are also acceptable.

    {{site.data.alerts.callout_danger}}
    Cockroach Labs is testing ARM-based [`m6g` and `m7g` Graviton](https://aws.amazon.com/ec2/graviton/) instances but does not officially support this architecture at this time.

    **Do not** use [burstable performance instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html), which limit the load on a single core.
    {{site.data.alerts.end}}
