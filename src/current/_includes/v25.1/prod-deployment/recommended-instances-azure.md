- Use general-purpose [Dsv5-series](https://docs.microsoft.com/azure/virtual-machines/dv5-dsv5-series) and [Dasv5-series](https://docs.microsoft.com/azure/virtual-machines/dasv5-dadsv5-series) or memory-optimized [Ev5-series](https://docs.microsoft.com/azure/virtual-machines/ev5-esv5-series) and [Easv5-series](https://docs.microsoft.com/azure/virtual-machines/easv5-eadsv5-series#easv5-series) VMs. For example, Cockroach Labs has used `Standard_D8s_v5`, `Standard_D8as_v5`, `Standard_E8s_v5`, and `Standard_e8as_v5` for performance benchmarking.

    - Compute-optimized [F-series](https://docs.microsoft.com/azure/virtual-machines/fsv2-series) VMs are also acceptable.

    {{site.data.alerts.callout_danger}}
    Do not use ["burstable" B-series](https://docs.microsoft.com/azure/virtual-machines/linux/b-series-burstable) VMs, which limit the load on CPU resources. Also, Cockroach Labs has experienced data corruption issues on A-series VMs, so we recommend avoiding those as well.
    {{site.data.alerts.end}}
