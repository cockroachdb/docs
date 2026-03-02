To use super regions, keep the following considerations in mind:

- Your cluster must be a [multi-region cluster]({% link {{ page.version.version }}/multiregion-overview.md %}).
- Super regions [must be enabled]{% if page.name == "show-super-regions.md" %}(#enable-super-regions){% else %}({% link {{ page.version.version }}/alter-database.md %}#enable-super-regions){% endif %}.
- Super regions can only contain one or more [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) that have already been added with [`ALTER DATABASE ... ADD REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-region).
- Each database region can only belong to one super region. In other words, given two super regions _A_ and _B_, the set of database regions in _A_ must be [disjoint](https://wikipedia.org/wiki/Disjoint_sets) from the set of database regions in _B_.
- You cannot [drop a region]({% link {{ page.version.version }}/alter-database.md %}#drop-region) that is part of a super region until you either [alter the super region]({% link {{ page.version.version }}/alter-database.md %}#alter-super-region) to remove it, or [drop the super region]({% link {{ page.version.version }}/alter-database.md %}#drop-super-region) altogether.
