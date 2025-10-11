- Use general-purpose [`t2d-standard`, `n2-standard`, or `n2d-standard`](https://cloud.google.com/compute/pricing#predefined_machine_types) VMs, or use [custom VMs](https://cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type). For example, Cockroach Labs has used `t2d-standard-8`, `n2-standard-8`, and `n2d-standard-8` for performance benchmarking.

    {{site.data.alerts.callout_danger}}
    Do not use `f1` or `g1` [shared-core machines](https://cloud.google.com/compute/docs/machine-types#sharedcore), which limit the load on CPU resources.
    {{site.data.alerts.end}}