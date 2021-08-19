Flag | Description
-----|------------
`--advertise-addr` | Specifies the IP address/hostname and port to tell other nodes to use. The port number can be omitted, in which case it defaults to `26257`.<br><br>This value must route to an IP address the node is listening on (with `--listen-addr` unspecified, the node listens on all IP addresses).<br><br>In some networking scenarios, you may need to use `--advertise-addr` and/or `--listen-addr` differently. For more details, see [Networking](recommended-production-settings.html#networking).
`--join` | Identifies the address of 3-5 of the initial nodes of the cluster. These addresses should match the addresses that the target nodes are advertising.
