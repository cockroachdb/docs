# Goals

Configure replication zones - https://www.cockroachlabs.com/docs/stable/configure-replication-zones.html
Replication demo - https://www.cockroachlabs.com/docs/stable/demo-data-replication.html
Rebalancing demo - https://www.cockroachlabs.com/docs/stable/demo-automatic-rebalancing.html
Fault Tolerance demo - https://www.cockroachlabs.com/docs/stable/demo-fault-tolerance-and-recovery.html

# Presentation

/----------------------------------------/

## Replication, Rebalancing, & Fault Tolerance

CockroachDB automatically, autonomously handles machine failures

/----------------------------------------/

## Agenda

- Replication
- Rebalance
- Fault Tolerance

/----------------------------------------/

## Replication

In architecture, talked about replication handles through Raft.

Requires quorum of nodes to acknowledge a write before it commits.

/----------------------------------------/

## Replication

You can control which data is replicated, how many times, and where with replication zones.

Granularity: Cluster, database, or table

{{site.data.alerts.callout_info}}Row-level granularity is coming in a future release.{{site.data.alerts.end}}

Replication Factor: An odd intenger (3, 5, etc.) <= number of nodes matching constraint

Constraints: `--locality`, `--attrs`

/----------------------------------------/

## Replication

### Example

Replicate all data from table `us-customers` 5 times, and only place the data on nodes in the US.

- Requires using `--locality=nation=` on all nodes to identify where they're deployed

Create YAML file, `us_customers.yaml`:

~~~ yaml
num_replicas: 5
constraints: [+nation=us]
~~~

~~~ shell
$ cockroach zone set db.us-customers -f us_customers.yaml
~~~

/----------------------------------------/

## Fault Tolerance

Cockroach can survives:

(n - 1)/2 failures

Where n is the replication factor of a piece of data.

As long as you don't experience more failures than that, CockroachDB is highly available.

/----------------------------------------/

## Fault Tolerance

When a Raft group member stops reporting, CockroachDB waits 5 minutes, and then begins rebalancing as discussed in architecture.

# Lab