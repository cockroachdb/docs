If you are testing your deployment locally with multiple CockroachDB nodes running on a single machine (this is [not recommended in production]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology)), you must explicitly [set the store size]({% link {{ page.version.version }}/cockroach-start.md %}#store) per node in order to display the correct capacity. Otherwise, the machine's actual disk capacity will be counted as a separate store for each node, thus inflating the computed capacity.