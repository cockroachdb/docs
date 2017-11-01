# Goals

Upgrade a cluster's version - https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version.html

# Presentation

/----------------------------------------/

## Upgrade a Cluster

CockroachDB offers no-downtime rolling upgrades.

We aspire to promise incremental upgrade paths between every version

/----------------------------------------/

## Agenda

- Rolling Upgrades
- Gotchas
- Best Practices

/----------------------------------------/

## Rolling Upgrades

1. Stop `cockroach` process
2. Move new binary into place
3. Rejoin cluster.
4. Wait > 1 minute to complete process on next node.

/----------------------------------------/

## Gotchas

Ensure cluster health is good with `cockroach node status` by making sure:

- All nodes are alive
- All nodes are on same version (upgrade if not)
- `ranges_unavailable` and `ranges_underreplicated` show `0` for all nodes

/----------------------------------------/

## Best Practices

Before upgrading:

- (`cockroach debug zip`)[https://www.cockroachlabs.com/docs/stable/debug-zip.html]
- [Back up your cluster](https://www.cockroachlabs.com/docs/stable/back-up-data.html)