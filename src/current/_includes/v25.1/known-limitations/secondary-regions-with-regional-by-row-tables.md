[Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions) are not compatible with databases containing [`REGIONAL BY ROW`]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) tables. CockroachDB does not prevent you from defining secondary regions on databases with regional by row tables, but the interaction of these features is not supported.

Therefore, Cockroach Labs recommends that you avoid defining secondary regions on databases that use regional by row table configurations.
