### Consistency
The requirement that a transaction must change affected data only in allowed ways. CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/ACID) and the [CAP theorem](https://wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition.

### Isolation
The degree to which a transaction may be affected by other transactions running at the same time. CockroachDB provides the [`SERIALIZABLE`](https://wikipedia.org/wiki/Serializability) and `READ COMMITTED` isolation levels. For more information, see [Isolation levels]({% link {{ page.version.version }}/transactions.md %}#isolation-levels).

### Consensus
<a name="architecture-overview-consensus"></a> The process of reaching agreement on whether a transaction is committed or aborted. CockroachDB uses the [Raft consensus protocol](#architecture-raft). In CockroachDB, when a range receives a write, a [quorum](https://wikipedia.org/wiki/Quorum_%28distributed_computing%29) of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.

When a write does not achieve consensus, forward progress halts to maintain consistency within the cluster.

### Replication
The process of creating and distributing copies of data, as well as ensuring that those copies remain consistent. CockroachDB requires all writes to propagate to a [quorum](https://wikipedia.org/wiki/Quorum_%28distributed_computing%29) of copies of the data before being considered committed. This ensures the consistency of your data.

### Transaction
A set of operations performed on a database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/ACID). This is a crucial feature for a consistent system to ensure developers can trust the data in their database. For more information about how transactions work in CockroachDB, see [Transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %}).

### Transaction contention
<a name="architecture-overview-contention"></a> A [state of conflict]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) that occurs when: 

- A [transaction]({% link {{ page.version.version }}/transactions.md %}) is unable to complete due to another concurrent or recent transaction attempting to write to the same data. This is also called *lock contention*.
- A transaction is [automatically retried]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) because it could not be placed into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}) among all of the currently executing transactions. This is also called a *serializability conflict*. If the automatic retry is not possible or fails, a [*transaction retry error*](../transaction-retry-error-reference.html) is emitted to the client, requiring the client application to [retry the transaction](../transaction-retry-error-reference.html#client-side-retry-handling).

Steps should be taken to [reduce transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#reduce-transaction-contention) in the first place.

### Multi-active availability
A consensus-based notion of high availability that lets each node in the cluster handle reads and writes for a subset of the stored data (on a per-range basis). This is in contrast to _active-passive replication_, in which the active node receives 100% of request traffic, and _active-active_ replication, in which all nodes accept requests but typically cannot guarantee that reads are both up-to-date and fast.

### User
A SQL user is an identity capable of executing SQL statements and performing other cluster actions against CockroachDB clusters. SQL users must authenticate with an option permitted on the cluster (username/password, single sign-on (SSO), or certificate). Note that a SQL/cluster user is distinct from a CockroachDB {{ site.data.products.cloud }} organization user.
