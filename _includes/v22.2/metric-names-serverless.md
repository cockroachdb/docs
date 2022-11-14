Name | Description
-----|-----
`addsstable.applications` | Number of SSTable ingestions applied (i.e. applied by Replicas)
`addsstable.copies` | number of SSTable ingestions that required copying files during application
`addsstable.proposals` | Number of SSTable ingestions proposed (i.e. sent to Raft by lease holders)
`admission.wait_sum.kv-stores` | Total wait time in micros
`admission.wait_sum.kv` | Total wait time in micros
`admission.wait_sum.sql-kv-response` | Total wait time in micros
`admission.wait_sum.sql-sql-response` | Total wait time in micros
`capacity.available` | Available storage capacity
`capacity.reserved` | Capacity reserved for snapshots
`capacity.used` | Used storage capacity
`capacity` | Total storage capacity
`changefeed.backfill_count` | Number of changefeeds currently executing backfill
`changefeed.backfill_pending_ranges` | Number of ranges in an ongoing backfill that are yet to be fully emitted
`changefeed.commit_latency` | Event commit latency: a difference between event MVCC timestamp and the time it was acknowledged by the downstream sink.  If the sink batches events,  then the difference between the oldest event in the batch and acknowledgement is recorded; Excludes latency during backfill
`changefeed.emitted_messages` | Messages emitted by all feeds
`changefeed.error_retries` | Total retryable errors encountered by all changefeeds
`changefeed.failures` | Total number of changefeed jobs which have failed
`changefeed.max_behind_nanos` | Largest commit-to-emit duration of any running feed
`changefeed.message_size_hist` | Message size histogram
`changefeed.running` | Number of currently running changefeeds, including sinkless
`clock-offset.meannanos` | Mean clock offset with other nodes
`clock-offset.stddevnanos` | Stddev clock offset with other nodes
`distsender.batches.partial` | Number of partial batches processed after being divided on range boundaries
`distsender.batches` | Number of batches processed
`distsender.errors.notleaseholder` | Number of NotLeaseHolderErrors encountered from replica-addressed RPCs
`distsender.rpc.sent.local` | Number of replica-addressed RPCs sent through the local-server optimization
`distsender.rpc.sent.nextreplicaerror` | Number of replica-addressed RPCs sent due to per-replica errors
`distsender.rpc.sent` | Number of replica-addressed RPCs sent
`exec.error` | Number of batch KV requests that failed to execute on this node. This count excludes transaction restart/abort errors. However, it will include other errors expected during normal operation, such as ConditionFailedError. This metric is thus not an indicator of KV health.
`exec.latency` | Latency of batch KV requests (including errors) executed on this node. This measures requests already addressed to a single replica, from the moment at which they arrive at the internal gRPC endpoint to the moment at which the response (or an error) is returned. This latency includes in particular commit waits, conflict resolution and replication, and end-users can easily produce high measurements via long-running transactions that conflict with foreground traffic. This metric thus does not provide a good signal for understanding the health of the KV layer.
`exec.success` | Number of batch KV requests executed successfully on this node. A request is considered to have executed 'successfully' if it either returns a result or a transaction restart/abort error.
`gcbytesage` | Cumulative age of non-live data
`gossip.bytes.received` | Number of received gossip bytes
`gossip.bytes.sent` | Number of sent gossip bytes
`gossip.connections.incoming` | Number of active incoming gossip connections
`gossip.connections.outgoing` | Number of active outgoing gossip connections
`gossip.connections.refused` | Number of refused incoming gossip connections
`gossip.infos.received` | Number of received gossip Info objects
`gossip.infos.sent` | Number of sent gossip Info objects
`intentage` | Cumulative age of intents
`intentbytes` | Number of bytes in intent KV pairs
`intentcount` | Count of intent keys
`jobs.changefeed.resume_retry_error` | Number of changefeed jobs which failed with a retriable error
`keybytes` | Number of bytes taken up by keys
`keycount` | Count of all keys
`leases.epoch` | Number of replica leaseholders using epoch-based leases
`leases.error` | Number of failed lease requests
`leases.expiration` | Number of replica leaseholders using expiration-based leases
`leases.success` | Number of successful lease requests
`leases.transfers.error` | Number of failed lease transfers
`leases.transfers.success` | Number of successful lease transfers
`livebytes` | Number of bytes of live data (keys plus values)
`livecount` | Count of live keys
`liveness.epochincrements` | Number of times this node has incremented its liveness epoch
`liveness.heartbeatfailures` | Number of failed node liveness heartbeats from this node
`liveness.heartbeatlatency` | Node liveness heartbeat latency
`liveness.heartbeatsuccesses` | Number of successful node liveness heartbeats from this node
`liveness.livenodes` | Number of live nodes in the cluster (will be 0 if this node is not itself live)
`queue.consistency.pending` | Number of pending replicas in the consistency checker queue
`queue.consistency.process.failure` | Number of replicas which failed processing in the consistency checker queue
`queue.consistency.process.success` | Number of replicas successfully processed by the consistency checker queue
`queue.consistency.processingnanos` | Nanoseconds spent processing replicas in the consistency checker queue
`queue.gc.info.abortspanconsidered` | Number of AbortSpan entries old enough to be considered for removal
`queue.gc.info.abortspangcnum` | Number of AbortSpan entries fit for removal
`queue.gc.info.abortspanscanned` | Number of transactions present in the AbortSpan scanned from the engine
`queue.gc.info.intentsconsidered` | Number of 'old' intents
`queue.gc.info.intenttxns` | Number of associated distinct transactions
`queue.gc.info.numkeysaffected` | Number of keys with GC'able data
`queue.gc.info.pushtxn` | Number of attempted pushes
`queue.gc.info.resolvesuccess` | Number of successful intent resolutions
`queue.gc.info.resolvetotal` | Number of attempted intent resolutions
`queue.gc.info.transactionspangcaborted` | Number of GC'able entries corresponding to aborted txns
`queue.gc.info.transactionspangccommitted` | Number of GC'able entries corresponding to committed txns
`queue.gc.info.transactionspangcpending` | Number of GC'able entries corresponding to pending txns
`queue.gc.info.transactionspanscanned` | Number of entries in transaction spans scanned from the engine
`queue.gc.pending` | Number of pending replicas in the MVCC GC queue
`queue.gc.process.failure` | Number of replicas which failed processing in the MVCC GC queue
`queue.gc.process.success` | Number of replicas successfully processed by the MVCC GC queue
`queue.gc.processingnanos` | Nanoseconds spent processing replicas in the MVCC GC queue
`queue.raftlog.pending` | Number of pending replicas in the Raft log queue
`queue.raftlog.process.failure` | Number of replicas which failed processing in the Raft log queue
`queue.raftlog.process.success` | Number of replicas successfully processed by the Raft log queue
`queue.raftlog.processingnanos` | Nanoseconds spent processing replicas in the Raft log queue
`queue.raftsnapshot.pending` | Number of pending replicas in the Raft repair queue
`queue.raftsnapshot.process.failure` | Number of replicas which failed processing in the Raft repair queue
`queue.raftsnapshot.process.success` | Number of replicas successfully processed by the Raft repair queue
`queue.raftsnapshot.processingnanos` | Nanoseconds spent processing replicas in the Raft repair queue
`queue.replicagc.pending` | Number of pending replicas in the replica GC queue
`queue.replicagc.process.failure` | Number of replicas which failed processing in the replica GC queue
`queue.replicagc.process.success` | Number of replicas successfully processed by the replica GC queue
`queue.replicagc.processingnanos` | Nanoseconds spent processing replicas in the replica GC queue
`queue.replicagc.removereplica` | Number of replica removals attempted by the replica GC queue
`queue.replicate.addreplica` | Number of replica additions attempted by the replicate queue
`queue.replicate.pending` | Number of pending replicas in the replicate queue
`queue.replicate.process.failure` | Number of replicas which failed processing in the replicate queue
`queue.replicate.process.success` | Number of replicas successfully processed by the replicate queue
`queue.replicate.processingnanos` | Nanoseconds spent processing replicas in the replicate queue
`queue.replicate.purgatory` | Number of replicas in the replicate queue's purgatory, awaiting allocation options
`queue.replicate.rebalancereplica` | Number of replica rebalancer-initiated additions attempted by the replicate queue
`queue.replicate.removedeadreplica` | Number of dead replica removals attempted by the replicate queue (typically in response to a node outage)
`queue.replicate.removereplica` | Number of replica removals attempted by the replicate queue (typically in response to a rebalancer-initiated addition)
`queue.replicate.transferlease` | Number of range lease transfers attempted by the replicate queue
`queue.split.pending` | Number of pending replicas in the split queue
`queue.split.process.failure` | Number of replicas which failed processing in the split queue
`queue.split.process.success` | Number of replicas successfully processed by the split queue
`queue.split.processingnanos` | Nanoseconds spent processing replicas in the split queue
`queue.tsmaintenance.pending` | Number of pending replicas in the time series maintenance queue
`queue.tsmaintenance.process.failure` | Number of replicas which failed processing in the time series maintenance queue
`queue.tsmaintenance.process.success` | Number of replicas successfully processed by the time series maintenance queue
`queue.tsmaintenance.processingnanos` | Nanoseconds spent processing replicas in the time series maintenance queue
`raft.commandsapplied` | Count of Raft commands applied. This measurement is taken on the Raft apply loops of all Replicas (leaders and followers alike), meaning that it does not measure the number of Raft commands *proposed* (in the hypothetical extreme case, all Replicas may apply all commands through snapshots, thus not increasing this metric at all). Instead, it is a proxy for how much work is being done advancing the Replica state machines on this node.
`raft.heartbeats.pending` | Number of pending heartbeats and responses waiting to be coalesced
`raft.process.commandcommit.latency` | Latency histogram for applying a batch of Raft commands to the state machine. This metric is misnamed: it measures the latency for *applying* a batch of committed Raft commands to a Replica state machine. This requires only non-durable I/O (except for replication configuration changes). Note that a "batch" in this context is really a sub-batch of the batch received for application during raft ready handling. The 'raft.process.applycommitted.latency' histogram is likely more suitable in most cases, as it measures the total latency across all sub-batches (i.e. the sum of commandcommit.latency for a complete batch).
`raft.process.logcommit.latency` | Latency histogram for committing Raft log entries to stable storage. This measures the latency of durably committing a group of newly received Raft entries as well as the HardState entry to disk. This excludes any data processing, i.e. we measure purely the commit latency of the resulting Engine write. Homogeneous bands of p50-p99 latencies (in the presence of regular Raft traffic), make it likely that the storage layer is healthy. Spikes in the latency bands can either hint at the presence of large sets of Raft entries being received, or at performance issues at the storage layer.
`raft.process.tickingnanos` | Nanoseconds spent in store.processRaft() processing replica.Tick()
`raft.process.workingnanos` | Nanoseconds spent in store.processRaft() working. This is the sum of the measurements passed to the raft.process.handleready.latency histogram.
`raft.rcvd.app` | Number of MsgApp messages received by this store
`raft.rcvd.appresp` | Number of MsgAppResp messages received by this store
`raft.rcvd.dropped` | Number of incoming Raft messages dropped (due to queue length or size)
`raft.rcvd.heartbeat` | Number of (coalesced, if enabled) MsgHeartbeat messages received by this store
`raft.rcvd.heartbeatresp` | Number of (coalesced, if enabled) MsgHeartbeatResp messages received by this store
`raft.rcvd.prevote` | Number of MsgPreVote messages received by this store
`raft.rcvd.prevoteresp` | Number of MsgPreVoteResp messages received by this store
`raft.rcvd.prop` | Number of MsgProp messages received by this store
`raft.rcvd.snap` | Number of MsgSnap messages received by this store
`raft.rcvd.timeoutnow` | Number of MsgTimeoutNow messages received by this store
`raft.rcvd.transferleader` | Number of MsgTransferLeader messages received by this store
`raft.rcvd.vote` | Number of MsgVote messages received by this store
`raft.rcvd.voteresp` | Number of MsgVoteResp messages received by this store
`raft.ticks` | Number of Raft ticks queued
`raftlog.behind` | Number of Raft log entries followers on other stores are behind. This gauge provides a view of the aggregate number of log entries the Raft leaders on this node think the followers are behind. Since a raft leader may not always have a good estimate for this information for all of its followers, and since followers are expected to be behind (when they are not required as part of a quorum) *and* the aggregate thus scales like the count of such followers, it is difficult to meaningfully interpret this metric.
`raftlog.truncated` | Number of Raft log entries truncated
`range.adds` | Number of range additions
`range.raftleadertransfers` | Number of raft leader transfers
`range.removes` | Number of range removals
`range.snapshots.generated` | Number of generated snapshots
`range.snapshots.recv-in-progress` | Number of non-empty snapshots in progress on a receiver store
`range.snapshots.recv-queue` | Number of queued non-empty snapshots on a receiver store
`range.snapshots.recv-total-in-progress` | Number of empty and non-empty snapshots in progress on a receiver store
`range.snapshots.send-in-progress` | Number of non-empty snapshots in progress on a sender store
`range.snapshots.send-queue` | Number of queued non-empty snapshots on a sender store
`range.snapshots.send-total-in-progress` | Number of empty and non-empty in-progress
snapshots on a sender store
`range.splits` | Number of range splits
`ranges.overreplicated` | Number of ranges with more live replicas than the replication target
`ranges.unavailable` | Number of ranges with fewer live replicas than needed for quorum
`ranges.underreplicated` | Number of ranges with fewer live replicas than the replication target
`ranges` | Number of ranges
`rebalancing.writespersecond` | Number of keys written (i.e. applied by raft) per second to the store, averaged over a large time period as used in rebalancing decisions
`replicas.leaders_not_leaseholders` | Number of replicas that are Raft leaders whose range lease is held by another store
`replicas.leaders` | Number of raft leaders
`replicas.leaseholders` | Number of lease holders
`replicas.quiescent` | Number of quiesced replicas
`replicas.reserved` | Number of replicas reserved for snapshots
`replicas` | Number of replicas
`requests.backpressure.split` | Number of backpressured writes waiting on a range split. A range will backpressure (roughly) non-system traffic when the range is above the configured size until the range splits. When the rate of this metric is nonzero over extended periods of time, it should be investigated why splits are not occurring.
`requests.slow.distsender` | Number of replica-bound RPCs currently stuck or retrying for a long time. Note that this is not a good signal for KV health. The remote side of the RPCs tracked here may experience contention, so an end user can easily cause values for this metric to be emitted by leaving a transaction open for a long time and contending with it using a second transaction.
`requests.slow.lease` | Number of requests that have been stuck for a long time acquiring a lease. This gauge registering a nonzero value usually indicates range or replica unavailability, and should be investigated. In the common case, we also expect to see requests.slow.raft to register a nonzero value, indicating that the lease requests are not getting a timely response from the replication layer.
`requests.slow.raft` | Number of requests that have been stuck for a long time in the replication layer. An (evaluated) request has to pass through the replication layer, notably the quota pool and raft. If it fails to do so within a highly permissive duration, the gauge is incremented (and decremented again once the request is either applied or returns an error). A nonzero value indicates range or replica unavailability, and should be investigated.
`rocksdb.block.cache.hits` | Count of block cache hits
`rocksdb.block.cache.misses` | Count of block cache misses
`rocksdb.block.cache.pinned-usage` | Bytes pinned by the block cache
`rocksdb.block.cache.usage` | Bytes used by the block cache
`rocksdb.bloom.filter.prefix.checked` | Number of times the bloom filter was checked
`rocksdb.bloom.filter.prefix.useful` | Number of times the bloom filter helped avoid iterator creation
`rocksdb.compactions` | Number of table compactions
`rocksdb.flushes` | Number of table flushes
`rocksdb.memtable.total-size` | Current size of memtable in bytes
`rocksdb.num-sstables` | Number of storage engine SSTables
`rocksdb.read-amplification` | Number of disk reads per query
`rocksdb.table-readers-mem-estimate` | Memory used by index and filter blocks
`round-trip-latency` | Distribution of round-trip latencies with other nodes
`sql.bytesin` | Number of sql bytes received
`sql.bytesout` | Number of sql bytes sent
`sql.conn.latency` | Latency to establish and authenticate a SQL connection
`sql.conns` | Number of active sql connections
`sql.ddl.count` | Number of SQL DDL statements successfully executed
`sql.delete.count` | Number of SQL DELETE statements successfully executed
`sql.distsql.contended_queries.count` | Number of SQL queries that experienced contention
`sql.distsql.exec.latency` | Latency of DistSQL statement execution
`sql.distsql.flows.active` | Number of distributed SQL flows currently active
`sql.distsql.flows.total` | Number of distributed SQL flows executed
`sql.distsql.queries.active` | Number of SQL queries currently active
`sql.distsql.queries.total` | Number of SQL queries executed
`sql.distsql.select.count` | Number of DistSQL SELECT statements
`sql.distsql.service.latency` | Latency of DistSQL request execution
`sql.exec.latency` | Latency of SQL statement execution
`sql.failure.count` | Number of statements resulting in a planning or runtime error
`sql.full.scan.count` | Number of full table or index scans
`sql.insert.count` | Number of SQL INSERT statements successfully executed
`sql.mem.distsql.current` | Current sql statement memory usage for distsql
`sql.mem.distsql.max` | Memory usage per sql statement for distsql
`sql.mem.internal.session.current` | Current sql session memory usage for internal
`sql.mem.internal.session.max` | Memory usage per sql session for internal
`sql.mem.internal.txn.current` | Current sql transaction memory usage for internal
`sql.mem.internal.txn.max` | Memory usage per sql transaction for internal
`sql.misc.count` | Number of other SQL statements successfully executed
`sql.query.count` | Number of SQL queries executed
`sql.select.count` | Number of SQL SELECT statements successfully executed
`sql.service.latency` | Latency of SQL request execution
`sql.statements.active` | Number of currently active user SQL statements
`sql.txn.abort.count` | Number of SQL transaction abort errors
`sql.txn.begin.count` | Number of SQL transaction BEGIN statements successfully executed
`sql.txn.commit.count` | Number of SQL transaction COMMIT statements successfully executed
`sql.txn.latency` | Latency of SQL transactions
`sql.txn.rollback.count` | Number of SQL transaction ROLLBACK statements successfully executed
`sql.txns.open` | Number of currently open user SQL transactions
`sql.update.count` | Number of SQL UPDATE statements successfully executed
`sys.cgo.allocbytes` | Current bytes of memory allocated by cgo
`sys.cgo.totalbytes` | Total bytes of memory allocated by cgo, but not released
`sys.cgocalls` | Total number of cgo calls
`sys.cpu.combined.percent-normalized` | Current user+system cpu percentage, normalized 0-1 by number of cores
`sys.cpu.sys.ns` | Total system cpu time
`sys.cpu.sys.percent` | Current system cpu percentage
`sys.cpu.user.ns` | Total user cpu time
`sys.cpu.user.percent` | Current user cpu percentage
`sys.fd.open` | Process open file descriptors
`sys.fd.softlimit` | Process open FD soft limit
`sys.gc.count` | Total number of GC runs
`sys.gc.pause.ns` | Total GC pause
`sys.gc.pause.percent` | Current GC pause percentage
`sys.go.allocbytes` | Current bytes of memory allocated by go
`sys.go.totalbytes` | Total bytes of memory allocated by go, but not released
`sys.goroutines` | Current number of goroutines
`sys.host.net.recv.bytes` | Bytes received on all network interfaces since this process started
`sys.host.net.send.bytes` | Bytes sent on all network interfaces since this process started
`sys.rss` | Current process RSS
`sys.uptime` | Process uptime
`sysbytes` | Number of bytes in system KV pairs
`syscount` | Count of system KV pairs
`timeseries.write.bytes` | Total size in bytes of metric samples written to disk
`timeseries.write.errors` | Total errors encountered while attempting to write metrics to disk
`timeseries.write.samples` | Total number of metric samples written to disk
`totalbytes` | Total number of bytes taken up by keys and values including non-live data
`txn.aborts` | Number of aborted KV transactions
`txn.commits1PC` | Number of KV transaction one-phase commit attempts
`txn.commits` | Number of committed KV transactions (including 1PC)
`txn.durations` | KV transaction durations
`txn.restarts.serializable` | Number of restarts due to a forwarded commit timestamp and isolation=SERIALIZABLE
`txn.restarts.writetooold` | Number of restarts due to a concurrent writer committing first
`txn.restarts` | Number of restarted KV transactions
`valbytes` | Number of bytes taken up by values
`valcount` | Count of all values
