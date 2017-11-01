# Goals

# Presentation

/----------------------------------------/

## Production

- Hardware
- Cluster Topology
- Clock Sync
- Cache and SQL Memory Size
- File Descriptor Limits

/----------------------------------------/

## Hardware

- 3+ nodes; min. 1 CPU and 2GB RAM (though you probably need more)
- For performance, use SSDs on larger machines with stronger CPUs
- For resilience, use smaller nodes with well thought-out zone configs

/----------------------------------------/

## Cluster Topology

- Use an odd number of replicas
- Identify topology in zone configs to ensure survivability
- To survive data center outages, you need to be in 3 DCs

/----------------------------------------/

## Clock Synchronization

- Use NTP

/----------------------------------------/

## Cache and SQL Memory Size

- **Cache size** improves read performance.
	- `--cache`
- **SQL memory size** increases the number of simultaneous client connections, as well as the node's capacity for in-memory processing of rows when using `ORDER BY`, `GROUP BY`, `DISTINCT`, joins, and window functions.
	- `--max-sql-memory`
	
/----------------------------------------/

## File Descriptors Limit

- Recommended 15000 file descriptors per node

/----------------------------------------/