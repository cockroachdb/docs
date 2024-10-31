In a [NUMA (non-uniform memory access) architecture](https://en.wikipedia.org/wiki/Non-uniform_memory_access), the system’s memory is physically distributed across multiple memory banks or "nodes", and each node is assigned to a processor. A processor can access its local memory much faster than non-local memory. This non-uniform memory access can lead to performance differences depending on data location.

CockroachDB is written in Go, which has no support for NUMA scheduling or pinning. To run multiple CockroachDB clusters on a NUMA architecture:

- Assign no more than 32 cores to the node for each instance.
- Ensure that your orchestration framework, process manager, or startup scripts start each CockroachDB in a separate NUMA node.
- Use the `--locality` flag to indicate when multiple CockroachDB instances are running on a given physical host.
- Ensure that each CockroachDB cluster writes to a unique set of storage volumes (block devices).
