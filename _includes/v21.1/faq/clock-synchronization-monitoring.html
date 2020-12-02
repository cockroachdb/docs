As explained in more detail [in our monitoring documentation](monitoring-and-alerting.html#prometheus-endpoint), each CockroachDB node exports a wide variety of metrics at `http://<host>:<http-port>/_status/vars` in the format used by the popular Prometheus timeseries database. Two of these metrics export how close each node's clock is to the clock of all other nodes:

Metric | Definition
-------|-----------
`clock_offset_meannanos` | The mean difference between the node's clock and other nodes' clocks in nanoseconds
`clock_offset_stddevnanos` | The standard deviation of the difference between the node's clock and other nodes' clocks in nanoseconds

As described in [the above answer](#what-happens-when-node-clocks-are-not-properly-synchronized), a node will shut down if the mean offset of its clock from the other nodes' clocks exceeds 80% of the maximum offset allowed. It's recommended to monitor the `clock_offset_meannanos` metric and alert if it's approaching the 80% threshold of your cluster's configured max offset.
