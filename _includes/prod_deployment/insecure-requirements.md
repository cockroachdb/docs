- You must have SSH access to each machine with `root` or `sudo` privileges. This is necessary for distributing and starting CockroachDB binaries.

- Your network configuration must allow TCP communication on the following ports:
	- **26257** (`tcp:26257`) for intra-cluster and client-cluster communication
	- **8080** (`tcp:8080`) to expose your Admin UI
