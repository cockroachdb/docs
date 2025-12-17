In a [NUMA (non-uniform memory access) architecture](https://en.wikipedia.org/wiki/Non-uniform_memory_access), the system’s memory is physically distributed across multiple memory banks or "nodes", and each node is assigned to a processor. A processor can access its local memory much faster than non-local memory. This non-uniform memory access can lead to performance differences depending on data location.

CockroachDB is written in Go, which has no process-level support for NUMA scheduling or pinning. Instead, you must manage NUMA at the operating system level. To run multiple CockroachDB clusters on a NUMA architecture:

- Assign no more than 32 cores to the node for each instance. Refer to the documentation for [`numactl --membind`](https://man7.org/linux/man-pages/man8/numactl.8.html).
- Ensure that your orchestration framework, process manager, or startup scripts start each CockroachDB in a separate NUMA node.
- If multiple CockroachDB nodes for the same CockroachDB cluster run on the same physical host, ensure that they are in the same [`--locality`]({% link "{{ page.version.version }}/architecture/replication-layer.md" %}#intra-locality) to ensure that data is distributed across different physical hosts.
- Ensure that each CockroachDB node writes to a unique set of storage volumes (block devices).
