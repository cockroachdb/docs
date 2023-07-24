To use super regions, you must keep the following considerations in mind:

- Your cluster must be a [multi-region cluster](multiregion-overview.html).
- Super regions [must be enabled](#enable-super-regions).
- Super regions can only contain [database regions](multiregion-overview.html#database-regions) that have already been added with [`ADD REGION`](add-region.html).
- Each database region can only belong to one super region. In other words, given two super regions _A_ and _B_, the set of database regions in _A_ must be [disjoint](https://en.wikipedia.org/wiki/Disjoint_sets) from the set of database regions in _B_.
- You cannot [drop a region](drop-region.html) that is part of a super region until you either [alter the super region](alter-super-region.html) to remove it, or [drop the super region](drop-super-region.html) altogether.
