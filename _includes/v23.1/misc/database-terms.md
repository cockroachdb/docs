## Database terms

### Consistency
The requirement that a transaction must change affected data only in allowed ways. CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/ACID) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition.

### Isolation
The  degree to which a transaction may be affected by other transactions running at the same time. CockroachDB provides the [`SERIALIZABLE`](https://en.wikipedia.org/wiki/Serializability) isolation level, which is the highest possible and guarantees that every committed transaction has the same result as if each transaction were run one at a time.

### Consensus
<a name="architecture-overview-consensus"></a> The process of reaching agreement on whether a transaction is committed or aborted. CockroachDB uses the [Raft consensus protocol](#architecture-raft). In CockroachDB, when a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.

When a write does not achieve consensus, forward progress halts to maintain consistency within the cluster.

### Replication
The process of creating and distributing copies of data, as well as ensuring that those copies remain consistent. CockroachDB requires all writes to propagate to a [quorum](https://en.wikipedia.org/wiki/Quorum_%28distributed_computing%29) of copies of the data before being considered committed. This ensures the consistency of your data.

### Transaction
A set of operations performed on a database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/ACID). This is a crucial feature for a consistent system to ensure developers can trust the data in their database. For more information about how transactions work in CockroachDB, see [Transaction Layer](transaction-layer.html).

### Contention
<a name="architecture-overview-contention"></a> A state of conflict that occurs when a [transaction](../transactions.html) is unable to complete due to another concurrent or recent transaction attempting to write to the same data. When CockroachDB experiences transaction contention, it will [automatically attempt to retry the failed transaction](../transactions.html#automatic-retries) without involving the client (i.e., silently). If the automatic retry is not possible or fails, a [transaction retry error](../transaction-retry-error-reference.html) is emitted to the client. The client application can be configured to [retry the transaction](../transaction-retry-error-reference.html#client-side-retry-handling) after receiving such an error, and to [minimize transaction retry errors](../transaction-retry-error-reference.html#minimize-transaction-retry-errors) in the first place where possible.

### Multi-active availability
A consensus-based notion of high availability that lets each node in the cluster handle reads and writes for a subset of the stored data (on a per-range basis). This is in contrast to _active-passive replication_, in which the active node receives 100% of request traffic, and _active-active_ replication, in which all nodes accept requests but typically cannot guarantee that reads are both up-to-date and fast.

### User
A SQL user is an identity capable of executing SQL statements and performing other cluster actions against CockroachDB clusters. SQL users must authenticate with an option permitted on the cluster (username/password, single sign-on (SSO), or certificate). Note that a SQL/cluster user is distinct from a {{ site.data.products.db }} organization user.
