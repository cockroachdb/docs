- You must have [CockroachDB installed]({% link {{ page.version.version }}/install-cockroachdb.md %}) locally. This is necessary for generating and managing your deployment's certificates.

- You must have [SSH access]({{page.ssh-link}}) to each machine. This is necessary for distributing and starting CockroachDB binaries.

- Your network configuration must allow TCP communication on the following ports:
	- `26257` for intra-cluster and client-cluster communication
	- `8080` to expose your DB Console

- Carefully review the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}), including supported hardware and software, and the recommended [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %}).

{% include {{ page.version.version }}/prod-deployment/topology-recommendations.md %}