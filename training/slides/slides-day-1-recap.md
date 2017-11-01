# Goals

Recommended production settings - https://www.cockroachlabs.com/docs/stable/recommended-production-settings.html
Manual & Cloud Deployment guides

# Presentation

/----------------------------------------/

## Recap

- CockroachDB is a scalable, SQL database
- Its architecture is built on 5 layers that work together to build automated operations and distributed transactions.
- Starting and scaling a cluster requires `cockroach start` (and a one-time `cockroach init` command)
- To ensure survivability, CockroachDB offers automated replication and rebalancing
- You can import data through `pg_dump` or CSV
- To control access, create users
- CockroachDB requires SSLs in production
- Manually deploying CockroachDB is straightforward, but we typically recommend orchestration

/----------------------------------------/

## Questions?

/----------------------------------------/

## Tomorrow

- More for developers
- Advanced operator guides
