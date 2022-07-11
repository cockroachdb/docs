Name | Help
-----|-----
`abortspanbytes` | 
`addsstable.applications` | Number of SSTable ingestions applied (i.e., applied by Replicas)
`addsstable.aswrites` | 
`addsstable.copies` | Number of SSTable ingestions that required copying files during application
`addsstable.delay.enginebackpressure` | 
`addsstable.delay.total` | 
`addsstable.proposals` | Number of SSTable ingestions proposed (i.e., sent to Raft by lease holders)
`build.timestamp` | Build information
`capacity.available` | Available storage capacity
`capacity.reserved` | Capacity reserved for snapshots
`capacity.used` | Used storage capacity
`capacity` | Total storage capacity
`changefeed.buffer_entries.in` | 
`changefeed.buffer_entries.out` | 
`changefeed.buffer_entries.released` | 
`changefeed.buffer_entries_mem.acquired` | 
`changefeed.buffer_entries_mem.released` | 
`changefeed.buffer_pushback_nanos` | 
`changefeed.checkpoint_hist_nanos` | 
`changefeed.error_retries` | 
`changefeed.failures` | Total number of changefeed jobs which have failed
`changefeed.forwarded_resolved_messages` | 
`changefeed.frontier_updates` | 
`changefeed.max_behind_nanos` | 
`changefeed.queue_time_nanos` | 
`changefeed.running` | Number of currently running changefeeds, including sinkless
`changefeed.table_metadata_nanos` | 
`clock-offset.meannanos` | Mean clock offset with other nodes in nanoseconds
`clock-offset.stddevnanos` | Std dev clock offset with other nodes in nanoseconds
`compactor.compactingnanos` | Number of nanoseconds spent compacting ranges
`compactor.compactions.failure` | Number of failed compaction requests sent to the storage engine
`compactor.compactions.success` | Number of successful compaction requests sent to the storage engine
`compactor.suggestionbytes.compacted` | Number of logical bytes compacted from suggested compactions
`compactor.suggestionbytes.queued` | Number of logical bytes in suggested compactions in the queue
`compactor.suggestionbytes.skipped` | Number of logical bytes in suggested compactions which were not compacted
`distsender.batches.async.sent` | 
`distsender.batches.async.throttled` | 
`distsender.batches.partial` | Number of partial batches processed
`distsender.batches` | Number of batches processed
`distsender.errors.inleasetransferbackoffs` | 
`distsender.errors.notleaseholder` | Number of NotLeaseHolderErrors encountered
`distsender.rangefeed.catchup_ranges` | 
`distsender.rangefeed.error_catchup_ranges` | 
`distsender.rangefeed.total_ranges` | 
`distsender.rangelookups` | 
`distsender.rpc.%s.sent` | 
`distsender.rpc.err.%s` | 
`distsender.rpc.sent.local` | Number of local RPCs sent
`distsender.rpc.sent.nextreplicaerror` | Number of RPCs sent due to per-replica errors
`distsender.rpc.sent` | Number of RPCs sent
`engine.stalls` | 
`exec.error` | Number of batch KV requests that failed to execute on this node
`exec.latency` | Latency in nanoseconds of batch KV requests executed on this node
`exec.success` | Number of batch KV requests executed successfully on this node
`exportrequest.delay.total` | 
`follower_reads.success_count` | 
`gcbytesage` | Cumulative age of non-live data in seconds
`gossip.bytes.received` | Number of received gossip bytes
`gossip.bytes.sent` | Number of sent gossip bytes
`gossip.connections.incoming` | Number of active incoming gossip connections
`gossip.connections.outgoing` | Number of active outgoing gossip connections
`gossip.connections.refused` | Number of refused incoming gossip connections
`gossip.infos.received` | Number of received gossip Info objects
`gossip.infos.sent` | Number of sent gossip Info objects
`intentage` | Cumulative age of intents in seconds
`intentbytes` | Number of bytes in intent KV pairs
`intentcount` | Count of intent keys
`intentresolver.async.throttled` | 
`intentresolver.finalized_txns.failed` | 
`intentresolver.intents.failed` | 
`intents.abort-attempts` | 
`intents.poison-attempts` | 
`intents.resolve-attempts` | 
`jobs.adopt_iterations` | 
`jobs.claimed_jobs` | 
`jobs.resumed_claimed_jobs` | 
`keybytes` | Number of bytes taken up by keys
`keycount` | Count of all keys
`kv.allocator.load_based_lease_transfers.cannot_find_better_candidate` | 
`kv.allocator.load_based_lease_transfers.delta_not_significant` | 
`kv.allocator.load_based_lease_transfers.existing_not_overfull` | 
`kv.allocator.load_based_lease_transfers.missing_stats_for_existing_stores` | 
`kv.allocator.load_based_lease_transfers.should_transfer` | 
`kv.allocator.load_based_lease_transfers.significantly_switches_relative_disposition` | 
`kv.allocator.load_based_replica_rebalancing.cannot_find_better_candidate` | 
`kv.allocator.load_based_replica_rebalancing.delta_not_significant` | 
`kv.allocator.load_based_replica_rebalancing.existing_not_overfull` | 
`kv.allocator.load_based_replica_rebalancing.missing_stats_for_existing_store` | 
`kv.allocator.load_based_replica_rebalancing.should_transfer` | 
`kv.allocator.load_based_replica_rebalancing.significantly_switches_relative_disposition` | 
`kv.closed_timestamp.failures_to_close` | 
`kv.closed_timestamp.max_behind_nanos` | 
`kv.concurrency.avg_lock_hold_duration_nanos` | 
`kv.concurrency.avg_lock_wait_duration_nanos` | 
`kv.concurrency.lock_wait_queue_waiters` | 
`kv.concurrency.locks_with_wait_queues` | 
`kv.concurrency.locks` | 
`kv.concurrency.max_lock_hold_duration_nanos` | 
`kv.concurrency.max_lock_wait_duration_nanos` | 
`kv.concurrency.max_lock_wait_queue_waiters_for_lock` | 
`kv.prober.planning_attempts` | 
`kv.prober.planning_failures` | 
`kv.prober.read.attempts` | 
`kv.prober.read.failures` | 
`kv.prober.read.latency` | 
`kv.prober.write.attempts` | 
`kv.prober.write.failures` | 
`kv.prober.write.latency` | 
`kv.protectedts.reconciliation.errors` | 
`kv.protectedts.reconciliation.num_runs` | 
`kv.protectedts.reconciliation.records_processed` | 
`kv.protectedts.reconciliation.records_removed` | 
`kv.rangefeed.budget_allocation_blocked` | 
`kv.rangefeed.budget_allocation_failed` | 
`kv.rangefeed.catchup_scan_nanos` | 
`kv.replica_circuit_breaker.num_tripped_events` | 
`kv.replica_circuit_breaker.num_tripped_replicas` | 
`kv.tenant_rate_limit.current_blocked` | 
`kv.tenant_rate_limit.num_tenants` | 
`kv.tenant_rate_limit.read_bytes_admitted` | 
`kv.tenant_rate_limit.read_requests_admitted` | 
`kv.tenant_rate_limit.write_bytes_admitted` | 
`kv.tenant_rate_limit.write_requests_admitted` | 
`lastupdatenanos` | Time in nanoseconds since Unix epoch at which bytes/keys/intents metrics were last updated
`leases.epoch` | Number of replica leaseholders using epoch-based leases
`leases.error` | Number of failed lease requests
`leases.expiration` | Number of replica leaseholders using expiration-based leases
`leases.success` | Number of successful lease requests
`leases.transfers.error` | Number of failed lease transfers
`leases.transfers.success` | Number of successful lease transfers
`livebytes` | Number of bytes of live data (keys plus values), including unreplicated data
`livecount` | Count of live keys
`liveness.epochincrements` | Number of times this node has incremented its liveness epoch
`liveness.heartbeatfailures` | Number of failed node liveness heartbeats from this node
`liveness.heartbeatlatency` | Node liveness heartbeat latency in nanoseconds
`liveness.heartbeatsinflight` | 
`liveness.heartbeatsuccesses` | Number of successful node liveness heartbeats from this node
`liveness.livenodes` | Number of live nodes in the cluster (will be 0 if this node is not itself live)
`node-id` | node ID with labels for advertised RPC and HTTP addresses
`proxy.balancer.rebalance.queued` | 
`proxy.balancer.rebalance.running` | 
`proxy.balancer.rebalance.total` | 
`proxy.conn_migration.attempted.latency` | 
`proxy.conn_migration.attempted` | 
`proxy.conn_migration.success` | 
`proxy.conn_migration.transfer_response.message_size` | 
`proxy.err.backend_disconnect` | 
`proxy.err.backend_down` | 
`proxy.err.client_disconnect` | 
`proxy.err.idle_disconnect` | 
`proxy.err.refused_conn` | 
`proxy.err.routing` | 
`proxy.sql.authentication_failures` | 
`proxy.sql.conns` | 
`proxy.sql.expired_client_conns` | 
`proxy.sql.successful_conns` | 
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
`queue.gc.info.resolvefailed` | 
`queue.gc.info.resolvesuccess` | Number of successful intent resolutions
`queue.gc.info.resolvetotal` | Number of attempted intent resolutions
`queue.gc.info.transactionresolvefailed` | 
`queue.gc.info.transactionspangcaborted` | Number of GC'able entries corresponding to aborted txns
`queue.gc.info.transactionspangccommitted` | Number of GC'able entries corresponding to committed txns
`queue.gc.info.transactionspangcpending` | Number of GC'able entries corresponding to pending txns
`queue.gc.info.transactionspangcstaging` | 
`queue.gc.info.transactionspanscanned` | Number of entries in transaction spans scanned from the engine
`queue.gc.pending` | Number of pending replicas in the GC queue
`queue.gc.process.failure` | Number of replicas which failed processing in the GC queue
`queue.gc.process.success` | Number of replicas successfully processed by the GC queue
`queue.gc.processingnanos` | Nanoseconds spent processing replicas in the GC queue
`queue.merge.pending` | 
`queue.merge.process.failure` | 
`queue.merge.process.success` | 
`queue.merge.processingnanos` | 
`queue.merge.purgatory` | 
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
`queue.replicagc.removereplica` | Number of replica removals attempted by the replica gc queue
`queue.replicate.addnonvoterreplica` | 
`queue.replicate.addreplica` | Number of replica additions attempted by the replicate queue
`queue.replicate.addvoterreplica` | 
`queue.replicate.nonvoterpromotions` | 
`queue.replicate.pending` | Number of pending replicas in the replicate queue
`queue.replicate.process.failure` | Number of replicas which failed processing in the replicate queue
`queue.replicate.process.success` | Number of replicas successfully processed by the replicate queue
`queue.replicate.processingnanos` | Nanoseconds spent processing replicas in the replicate queue
`queue.replicate.purgatory` | Number of replicas in the replicate queue's purgatory, awaiting allocation options
`queue.replicate.rebalancenonvoterreplica` | 
`queue.replicate.rebalancereplica` | Number of replica rebalancer-initiated additions attempted by the replicate queue
`queue.replicate.rebalancevoterreplica` | 
`queue.replicate.removedeadnonvoterreplica` | 
`queue.replicate.removedeadreplica` | Number of dead replica removals attempted by the replicate queue (typically in response to a node outage)
`queue.replicate.removedeadvoterreplica` | 
`queue.replicate.removedecommissioningnonvoterreplica` | 
`queue.replicate.removedecommissioningreplica` | 
`queue.replicate.removedecommissioningvoterreplica` | 
`queue.replicate.removelearnerreplica` | 
`queue.replicate.removenonvoterreplica` | 
`queue.replicate.removereplica` | Number of replica removals attempted by the replicate queue (typically in response to a rebalancer-initiated addition)
`queue.replicate.removevoterreplica` | 
`queue.replicate.transferlease` | Number of range lease transfers attempted by the replicate queue
`queue.replicate.voterdemotions` | 
`queue.split.pending` | Number of pending replicas in the split queue
`queue.split.process.failure` | Number of replicas which failed processing in the split queue
`queue.split.process.success` | Number of replicas successfully processed by the split queue
`queue.split.processingnanos` | Nanoseconds spent processing replicas in the split queue
`queue.split.purgatory` | 
`queue.tsmaintenance.pending` | Number of pending replicas in the time series maintenance queue
`queue.tsmaintenance.process.failure` | Number of replicas which failed processing in the time series maintenance queue
`queue.tsmaintenance.process.success` | Number of replicas successfully processed by the time series maintenance queue
`queue.tsmaintenance.processingnanos` | Nanoseconds spent processing replicas in the time series maintenance queue
`raft.commandsapplied` | Count of Raft commands applied
`raft.enqueued.pending` | Number of pending outgoing messages in the Raft Transport queue
`raft.entrycache.accesses` | 
`raft.entrycache.bytes` | 
`raft.entrycache.hits` | 
`raft.entrycache.size` | 
`raft.heartbeats.pending` | Number of pending heartbeats and responses waiting to be coalesced
`raft.process.applycommitted.latency` | 
`raft.process.commandcommit.latency` | Latency histogram in nanoseconds for committing Raft commands
`raft.process.handleready.latency` | 
`raft.process.logcommit.latency` | Latency histogram in nanoseconds for committing Raft log entries
`raft.process.tickingnanos` | Nanoseconds spent in store.processRaft() processing replica.Tick()
`raft.process.workingnanos` | Nanoseconds spent in store.processRaft() working
`raft.rcvd.app` | Number of MsgApp messages received by this store
`raft.rcvd.appresp` | Number of MsgAppResp messages received by this store
`raft.rcvd.dropped` | Number of dropped incoming Raft messages
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
`raft.scheduler.latency` | 
`raft.ticks` | Number of Raft ticks queued
`raft.timeoutcampaign` | 
`raftlog.behind` | Number of Raft log entries followers on other stores are behind
`raftlog.truncated` | Number of Raft log entries truncated
`range.adds` | Number of range additions
`range.merges` | 
`range.raftleadertransfers` | Number of Raft leader transfers
`range.recoveries` | 
`range.removes` | Number of range removals
`range.snapshots.applied-initial` | 
`range.snapshots.applied-non-voter` | 
`range.snapshots.applied-voter` | 
`range.snapshots.generated` | Number of generated snapshots
`range.snapshots.normal-applied` | Number of applied snapshots
`range.snapshots.preemptive-applied` | Number of applied pre-emptive snapshots
`range.snapshots.rcvd-bytes` | 
`range.snapshots.sent-bytes` | 
`range.splits` | Number of range splits
`ranges.overreplicated` | 
`ranges.unavailable` | Number of ranges with fewer live replicas than needed for quorum
`ranges.underreplicated` | Number of ranges with fewer live replicas than the replication target
`ranges` | Number of ranges
`rebalancing.lease.transfers` | 
`rebalancing.queriespersecond` | 
`rebalancing.range.rebalances` | 
`rebalancing.writespersecond` | Number of keys written (i.e., applied by Raft) per second to the store, averaged over a large time period as used in rebalancing decisions
`replicas.commandqueue.combinedqueuesize` | Number of commands in all CommandQueues combined
`replicas.commandqueue.combinedreadcount` | Number of read-only commands in all CommandQueues combined
`replicas.commandqueue.combinedwritecount` | Number of read-write commands in all CommandQueues combined
`replicas.commandqueue.maxoverlaps` | Largest number of overlapping commands seen when adding to any CommandQueue
`replicas.commandqueue.maxreadcount` | Largest number of read-only commands in any CommandQueue
`replicas.commandqueue.maxsize` | Largest number of commands in any CommandQueue
`replicas.commandqueue.maxtreesize` | Largest number of intervals in any CommandQueue's interval tree
`replicas.commandqueue.maxwritecount` | Largest number of read-write commands in any CommandQueue
`replicas.leaders_not_leaseholders` | Number of replicas that are Raft leaders whose range lease is held by another store
`replicas.leaders` | Number of Raft leaders
`replicas.leaseholders` | Number of lease holders
`replicas.quiescent` | Number of quiesced replicas
`replicas.reserved` | Number of replicas reserved for snapshots
`replicas.uninitialized` | 
`replicas` | Number of replicas
`requests.backpressure.split` | Number of backpressured writes waiting on a Range split
`requests.slow.commandqueue` | Number of requests that have been stuck for a long time in the command queue
`requests.slow.distsender` | Number of requests that have been stuck for a long time in the dist sender
`requests.slow.latch` | 
`requests.slow.lease` | Number of requests that have been stuck for a long time acquiring a lease
`requests.slow.raft` | Number of requests that have been stuck for a long time in Raft
`rocksdb.block.cache.hits` | Count of block cache hits
`rocksdb.block.cache.misses` | Count of block cache misses
`rocksdb.block.cache.pinned-usage` | Bytes pinned by the block cache
`rocksdb.block.cache.usage` | Bytes used by the block cache
`rocksdb.bloom.filter.prefix.checked` | Number of times the bloom filter was checked
`rocksdb.bloom.filter.prefix.useful` | Number of times the bloom filter helped avoid iterator creation
`rocksdb.compacted-bytes-read` | 
`rocksdb.compacted-bytes-written` | 
`rocksdb.compactions` | Number of table compactions
`rocksdb.encryption.algorithm` | 
`rocksdb.estimated-pending-compaction` | 
`rocksdb.flushed-bytes` | 
`rocksdb.flushes` | Number of table flushes
`rocksdb.ingested-bytes` | 
`rocksdb.memtable.total-size` | Current size of memtable in bytes
`rocksdb.num-sstables` | Number of storage engine SSTables
`rocksdb.read-amplification` | Number of disk reads per query
`rocksdb.table-readers-mem-estimate` | Memory used by index and filter blocks
`round-trip-latency` | Distribution of round-trip latencies with other nodes in nanoseconds
`rpc.batches.recv` | 
`rpc.heartbeats.failed` | 
`rpc.heartbeats.initializing` | 
`rpc.heartbeats.loops.exited` | 
`rpc.heartbeats.loops.started` | 
`rpc.heartbeats.nominal` | 
`rpc.method.%s.recv` | 
`security.certificate.expiration.ca-client-tenant` | 
`security.certificate.expiration.ca` | Expiration timestamp in seconds since Unix epoch for the CA certificate. 0 means no certificate or error.
`security.certificate.expiration.client-ca` | 
`security.certificate.expiration.client-tenant` | 
`security.certificate.expiration.node-client` | 
`security.certificate.expiration.node` | Expiration timestamp in seconds since Unix epoch for the node certificate. 0 means no certificate or error.
`security.certificate.expiration.ui-ca` | 
`security.certificate.expiration.ui` | 
`sql.bytesin` | Number of sql bytes received
`sql.bytesout` | Number of sql bytes sent
`sql.conns` | Number of active sql connections
`sql.ddl.count` | Number of SQL DDL statements
`sql.delete.count` | Number of SQL DELETE statements
`sql.disk.distsql.current` | 
`sql.disk.distsql.max` | 
`sql.disk.distsql.spilled.bytes.read` | 
`sql.disk.distsql.spilled.bytes.written` | 
`sql.distsql.contended_queries.count` | 
`sql.distsql.exec.latency` | Latency in nanoseconds of SQL statement executions running on the distributed execution engine. This metric does not include the time to parse and plan the statement.
`sql.distsql.flows.active` | Number of distributed SQL flows currently active
`sql.distsql.flows.queue_wait` | 
`sql.distsql.flows.queued` | 
`sql.distsql.flows.scheduled` | 
`sql.distsql.flows.total` | Number of distributed SQL flows executed
`sql.distsql.queries.active` | Number of distributed SQL queries currently active
`sql.distsql.queries.spilled` | 
`sql.distsql.queries.total` | Number of distributed SQL queries executed
`sql.distsql.select.count` | Number of DistSQL SELECT statements
`sql.distsql.service.latency` | Latency in nanoseconds of SQL statement executions running on the distributed execution engine, including the time to parse and plan the statement.
`sql.distsql.vec.openfds` | 
`sql.exec.latency` | Latency in nanoseconds of all SQL statement executions. This metric does not include the time to parse and plan the statement.
`sql.feature_flag_denial` | 
`sql.guardrails.max_row_size_err.count` | Number of times a large row violates the corresponding `sql.guardrails.max_row_size_err` limit.
`sql.guardrails.max_row_size_log.count` | Number of times a large row violates the corresponding `sql.guardrails.max_row_size_log` limit.
`sql.hydrated_table_cache.hits` | 
`sql.hydrated_table_cache.misses` | 
`sql.insert.count` | Number of SQL INSERT statements
`sql.mem.bulk.current` | 
`sql.mem.current` | Current sql statement memory usage
`sql.mem.distsql.current` | Current sql statement memory usage for distsql
`sql.mem.distsql.max` | Memory usage per sql statement for distsql
`sql.mem.max` | Memory usage per sql statement
`sql.mem.session.current` | Current sql session memory usage
`sql.mem.session.max` | Memory usage per sql session
`sql.mem.txn.current` | Current sql transaction memory usage
`sql.mem.txn.max` | Memory usage per sql transaction
`sql.misc.count` | Number of other SQL statements
`sql.pgwire_cancel.ignored` | Counter of the number of pgwire query cancel requests that were ignored due to rate limiting
`sql.pgwire_cancel.successful` | Counter of the number of pgwire query cancel requests that were successful
`sql.pgwire_cancel.total` | Counter of the number of pgwire query cancel requests
`sql.query.count` | Number of SQL queries
`sql.schema_changer.permanent_errors` | 
`sql.schema_changer.retry_errors` | 
`sql.schema_changer.running` | 
`sql.schema_changer.successes` | 
`sql.select.count` | Number of SQL SELECT statements
`sql.service.latency` | Latency in nanoseconds of SQL request execution, including the time to parse and plan the statement.
`sql.txn.abort.count` | Number of SQL transaction ABORT statements
`sql.txn.begin.count` | Number of SQL transaction BEGIN statements
`sql.txn.commit.count` | Number of SQL transaction COMMIT statements
`sql.txn.rollback.count` | Number of SQL transaction ROLLBACK statements
`sql.update.count` | Number of SQL UPDATE statements
`sqlliveness.is_alive.cache_hits` | 
`sqlliveness.is_alive.cache_misses` | 
`sqlliveness.sessions_deleted` | 
`sqlliveness.sessions_deletion_runs` | 
`sqlliveness.write_failures` | 
`sqlliveness.write_successes` | 
`storage.disk-slow` | 
`storage.disk-stalled` | 
`storage.marked-for-compaction-files` | 
`storage.write-stalls` | 
`streaming.events_ingested` | 
`streaming.flushes` | 
`streaming.ingested_bytes` | 
`streaming.resolved_events_ingested` | 
`sys.cgo.allocbytes` | Current bytes of memory allocated by cgo
`sys.cgo.totalbytes` | Total bytes of memory allocated by cgo, but not released
`sys.cgocalls` | Total number of cgo call
`sys.cpu.combined.percent-normalized` | 
`sys.cpu.now.ns` | 
`sys.cpu.sys.ns` | Total system cpu time in nanoseconds
`sys.cpu.sys.percent` | Current system cpu percentage
`sys.cpu.user.ns` | Total user cpu time in nanoseconds
`sys.cpu.user.percent` | Current user cpu percentage
`sys.fd.open` | Process open file descriptors
`sys.fd.softlimit` | Process open FD soft limit
`sys.gc.count` | Total number of GC runs
`sys.gc.pause.ns` | Total GC pause in nanoseconds
`sys.gc.pause.percent` | Current GC pause percentage
`sys.go.allocbytes` | Current bytes of memory allocated by go
`sys.go.totalbytes` | Total bytes of memory allocated by go, but not released
`sys.goroutines` | Current number of goroutines
`sys.host.disk.io.time` | 
`sys.host.disk.iopsinprogress` | 
`sys.host.disk.read.bytes` | 
`sys.host.disk.read.count` | 
`sys.host.disk.read.time` | 
`sys.host.disk.weightedio.time` | 
`sys.host.disk.write.bytes` | 
`sys.host.disk.write.count` | 
`sys.host.disk.write.time` | 
`sys.host.net.recv.bytes` | 
`sys.host.net.recv.packets` | 
`sys.host.net.send.bytes` | 
`sys.host.net.send.packets` | 
`sys.rss` | Current process RSS
`sys.runnable.goroutines.per.cpu` | 
`sys.uptime` | Process uptime in seconds
`sysbytes` | Number of bytes in system KV pairs
`syscount` | Count of system KV pairs
`tenant.consumption.pgwire_egress_bytes` | 
`tenant.consumption.read_bytes` | 
`tenant.consumption.read_requests` | 
`tenant.consumption.request_units` | 
`tenant.consumption.sql_pods_cpu_seconds` | 
`tenant.consumption.write_bytes` | 
`tenant.consumption.write_requests` | 
`timeseries.write.bytes` | Total size in bytes of metric samples written to disk
`timeseries.write.errors` | Total errors encountered while attempting to write metrics to disk
`timeseries.write.samples` | Total number of metric samples written to disk
`totalbytes` | Total number of bytes taken up by keys and values including non-live data
`tscache.skl.pages` | 
`tscache.skl.read.pages` | Number of pages in the read timestamp cache
`tscache.skl.read.rotations` | Number of page rotations in the read timestamp cache
`tscache.skl.rotations` | 
`tscache.skl.write.pages` | Number of pages in the write timestamp cache
`tscache.skl.write.rotations` | Number of page rotations in the write timestamp cache
`txn.abandons` | Number of abandoned KV transactions
`txn.aborts` | Number of aborted KV transactions
`txn.autoretries` | Number of automatic retries to avoid serializable restarts
`txn.commit_waits.before_commit_trigger` | 
`txn.commit_waits` | 
`txn.commits1PC` | Number of committed one-phase KV transactions
`txn.commits` | Number of committed KV transactions (including 1PC)
`txn.condensed_intent_spans_gauge` | 
`txn.condensed_intent_spans_rejected` | 
`txn.condensed_intent_spans` | 
`txn.durations` | KV transaction durations in nanoseconds
`txn.parallelcommits` | 
`txn.refresh.auto_retries` | 
`txn.refresh.fail_with_condensed_spans` | 
`txn.refresh.fail` | 
`txn.refresh.memory_limit_exceeded` | 
`txn.refresh.success` | 
`txn.restarts.asyncwritefailure` | 
`txn.restarts.commitdeadlineexceeded` | 
`txn.restarts.deleterange` | Number of restarts due to a forwarded commit timestamp and a DeleteRange command
`txn.restarts.possiblereplay` | Number of restarts due to possible replays of command batches at the storage layer
`txn.restarts.readwithinuncertainty` | 
`txn.restarts.serializable` | Number of restarts due to a forwarded commit timestamp and isolation=SERIALIZABLE
`txn.restarts.txnaborted` | 
`txn.restarts.txnpush` | 
`txn.restarts.unknown` | 
`txn.restarts.writetooold` | Number of restarts due to a concurrent writer committing first
`txn.restarts.writetoooldmulti` | 
`txn.restarts` | Number of restarted KV transactions
`txn.rollbacks.async.failed` | 
`txn.rollbacks.failed` | 
`valbytes` | Number of bytes taken up by values
`valcount` | Count of all values`sql.mem.bulk.max` | 
