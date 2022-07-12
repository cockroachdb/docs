Name | Description
-----|-----
`abortspanbytes` | Number of bytes in the abort span
`abortspanbytes` | Number of bytes in the abort span
`addsstable.applications` | Number of SSTable ingestions applied (i.e., applied by Replicas)
`addsstable.copies` | Number of SSTable ingestions that required copying files during application
`addsstable.delay.enginebackpressure` | Amount by which evaluation of AddSSTable requests was delayed by storage-engine backpressure
`addsstable.delay.total` | Amount by which evaluation of AddSSTable requests was delayed
`addsstable.proposals` | Number of SSTable ingestions proposed (i.e., sent to Raft by lease holders)
`admission.admitted.kv-stores` | Number of requests admitted
`admission.admitted.kv` | Number of requests admitted
`admission.admitted.sql-kv-response` | Number of requests admitted
`admission.admitted.sql-leaf-start` | Number of requests admitted
`admission.admitted.sql-root-start` | Number of requests admitted
`admission.admitted.sql-sql-response` | Number of requests admitted
`admission.errored.kv-stores` | Number of requests not admitted due to error
`admission.errored.kv` | Number of requests not admitted due to error
`admission.errored.sql-kv-response` | Number of requests not admitted due to error
`admission.errored.sql-leaf-start` | Number of requests not admitted due to error
`admission.errored.sql-root-start` | Number of requests not admitted due to error
`admission.errored.sql-sql-response` | Number of requests not admitted due to error
`admission.granter.io_tokens_exhausted_duration.kv` | Total duration when IO tokens were exhausted, in micros
`admission.granter.total_slots.kv` | Total slots for kv work
`admission.granter.used_slots.kv` | Used slots
`admission.granter.used_slots.sql-leaf-start` | Used slots
`admission.granter.used_slots.sql-root-start` | Used slots
`admission.requested.kv-stores` | Number of requests
`admission.requested.kv` | Number of requests
`admission.requested.sql-kv-response` | Number of requests
`admission.requested.sql-leaf-start` | Number of requests
`admission.requested.sql-root-start` | Number of requests
`admission.requested.sql-sql-response` | Number of requests
`admission.wait_durations.kv-stores` | Wait time durations for requests that waited
`admission.wait_durations.kv` | Wait time durations for requests that waited
`admission.wait_durations.sql-kv-response` | Wait time durations for requests that waited
`admission.wait_durations.sql-leaf-start` | Wait time durations for requests that waited
`admission.wait_durations.sql-root-start` | Wait time durations for requests that waited
`admission.wait_durations.sql-sql-response` | Wait time durations for requests that waited
`admission.wait_queue_length.kv-stores` | Length of wait queue
`admission.wait_queue_length.kv` | Length of wait queue
`admission.wait_queue_length.sql-kv-response` | Length of wait queue
`admission.wait_queue_length.sql-leaf-start` | Length of wait queue
`admission.wait_queue_length.sql-root-start` | Length of wait queue
`admission.wait_queue_length.sql-sql-response` | Length of wait queue
`admission.wait_sum.kv-stores` | Total wait time in micros
`admission.wait_sum.kv` | Total wait time in micros
`admission.wait_sum.sql-kv-response` | Total wait time in micros
`admission.wait_sum.sql-leaf-start` | Total wait time in micros
`admission.wait_sum.sql-root-start` | Total wait time in micros
`admission.wait_sum.sql-sql-response` | Total wait time in micros
`build.timestamp` | Build information
`capacity.available` | Available storage capacity
`capacity.reserved` | Capacity reserved for snapshots
`capacity.used` | Used storage capacity
`capacity` | Total storage capacity
`changefeed.buffer_entries.in` | Total entries entering the buffer between raft and changefeed sinks
`changefeed.buffer_entries.out` | Total entries leaving the buffer between raft and changefeed sinks
`changefeed.emitted_bytes` | Bytes emitted by all feeds
`changefeed.emitted_messages` | Messages emitted by all feeds
`changefeed.error_retries` | Total retryable errors encountered by all changefeeds
`changefeed.failures` | Total number of changefeed jobs which have failed
`changefeed.flushes` | Total flushes across all feeds
`changefeed.max_behind_nanos` | Largest commit-to-emit duration of any running feed
`changefeed.running` | Number of currently running changefeeds, including sinkless
`changefeed.table_metadata_nanos` | Time blocked while verifying table metadata histories
`clock-offset.meannanos` | Mean clock offset with other nodes in nanoseconds
`clock-offset.stddevnanos` | Std dev clock offset with other nodes in nanoseconds
`compactor.compactingnanos` | Number of nanoseconds spent compacting ranges
`compactor.compactions.failure` | Number of failed compaction requests sent to the storage engine
`compactor.compactions.success` | Number of successful compaction requests sent to the storage engine
`compactor.suggestionbytes.compacted` | Number of logical bytes compacted from suggested compactions
`compactor.suggestionbytes.queued` | Number of logical bytes in suggested compactions in the queue
`compactor.suggestionbytes.skipped` | Number of logical bytes in suggested compactions which were not compacted
`distsender.batches.async.sent` | Number of partial batches sent asynchronously
`distsender.batches.async.throttled` | Number of partial batches not sent asynchronously due to throttling
`distsender.batches.partial` | Number of partial batches processed
`distsender.batches` | Number of batches processed
`distsender.errors.inleasetransferbackoffs` | Number of times backed off due to NotLeaseHolderErrors during lease transfer
`distsender.errors.notleaseholder` | Number of NotLeaseHolderErrors encountered
`distsender.rangefeed.catchup_ranges` | Number of ranges in catchup mode. This counts the number of ranges with an active rangefeed that are performing catchup scan. 
`distsender.rangefeed.error_catchup_ranges` | Number of ranges in catchup mode which experienced an error
`distsender.rangefeed.total_ranges` | Number of ranges executing rangefeed. This counts the number of ranges with an active rangefeed. 
`distsender.rangelookups` | Number of range lookups
`distsender.rpc.addsstable.sent` | Number of AddSSTable requests sent
`distsender.rpc.adminchangereplicas.sent` | Number of AdminChangeReplicas requests sent
`distsender.rpc.adminmerge.sent` | Number of AdminMerge requests sent
`distsender.rpc.adminrelocaterange.sent` | Number of AdminRelocateRange requests sent
`distsender.rpc.adminscatter.sent` | Number of AdminScatter requests sent
`distsender.rpc.adminsplit.sent` | Number of AdminSplit requests sent
`distsender.rpc.admintransferlease.sent` | Number of AdminTransferLease requests sent
`distsender.rpc.adminunsplit.sent` | Number of AdminUnsplit requests sent
`distsender.rpc.adminverifyprotectedtimestamp.sent` | Number of AdminVerifyProtectedTimestamp requests sent
`distsender.rpc.barrier.sent` | Number of Barrier requests sent
`distsender.rpc.checkconsistency.sent` | Number of CheckConsistency requests sent
`distsender.rpc.clearrange.sent` | Number of ClearRange requests sent
`distsender.rpc.computechecksum.sent` | Number of ComputeChecksum requests sent
`distsender.rpc.conditionalput.sent` | Number of ConditionalPut requests sent
`distsender.rpc.delete.sent` | Number of Delete requests sent
`distsender.rpc.deleterange.sent` | Number of DeleteRange requests sent
`distsender.rpc.endtxn.sent` | Number of EndTxn requests sent
`distsender.rpc.export.sent` | Number of Export requests sent
`distsender.rpc.gc.sent` | Number of GC requests sent
`distsender.rpc.get.sent` | Number of Get requests sent
`distsender.rpc.heartbeattxn.sent` | Number of HeartbeatTxn requests sent
`distsender.rpc.increment.sent` | Number of Increment requests sent
`distsender.rpc.initput.sent` | Number of InitPut requests sent
`distsender.rpc.leaseinfo.sent` | Number of LeaseInfo requests sent
`distsender.rpc.merge.sent` | Number of Merge requests sent
`distsender.rpc.migrate.sent` | Number of Migrate requests sent
`distsender.rpc.pushtxn.sent` | Number of PushTxn requests sent
`distsender.rpc.put.sent` | Number of Put requests sent
`distsender.rpc.queryintent.sent` | Number of QueryIntent requests sent
`distsender.rpc.queryresolvedtimestamp.sent` | Number of QueryResolvedTimestamp requests sent
`distsender.rpc.querytxn.sent` | Number of QueryTxn requests sent
`distsender.rpc.rangestats.sent` | Number of RangeStats requests sent
`distsender.rpc.recomputestats.sent` | Number of RecomputeStats requests sent
`distsender.rpc.recovertxn.sent` | Number of RecoverTxn requests sent
`distsender.rpc.refresh.sent` | Number of Refresh requests sent
`distsender.rpc.refreshrange.sent` | Number of RefreshRange requests sent
`distsender.rpc.requestlease.sent` | Number of RequestLease requests sent
`distsender.rpc.resolveintent.sent` | Number of ResolveIntent requests sent
`distsender.rpc.resolveintentrange.sent` | Number of ResolveIntentRange requests sent
`distsender.rpc.reversescan.sent` | Number of ReverseScan requests sent
`distsender.rpc.revertrange.sent` | Number of RevertRange requests sent
`distsender.rpc.scan.sent` | Number of Scan requests sent
`distsender.rpc.scaninterleavedintents.sent` | Number of ScanInterleavedIntents requests sent
`distsender.rpc.sent.local` | Number of local RPCs sent
`distsender.rpc.sent.nextreplicaerror` | Number of RPCs sent due to per-replica errors
`distsender.rpc.sent` | Number of RPCs sent
`distsender.rpc.subsume.sent` | Number of Subsume requests sent
`distsender.rpc.transferlease.sent` | Number of TransferLease requests sent
`distsender.rpc.truncatelog.sent` | Number of TruncateLog requests sent
`distsender.rpc.writebatch.sent` | Number of WriteBatch requests sent
`engine.stalls` | Number of disk stalls detected on this node
`exec.error` | Number of batch KV requests that failed to execute on this node
`exec.latency` | Latency in nanoseconds of batch KV requests executed on this node
`exec.success` | Number of batch KV requests executed successfully on this node
`exportrequest.delay.total` | Amount by which evaluation of Export requests was delayed
`follower_reads.success_count` | Number of reads successfully processed by any replica
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
`intentresolver.async.throttled` | Number of intent resolution attempts not run asynchronously due to throttling
`intentresolver.finalized_txns.failed` | Number of finalized transaction cleanup failures. Transaction cleanup refers to the process of resolving all of a transactions intents and then garbage collecting its transaction record.
`intentresolver.intents.failed` | Number of intent resolution failures. The unit of measurement is a single intent, so if a batch of intent resolution requests fails, the metric will be incremented for each request in the batch.
`intents.abort-attempts` | Count of (point or range) non-poisoning intent abort evaluation attempts
`intents.poison-attempts` | Count of (point or range) poisoning intent abort evaluation attempts
`intents.resolve-attempts` | Count of (point or range) intent commit evaluation attempts
`jobs.adopt_iterations` | number of job-adopt iterations performed by the registry
`jobs.auto_create_stats.currently_running` | Number of auto_create_stats jobs currently running in Resume or OnFailOrCancel state
`jobs.auto_create_stats.fail_or_cancel_completed` | Number of auto_create_stats jobs which successfully completed their failure or cancelation process
`jobs.auto_create_stats.fail_or_cancel_failed` | Number of auto_create_stats jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.auto_create_stats.fail_or_cancel_retry_error` | Number of auto_create_stats jobs which failed with a retriable error on their failure or cancelation process
`jobs.auto_create_stats.resume_completed` | Number of auto_create_stats jobs which successfully resumed to completion
`jobs.auto_create_stats.resume_failed` | Number of auto_create_stats jobs which failed with a non-retriable error
`jobs.auto_create_stats.resume_retry_error` | Number of auto_create_stats jobs which failed with a retriable error
`jobs.auto_span_config_reconciliation.currently_running` | Number of auto_span_config_reconciliation jobs currently running in Resume or OnFailOrCancel state
`jobs.auto_span_config_reconciliation.fail_or_cancel_completed` | Number of auto_span_config_reconciliation jobs which successfully completed their failure or cancelation process
`jobs.auto_span_config_reconciliation.fail_or_cancel_failed` | Number of auto_span_config_reconciliation jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.auto_span_config_reconciliation.fail_or_cancel_retry_error` | Number of auto_span_config_reconciliation jobs which failed with a retriable error on their failure or cancelation process
`jobs.auto_span_config_reconciliation.resume_completed` | Number of auto_span_config_reconciliation jobs which successfully resumed to completion
`jobs.auto_span_config_reconciliation.resume_failed` | Number of auto_span_config_reconciliation jobs which failed with a non-retriable error
`jobs.auto_span_config_reconciliation.resume_retry_error` | Number of auto_span_config_reconciliation jobs which failed with a retriable error
`jobs.auto_sql_stats_compaction.currently_running` | Number of auto_sql_stats_compaction jobs currently running in Resume or OnFailOrCancel state
`jobs.auto_sql_stats_compaction.fail_or_cancel_completed` | Number of auto_sql_stats_compaction jobs which successfully completed their failure or cancelation process
`jobs.auto_sql_stats_compaction.fail_or_cancel_failed` | Number of auto_sql_stats_compaction jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.auto_sql_stats_compaction.fail_or_cancel_retry_error` | Number of auto_sql_stats_compaction jobs which failed with a retriable error on their failure or cancelation process
`jobs.auto_sql_stats_compaction.resume_completed` | Number of auto_sql_stats_compaction jobs which successfully resumed to completion
`jobs.auto_sql_stats_compaction.resume_failed` | Number of auto_sql_stats_compaction jobs which failed with a non-retriable error
`jobs.auto_sql_stats_compaction.resume_retry_error` | Number of auto_sql_stats_compaction jobs which failed with a retriable error
`jobs.backup.currently_running` | Number of backup jobs currently running in Resume or OnFailOrCancel state
`jobs.backup.fail_or_cancel_completed` | Number of backup jobs which successfully completed their failure or cancelation process
`jobs.backup.fail_or_cancel_failed` | Number of backup jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.backup.fail_or_cancel_retry_error` | Number of backup jobs which failed with a retriable error on their failure or cancelation process
`jobs.backup.resume_completed` | Number of backup jobs which successfully resumed to completion
`jobs.backup.resume_failed` | Number of backup jobs which failed with a non-retriable error
`jobs.backup.resume_retry_error` | Number of backup jobs which failed with a retriable error
`jobs.changefeed.currently_running` | Number of changefeed jobs currently running in Resume or OnFailOrCancel state
`jobs.changefeed.fail_or_cancel_completed` | Number of changefeed jobs which successfully completed their failure or cancelation process
`jobs.changefeed.fail_or_cancel_failed` | Number of changefeed jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.changefeed.fail_or_cancel_retry_error` | Number of changefeed jobs which failed with a retriable error on their failure or cancelation process
`jobs.changefeed.resume_completed` | Number of changefeed jobs which successfully resumed to completion
`jobs.changefeed.resume_failed` | Number of changefeed jobs which failed with a non-retriable error
`jobs.changefeed.resume_retry_error` | Number of changefeed jobs which failed with a retriable error
`jobs.claimed_jobs` | number of jobs claimed in job-adopt iterations
`jobs.create_stats.currently_running` | Number of create_stats jobs currently running in Resume or OnFailOrCancel state
`jobs.create_stats.fail_or_cancel_completed` | Number of create_stats jobs which successfully completed their failure or cancelation process
`jobs.create_stats.fail_or_cancel_failed` | Number of create_stats jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.create_stats.fail_or_cancel_retry_error` | Number of create_stats jobs which failed with a retriable error on their failure or cancelation process
`jobs.create_stats.resume_completed` | Number of create_stats jobs which successfully resumed to completion
`jobs.create_stats.resume_failed` | Number of create_stats jobs which failed with a non-retriable error
`jobs.create_stats.resume_retry_error` | Number of create_stats jobs which failed with a retriable error
`jobs.import.currently_running` | Number of import jobs currently running in Resume or OnFailOrCancel state
`jobs.import.fail_or_cancel_completed` | Number of import jobs which successfully completed their failure or cancelation process
`jobs.import.fail_or_cancel_failed` | Number of import jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.import.fail_or_cancel_retry_error` | Number of import jobs which failed with a retriable error on their failure or cancelation process
`jobs.import.resume_completed` | Number of import jobs which successfully resumed to completion
`jobs.import.resume_failed` | Number of import jobs which failed with a non-retriable error
`jobs.import.resume_retry_error` | Number of import jobs which failed with a retriable error
`jobs.migration.currently_running` | Number of migration jobs currently running in Resume or OnFailOrCancel state
`jobs.migration.fail_or_cancel_completed` | Number of migration jobs which successfully completed their failure or cancelation process
`jobs.migration.fail_or_cancel_failed` | Number of migration jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.migration.fail_or_cancel_retry_error` | Number of migration jobs which failed with a retriable error on their failure or cancelation process
`jobs.migration.resume_completed` | Number of migration jobs which successfully resumed to completion
`jobs.migration.resume_failed` | Number of migration jobs which failed with a non-retriable error
`jobs.migration.resume_retry_error` | Number of migration jobs which failed with a retriable error
`jobs.new_schema_change.currently_running` | Number of new_schema_change jobs currently running in Resume or OnFailOrCancel state
`jobs.new_schema_change.fail_or_cancel_completed` | Number of new_schema_change jobs which successfully completed their failure or cancelation process
`jobs.new_schema_change.fail_or_cancel_failed` | Number of new_schema_change jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.new_schema_change.fail_or_cancel_retry_error` | Number of new_schema_change jobs which failed with a retriable error on their failure or cancelation process
`jobs.new_schema_change.resume_completed` | Number of new_schema_change jobs which successfully resumed to completion
`jobs.new_schema_change.resume_failed` | Number of new_schema_change jobs which failed with a non-retriable error
`jobs.new_schema_change.resume_retry_error` | Number of new_schema_change jobs which failed with a retriable error
`jobs.restore.currently_running` | Number of restore jobs currently running in Resume or OnFailOrCancel state
`jobs.restore.fail_or_cancel_completed` | Number of restore jobs which successfully completed their failure or cancelation process
`jobs.restore.fail_or_cancel_failed` | Number of restore jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.restore.fail_or_cancel_retry_error` | Number of restore jobs which failed with a retriable error on their failure or cancelation process
`jobs.restore.resume_completed` | Number of restore jobs which successfully resumed to completion
`jobs.restore.resume_failed` | Number of restore jobs which failed with a non-retriable error
`jobs.restore.resume_retry_error` | Number of restore jobs which failed with a retriable error
`jobs.resumed_claimed_jobs` | number of claimed-jobs resumed in job-adopt iterations
`jobs.schema_change.currently_running` | Number of schema_change jobs currently running in Resume or OnFailOrCancel state
`jobs.schema_change.fail_or_cancel_completed` | Number of schema_change jobs which successfully completed their failure or cancelation process
`jobs.schema_change.fail_or_cancel_failed` | Number of schema_change jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.schema_change.fail_or_cancel_retry_error` | Number of schema_change jobs which failed with a retriable error on their failure or cancelation process
`jobs.schema_change.resume_completed` | Number of schema_change jobs which successfully resumed to completion
`jobs.schema_change.resume_failed` | Number of schema_change jobs which failed with a non-retriable error
`jobs.schema_change.resume_retry_error` | Number of schema_change jobs which failed with a retriable error
`jobs.schema_change_gc.currently_running` | Number of schema_change_gc jobs currently running in Resume or OnFailOrCancel state
`jobs.schema_change_gc.fail_or_cancel_completed` | Number of schema_change_gc jobs which successfully completed their failure or cancelation process
`jobs.schema_change_gc.fail_or_cancel_failed` | Number of schema_change_gc jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.schema_change_gc.fail_or_cancel_retry_error` | Number of schema_change_gc jobs which failed with a retriable error on their failure or cancelation process
`jobs.schema_change_gc.resume_completed` | Number of schema_change_gc jobs which successfully resumed to completion
`jobs.schema_change_gc.resume_failed` | Number of schema_change_gc jobs which failed with a non-retriable error
`jobs.schema_change_gc.resume_retry_error` | Number of schema_change_gc jobs which failed with a retriable error
`jobs.stream_ingestion.currently_running` | Number of stream_ingestion jobs currently running in Resume or OnFailOrCancel state
`jobs.stream_ingestion.fail_or_cancel_completed` | Number of stream_ingestion jobs which successfully completed their failure or cancelation process
`jobs.stream_ingestion.fail_or_cancel_failed` | Number of stream_ingestion jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.stream_ingestion.fail_or_cancel_retry_error` | Number of stream_ingestion jobs which failed with a retriable error on their failure or cancelation process
`jobs.stream_ingestion.resume_completed` | Number of stream_ingestion jobs which successfully resumed to completion
`jobs.stream_ingestion.resume_failed` | Number of stream_ingestion jobs which failed with a non-retriable error
`jobs.stream_ingestion.resume_retry_error` | Number of stream_ingestion jobs which failed with a retriable error
`jobs.typedesc_schema_change.currently_running` | Number of typedesc_schema_change jobs currently running in Resume or OnFailOrCancel state
`jobs.typedesc_schema_change.fail_or_cancel_completed` | Number of typedesc_schema_change jobs which successfully completed their failure or cancelation process
`jobs.typedesc_schema_change.fail_or_cancel_failed` | Number of typedesc_schema_change jobs which failed with a non-retriable error on their failure or cancelation process
`jobs.typedesc_schema_change.fail_or_cancel_retry_error` | Number of typedesc_schema_change jobs which failed with a retriable error on their failure or cancelation process
`jobs.typedesc_schema_change.resume_completed` | Number of typedesc_schema_change jobs which successfully resumed to completion
`jobs.typedesc_schema_change.resume_failed` | Number of typedesc_schema_change jobs which failed with a non-retriable error
`jobs.typedesc_schema_change.resume_retry_error` | Number of typedesc_schema_change jobs which failed with a retriable error
`keybytes` | Number of bytes taken up by keys
`keycount` | Count of all keys
`kv.closed_timestamp.max_behind_nanos` | Largest latency between realtime and replica max closed timestamp
`kv.concurrency.lock_wait_queue_waiters` | Number of requests actively waiting in a lock wait-queue
`kv.concurrency.locks_with_wait_queues` | Number of active locks held in lock tables with active wait-queues
`kv.concurrency.locks` | Number of active locks held in lock tables. Does not include replicated locks (intents) that are not held in memory
`kv.concurrency.max_lock_wait_queue_waiters_for_lock` | Maximum number of requests actively waiting in any single lock wait-queue
`kv.prober.planning_attempts` | Number of attempts at planning out probes made; in order to probe KV we need to plan out which ranges to probe;
`kv.prober.planning_failures` | Number of attempts at planning out probes that failed; in order to probe KV we need to plan out which ranges to probe; if planning fails, then kvprober is not able to send probes to all ranges; consider alerting on this metric as a result
`kv.prober.read.attempts` | Number of attempts made to read probe KV, regardless of outcome
`kv.prober.read.failures` | Number of attempts made to read probe KV that failed, whether due to error or timeout
`kv.prober.read.latency` | Latency of successful KV read probes
`kv.prober.write.attempts` | Number of attempts made to write probe KV, regardless of outcome
`kv.prober.write.failures` | Number of attempts made to write probe KV that failed, whether due to error or timeout
`kv.prober.write.latency` | Latency of successful KV write probes
`kv.protectedts.reconciliation.errors` | number of errors encountered during reconciliation runs on this node
`kv.protectedts.reconciliation.num_runs` | number of successful reconciliation runs on this node
`kv.protectedts.reconciliation.records_processed` | number of records processed without error during reconciliation on this node
`kv.protectedts.reconciliation.records_removed` | number of records removed during reconciliation runs on this node
`kv.rangefeed.catchup_scan_nanos` | Time spent in RangeFeed catchup scan
`kv.rangefeed.catchup_scan_nanos` | Time spent in RangeFeed catchup scan
`kv.tenant_rate_limit.current_blocked` | Number of requests currently blocked by the rate limiter
`kv.tenant_rate_limit.num_tenants` | Number of tenants currently being tracked
`kv.tenant_rate_limit.read_bytes_admitted` | Number of read bytes admitted by the rate limiter
`kv.tenant_rate_limit.read_requests_admitted` | Number of read requests admitted by the rate limiter
`kv.tenant_rate_limit.write_bytes_admitted` | Number of write bytes admitted by the rate limiter
`kv.tenant_rate_limit.write_requests_admitted` | Number of write requests admitted by the rate limiter
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
`liveness.heartbeatsinflight` | Number of in-flight liveness heartbeats from this node
`liveness.heartbeatsuccesses` | Number of successful node liveness heartbeats from this node
`liveness.livenodes` | Number of live nodes in the cluster (will be 0 if this node is not itself live)
`node-id` | node ID with labels for advertised RPC and HTTP addresses
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
`queue.gc.info.resolvefailed` | Number of cleanup intent failures during GC
`queue.gc.info.resolvesuccess` | Number of successful intent resolutions
`queue.gc.info.resolvetotal` | Number of attempted intent resolutions
`queue.gc.info.transactionresolvefailed` | Number of intent cleanup failures for local transactions during GC
`queue.gc.info.transactionspangcaborted` | Number of GC'able entries corresponding to aborted txns
`queue.gc.info.transactionspangccommitted` | Number of GC'able entries corresponding to committed txns
`queue.gc.info.transactionspangcpending` | Number of GC'able entries corresponding to pending txns
`queue.gc.info.transactionspangcstaging` | Number of GC'able entries corresponding to staging txns
`queue.gc.info.transactionspanscanned` | Number of entries in transaction spans scanned from the engine
`queue.gc.pending` | Number of pending replicas in the GC queue
`queue.gc.process.failure` | Number of replicas which failed processing in the GC queue
`queue.gc.process.success` | Number of replicas successfully processed by the GC queue
`queue.gc.processingnanos` | Nanoseconds spent processing replicas in the GC queue
`queue.merge.pending` | Number of pending replicas in the merge queue
`queue.merge.pending` | Number of pending replicas in the merge queue
`queue.merge.process.failure` | Number of replicas which failed processing in the merge queue
`queue.merge.process.failure` | Number of replicas which failed processing in the merge queue
`queue.merge.process.success` | Number of replicas successfully processed by the merge queue
`queue.merge.process.success` | Number of replicas successfully processed by the merge queue
`queue.merge.processingnanos` | Nanoseconds spent processing replicas in the merge queue
`queue.merge.processingnanos` | Nanoseconds spent processing replicas in the merge queue
`queue.merge.purgatory` | Number of replicas in the merge queue's purgatory, waiting to become mergeable
`queue.merge.purgatory` | Number of replicas in the merge queue's purgatory, waiting to become mergeable
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
`queue.replicate.addreplica` | Number of replica additions attempted by the replicate queue
`queue.replicate.nonvoterpromotions` | Number of non-voters promoted to voters by the replicate queue
`queue.replicate.pending` | Number of pending replicas in the replicate queue
`queue.replicate.process.failure` | Number of replicas which failed processing in the replicate queue
`queue.replicate.process.success` | Number of replicas successfully processed by the replicate queue
`queue.replicate.processingnanos` | Nanoseconds spent processing replicas in the replicate queue
`queue.replicate.purgatory` | Number of replicas in the replicate queue's purgatory, awaiting allocation options
`queue.replicate.rebalancereplica` | Number of replica rebalancer-initiated additions attempted by the replicate queue
`queue.replicate.removedeadreplica` | Number of dead replica removals attempted by the replicate queue (typically in response to a node outage)
`queue.replicate.removelearnerreplica` | Number of learner replica removals attempted by the replicate queue (typically due to internal race conditions)
`queue.replicate.removereplica` | Number of replica removals attempted by the replicate queue (typically in response to a rebalancer-initiated addition)
`queue.replicate.transferlease` | Number of range lease transfers attempted by the replicate queue
`queue.replicate.voterdemotions` | Number of voters demoted to non-voters by the replicate queue
`queue.split.pending` | Number of pending replicas in the split queue
`queue.split.process.failure` | Number of replicas which failed processing in the split queue
`queue.split.process.success` | Number of replicas successfully processed by the split queue
`queue.split.processingnanos` | Nanoseconds spent processing replicas in the split queue
`queue.split.purgatory` | Number of replicas in the split queue's purgatory, waiting to become splittable
`queue.split.purgatory` | Number of replicas in the split queue's purgatory, waiting to become splittable
`queue.tsmaintenance.pending` | Number of pending replicas in the time series maintenance queue
`queue.tsmaintenance.process.failure` | Number of replicas which failed processing in the time series maintenance queue
`queue.tsmaintenance.process.success` | Number of replicas successfully processed by the time series maintenance queue
`queue.tsmaintenance.processingnanos` | Nanoseconds spent processing replicas in the time series maintenance queue
`raft.commandsapplied` | Count of Raft commands applied
`raft.enqueued.pending` | Number of pending outgoing messages in the Raft Transport queue
`raft.entrycache.accesses` | Number of cache lookups in the Raft entry cache
`raft.entrycache.bytes` | Aggregate size of all Raft entries in the Raft entry cache
`raft.entrycache.hits` | Number of successful cache lookups in the Raft entry cache
`raft.entrycache.size` | Number of Raft entries in the Raft entry cache
`raft.heartbeats.pending` | Number of pending heartbeats and responses waiting to be coalesced
`raft.process.applycommitted.latency` | Latency histogram for applying all committed Raft commands in a Raft ready
`raft.process.commandcommit.latency` | Latency histogram in nanoseconds for committing Raft commands
`raft.process.handleready.latency` | Latency histogram for handling a Raft ready
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
`raft.scheduler.latency` | Nanoseconds spent waiting for a range to be processed by the Raft scheduler
`raft.ticks` | Number of Raft ticks queued
`raft.timeoutcampaign` | Number of Raft replicas campaigning after missed heartbeats from leader
`raftlog.behind` | Number of Raft log entries followers on other stores are behind
`raftlog.truncated` | Number of Raft log entries truncated
`range.adds` | Number of range additions
`range.merges` | Number of range merges
`range.merges` | Number of range merges
`range.raftleadertransfers` | Number of Raft leader transfers
`range.removes` | Number of range removals
`range.snapshots.applied-initial` | Number of snapshots applied for initial upreplication
`range.snapshots.applied-initial` | Number of snapshots applied for initial upreplication
`range.snapshots.applied-non-voter` | Number of snapshots applied by non-voter replicas
`range.snapshots.applied-non-voter` | Number of snapshots applied by non-voter replicas
`range.snapshots.applied-voter` | Number of snapshots applied by voter replicas
`range.snapshots.applied-voter` | Number of snapshots applied by voter replicas
`range.snapshots.generated` | Number of generated snapshots
`range.snapshots.normal-applied` | Number of applied snapshots
`range.snapshots.preemptive-applied` | Number of applied pre-emptive snapshots
`range.snapshots.rcvd-bytes` | Number of snapshot bytes received
`range.snapshots.rcvd-bytes` | Number of snapshot bytes received
`range.snapshots.sent-bytes` | Number of snapshot bytes sent
`range.snapshots.sent-bytes` | Number of snapshot bytes sent
`range.splits` | Number of range splits
`ranges.overreplicated` | Number of ranges with more live replicas than the replication target
`ranges.overreplicated` | Number of ranges with more live replicas than the replication target
`ranges.unavailable` | Number of ranges with fewer live replicas than needed for quorum
`ranges.underreplicated` | Number of ranges with fewer live replicas than the replication target
`ranges` | Number of ranges
`rebalancing.lease.transfers` | Number of lease transfers motivated by store-level load imbalances
`rebalancing.lease.transfers` | Number of lease transfers motivated by store-level load imbalances
`rebalancing.queriespersecond` | Number of kv-level requests received per second by the store, averaged over a large time period as used in rebalancing decisions
`rebalancing.range.rebalances` | Number of range rebalance operations motivated by store-level load imbalances
`rebalancing.range.rebalances` | Number of range rebalance operations motivated by store-level load imbalances
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
`replicas` | Number of replicas
`requests.backpressure.split` | Number of backpressured writes waiting on a Range split
`requests.slow.commandqueue` | Number of requests that have been stuck for a long time in the command queue
`requests.slow.distsender` | Number of requests that have been stuck for a long time in the dist sender
`requests.slow.latch` | Number of requests that have been stuck for a long time acquiring latches
`requests.slow.latch` | Number of requests that have been stuck for a long time acquiring latches
`requests.slow.latch` | Number of requests that have been stuck for a long time acquiring latches
`requests.slow.lease` | Number of requests that have been stuck for a long time acquiring a lease
`requests.slow.raft` | Number of requests that have been stuck for a long time in Raft
`rocksdb.block.cache.hits` | Count of block cache hits
`rocksdb.block.cache.misses` | Count of block cache misses
`rocksdb.block.cache.pinned-usage` | Bytes pinned by the block cache
`rocksdb.block.cache.usage` | Bytes used by the block cache
`rocksdb.bloom.filter.prefix.checked` | Number of times the bloom filter was checked
`rocksdb.bloom.filter.prefix.useful` | Number of times the bloom filter helped avoid iterator creation
`rocksdb.compacted-bytes-read` | Bytes read during compaction
`rocksdb.compacted-bytes-written` | Bytes written during compaction
`rocksdb.compactions` | Number of table compactions
`rocksdb.encryption.algorithm` | Algorithm in use for encryption-at-rest, see ccl/storageccl/engineccl/enginepbccl/key_registry.proto
`rocksdb.estimated-pending-compaction` | Estimated pending compaction bytes
`rocksdb.flushed-bytes` | Bytes written during flush
`rocksdb.flushes` | Number of table flushes
`rocksdb.ingested-bytes` | Bytes ingested
`rocksdb.memtable.total-size` | Current size of memtable in bytes
`rocksdb.num-sstables` | Number of storage engine SSTables
`rocksdb.read-amplification` | Number of disk reads per query
`rocksdb.table-readers-mem-estimate` | Memory used by index and filter blocks
`round-trip-latency` | Distribution of round-trip latencies with other nodes in nanoseconds
`rpc.heartbeats.failed` | Gauge of current connections in the failed state
`rpc.heartbeats.initializing` | Gauge of current connections in the initializing state
`rpc.heartbeats.loops.exited` | Counter of the number of connection heartbeat loops which have exited with an error
`rpc.heartbeats.loops.started` | Counter of the number of connection heartbeat loops which have been started
`rpc.heartbeats.nominal` | Gauge of current connections in the nominal state
`seconds_until_enterprise_license_expiry` | Seconds until enterprise license expiry (0 if no license present or running without enterprise features)
`security.certificate.expiration.ca` | Expiration timestamp in seconds since Unix epoch for the CA certificate. 0 means no certificate or error.
`security.certificate.expiration.node` | Expiration timestamp in seconds since Unix epoch for the node certificate. 0 means no certificate or error.
`sql.bytesin` | Number of sql bytes received
`sql.bytesout` | Number of sql bytes sent
`sql.conn.latency` | Latency to establish and authenticate a SQL connection
`sql.conns` | Number of active sql connections
`sql.ddl.count` | Number of SQL DDL statements
`sql.ddl.started.count` | Number of SQL DDL statements started
`sql.delete.count` | Number of SQL DELETE statements
`sql.delete.started.count` | Number of SQL DELETE statements started
`sql.disk.distsql.current` | Current sql statement disk usage for distsql
`sql.disk.distsql.max` | Disk usage per sql statement for distsql
`sql.disk.distsql.spilled.bytes.read` | Number of bytes read from temporary disk storage as a result of spilling
`sql.disk.distsql.spilled.bytes.written` | Number of bytes written to temporary disk storage as a result of spilling
`sql.distsql.contended_queries.count` | Number of SQL queries that experienced contention
`sql.distsql.exec.latency` | Latency in nanoseconds of SQL statement executions running on the distributed execution engine. This metric does not include the time to parse and plan the statement.
`sql.distsql.flows.active` | Number of distributed SQL flows currently active
`sql.distsql.flows.queue_wait` | Duration of time flows spend waiting in the queue
`sql.distsql.flows.queued` | Number of distributed SQL flows currently queued
`sql.distsql.flows.scheduled` | Number of distributed SQL flows scheduled
`sql.distsql.flows.total` | Number of distributed SQL flows executed
`sql.distsql.queries.active` | Number of distributed SQL queries currently active
`sql.distsql.queries.spilled` | Number of queries that have spilled to disk
`sql.distsql.queries.total` | Number of distributed SQL queries executed
`sql.distsql.select.count` | Number of DistSQL SELECT statements
`sql.distsql.service.latency` | Latency in nanoseconds of SQL statement executions running on the distributed execution engine, including the time to parse and plan the statement.
`sql.distsql.vec.openfds` | Current number of open file descriptors used by vectorized external storage
`sql.exec.latency` | Latency in nanoseconds of all SQL statement executions. This metric does not include the time to parse and plan the statement.
`sql.failure.count` | Number of statements resulting in a planning or runtime error
`sql.feature_flag_denial` | Counter of the number of statements denied by a feature flag
`sql.full.scan.count` | Number of full table or index scans
`sql.guardrails.full_scan_rejected.count` | Number of full table or index scans that have been rejected because of `disallow_full_table_scans` guardrail
`sql.guardrails.max_row_size_err.count` | Number of times a large row violates the corresponding `sql.guardrails.max_row_size_err` limit.
`sql.guardrails.max_row_size_log.count` | Number of times a large row violates the corresponding `sql.guardrails.max_row_size_log` limit.
`sql.guardrails.transaction_rows_read_err.count` | Number of transactions errored because of transaction_rows_read_err guardrail
`sql.guardrails.transaction_rows_read_log.count` | Number of transactions logged because of transaction_rows_read_log guardrail
`sql.guardrails.transaction_rows_written_err.count` | Number of transactions errored because of transaction_rows_written_err guardrail
`sql.guardrails.transaction_rows_written_log.count` | Number of transactions logged because of transaction_rows_written_log guardrail
`sql.hydrated_table_cache.hits` | counter on the number of cache hits
`sql.hydrated_table_cache.misses` | counter on the number of cache misses
`sql.insert.count` | Number of SQL INSERT statements
`sql.insert.started.count` | Number of SQL INSERT statements started
`sql.leases.active` | The number of outstanding SQL schema leases.
`sql.mem.bulk.current` | Current sql statement memory usage for bulk operations
`sql.mem.bulk.max` | Memory usage per sql statement for bulk operations
`sql.mem.current` | Current sql statement memory usage
`sql.mem.distsql.current` | Current sql statement memory usage for distsql
`sql.mem.distsql.max` | Memory usage per sql statement for distsql
`sql.mem.internal.session.current` | Current sql session memory usage for internal
`sql.mem.internal.session.max` | Memory usage per sql session for internal
`sql.mem.internal.txn.current` | Current sql transaction memory usage for internal
`sql.mem.internal.txn.max` | Memory usage per sql transaction for internal
`sql.mem.max` | Memory usage per sql statement
`sql.mem.root.current` | Current sql statement memory usage for root
`sql.mem.root.max` | Memory usage per sql statement for root
`sql.mem.session.current` | Current sql session memory usage
`sql.mem.session.max` | Memory usage per sql session
`sql.mem.sql.session.current` | Current sql session memory usage for sql
`sql.mem.sql.session.max` | Memory usage per sql session for sql
`sql.mem.sql.txn.current` | Current sql transaction memory usage for sql
`sql.mem.sql.txn.max` | Memory usage per sql transaction for sql
`sql.mem.txn.current` | Current sql transaction memory usage
`sql.mem.txn.max` | Memory usage per sql transaction
`sql.misc.count` | Number of other SQL statements
`sql.misc.started.count` | Number of other SQL statements started
`sql.new_conns` | Counter of the number of sql connections created
`sql.optimizer.fallback.count` | Number of statements which the cost-based optimizer was unable to plan
`sql.optimizer.plan_cache.hits` | Number of non-prepared statements for which a cached plan was used
`sql.optimizer.plan_cache.misses` | Number of non-prepared statements for which a cached plan was not used
`sql.query.count` | Number of SQL queries
`sql.query.started.count` | Number of SQL queries started
`sql.query.started.count` | Number of SQL queries started
`sql.restart_savepoint.count` | Number of `SAVEPOINT cockroach_restart` statements successfully executed
`sql.restart_savepoint.release.count` | Number of `RELEASE SAVEPOINT cockroach_restart` statements successfully executed
`sql.restart_savepoint.release.started.count` | Number of `RELEASE SAVEPOINT cockroach_restart` statements started
`sql.restart_savepoint.rollback.count` | Number of `ROLLBACK TO SAVEPOINT cockroach_restart` statements successfully executed
`sql.restart_savepoint.rollback.started.count` | Number of `ROLLBACK TO SAVEPOINT cockroach_restart` statements started
`sql.restart_savepoint.started.count` | Number of `SAVEPOINT cockroach_restart` statements started
`sql.savepoint.count` | Number of SQL SAVEPOINT statements successfully executed
`sql.savepoint.release.count` | Number of `RELEASE SAVEPOINT` statements successfully executed
`sql.savepoint.release.started.count` | Number of `RELEASE SAVEPOINT` statements started
`sql.savepoint.rollback.count` | Number of `ROLLBACK TO SAVEPOINT` statements successfully executed
`sql.savepoint.rollback.started.count` | Number of `ROLLBACK TO SAVEPOINT` statements started
`sql.savepoint.started.count` | Number of SQL SAVEPOINT statements started
`sql.schema_changer.permanent_errors` | Counter of the number of permanent errors experienced by the schema changer
`sql.schema_changer.retry_errors` | Counter of the number of retriable errors experienced by the schema changer
`sql.schema_changer.running` | Gauge of currently running schema changes
`sql.schema_changer.successes` | Counter of the number of schema changer resumes which succeed
`sql.select.count` | Number of SQL SELECT statements
`sql.select.started.count` | Number of SQL SELECT statements started
`sql.service.latency` | Latency in nanoseconds of SQL request execution, including the time to parse and plan the statement.
`sql.stats.cleanup.rows_removed` | Number of stale statistics rows that are removed
`sql.stats.discarded.current` | Number of fingerprint statistics being discarded
`sql.stats.flush.count` | Number of times SQL Stats are flushed to persistent storage
`sql.stats.flush.duration` | Time took to in nanoseconds to complete SQL Stats flush
`sql.stats.flush.error` | Number of errors encountered when flushing SQL Stats
`sql.stats.mem.current` | Current memory usage for fingerprint storage
`sql.stats.mem.max` | Memory usage for fingerprint storage
`sql.stats.reported.mem.current` | Current memory usage for reported fingerprint storage
`sql.stats.reported.mem.max` | Memory usage for reported fingerprint storage
`sql.temp_object_cleaner.active_cleaners` | number of cleaner tasks currently running on this node
`sql.temp_object_cleaner.schemas_deletion_error` | number of errored schema deletions by the temp object cleaner on this node
`sql.temp_object_cleaner.schemas_deletion_success` | number of successful schema deletions by the temp object cleaner on this node
`sql.temp_object_cleaner.schemas_to_delete` | number of schemas to be deleted by the temp object cleaner on this node
`sql.txn.abort.count` | Number of SQL transaction ABORT statements
`sql.txn.begin.count` | Number of SQL transaction BEGIN statements
`sql.txn.begin.started.count` | Number of SQL transaction BEGIN statements started
`sql.txn.commit.count` | Number of SQL transaction COMMIT statements
`sql.txn.commit.started.count` | Number of SQL transaction COMMIT statements started
`sql.txn.latency` | Latency of SQL transactions
`sql.txn.rollback.count` | Number of SQL transaction ROLLBACK statements
`sql.txn.rollback.started.count` | Number of SQL transaction ROLLBACK statements started
`sql.txns.open` | Number of currently open SQL transactions
`sql.update.count` | Number of SQL UPDATE statements
`sql.update.started.count` | Number of SQL UPDATE statements started
`sqlliveness.is_alive.cache_hits` | Number of calls to IsAlive that return from the cache
`sqlliveness.is_alive.cache_misses` | Number of calls to IsAlive that do not return from the cache
`sqlliveness.sessions_deleted` | Number of expired sessions which have been deleted
`sqlliveness.sessions_deletion_runs` | Number of calls to delete sessions which have been performed
`sqlliveness.write_failures` | Number of update or insert calls which have failed
`sqlliveness.write_successes` | Number of update or insert calls successfully performed
`storage.disk-slow` | Number of instances of disk operations taking longer than 10s
`storage.disk-stalled` | Number of instances of disk operations taking longer than 30s
`storage.l0-num-files` | Number of Level 0 files
`storage.l0-sublevels` | Number of Level 0 sublevels
`storage.write-stalls` | Number of instances of intentional write stalls to backpressure incoming writes
`sys.cgo.allocbytes` | Current bytes of memory allocated by cgo
`sys.cgo.totalbytes` | Total bytes of memory allocated by cgo, but not released
`sys.cgocalls` | Total number of cgo call
`sys.cpu.combined.percent-normalized` | Current user+system cpu percentage, normalized 0-1 by number of cores
`sys.cpu.now.ns` | Number of nanoseconds elapsed since January 1, 1970 UTC
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
`sys.host.disk.io.time` | Time spent reading from or writing to all disks since this process started
`sys.host.disk.io.time` | Time spent reading from or writing to all disks since this process started
`sys.host.disk.iopsinprogress` | IO operations currently in progress on this host
`sys.host.disk.iopsinprogress` | IO operations currently in progress on this host
`sys.host.disk.read.bytes` | Bytes read from all disks since this process started
`sys.host.disk.read.bytes` | Bytes read from all disks since this process started
`sys.host.disk.read.count` | Disk read operations across all disks since this process started
`sys.host.disk.read.count` | Disk read operations across all disks since this process started
`sys.host.disk.read.time` | Time spent reading from all disks since this process started
`sys.host.disk.read.time` | Time spent reading from all disks since this process started
`sys.host.disk.weightedio.time` | Weighted time spent reading from or writing to to all disks since this process started
`sys.host.disk.weightedio.time` | Weighted time spent reading from or writing to to all disks since this process started
`sys.host.disk.write.bytes` | Bytes written to all disks since this process started
`sys.host.disk.write.bytes` | Bytes written to all disks since this process started
`sys.host.disk.write.count` | Disk write operations across all disks since this process started
`sys.host.disk.write.count` | Disk write operations across all disks since this process started
`sys.host.disk.write.time` | Time spent writing to all disks since this process started
`sys.host.disk.write.time` | Time spent writing to all disks since this process started
`sys.host.net.recv.bytes` | Bytes received on all network interfaces since this process started
`sys.host.net.recv.packets` | Packets received on all network interfaces since this process started
`sys.host.net.send.bytes` | Bytes sent on all network interfaces since this process started
`sys.host.net.send.packets` | Packets sent on all network interfaces since this process started
`sys.rss` | Current process RSS
`sys.runnable.goroutines.per.cpu` | Average number of goroutines that are waiting to run, normalized by number of cores
`sys.uptime` | Process uptime in seconds
`sysbytes` | Number of bytes in system KV pairs
`syscount` | Count of system KV pairs
`timeseries.write.bytes` | Total size in bytes of metric samples written to disk
`timeseries.write.errors` | Total errors encountered while attempting to write metrics to disk
`timeseries.write.samples` | Total number of metric samples written to disk
`totalbytes` | Total number of bytes taken up by keys and values including non-live data
`tscache.skl.pages` | Number of pages in the timestamp cache
`tscache.skl.read.pages` | Number of pages in the read timestamp cache
`tscache.skl.read.rotations` | Number of page rotations in the read timestamp cache
`tscache.skl.rotations` | Number of page rotations in the timestamp cache
`tscache.skl.write.pages` | Number of pages in the write timestamp cache
`tscache.skl.write.rotations` | Number of page rotations in the write timestamp cache
`txn.abandons` | Number of abandoned KV transactions
`txn.aborts` | Number of aborted KV transactions
`txn.autoretries` | Number of automatic retries to avoid serializable restarts
`txn.commit_waits.before_commit_trigger` | Number of KV transactions that had to commit-wait on the server before committing because they had a commit trigger
`txn.commit_waits` | Number of KV transactions that had to commit-wait on commit in order to ensure linearizability. This generally happens to transactions writing to global ranges.
`txn.commits1PC` | Number of committed one-phase KV transactions
`txn.commits` | Number of committed KV transactions (including 1PC)
`txn.condensed_intent_spans_gauge` | KV transactions currently running that have exceeded their intent tracking memory budget (kv.transaction.max_intents_bytes). See also txn.condensed_intent_spans for a perpetual counter/rate.
`txn.condensed_intent_spans_rejected` | KV transactions that have been aborted because they exceeded their intent tracking memory budget (kv.transaction.max_intents_bytes). Rejection is caused by kv.transaction.reject_over_max_intents_budget.
`txn.condensed_intent_spans` | KV transactions that have exceeded their intent tracking memory budget (kv.transaction.max_intents_bytes). See also txn.condensed_intent_spans_gauge for a gauge of such transactions currently running.
`txn.durations` | KV transaction durations in nanoseconds
`txn.parallelcommits` | Number of KV transaction parallel commit attempts
`txn.refresh.auto_retries` | Number of request retries after successful refreshes
`txn.refresh.fail_with_condensed_spans` | Number of failed refreshes for transactions whose read tracking lost fidelity because of condensing. Such a failure could be a false conflict. Failures counted here are also counted in txn.refresh.fail, and the respective transactions are also counted in txn.refresh.memory_limit_exceeded.
`txn.refresh.fail` | Number of failed transaction refreshes
`txn.refresh.memory_limit_exceeded` | Number of transaction which exceed the refresh span bytes limit, causing their read spans to be condensed
`txn.refresh.success` | Number of successful transaction refreshes. A refresh may be preemptive or reactive. A reactive refresh is performed after a request throws an error because a refresh is needed for it to succeed. In these cases, the request will be re-issued as an auto-retry (see txn.refresh.auto_retries) after the refresh succeeds.
`txn.restarts.asyncwritefailure` | Number of restarts due to async consensus writes that failed to leave intents
`txn.restarts.commitdeadlineexceeded` | Number of restarts due to a transaction exceeding its deadline
`txn.restarts.deleterange` | Number of restarts due to a forwarded commit timestamp and a DeleteRange command
`txn.restarts.possiblereplay` | Number of restarts due to possible replays of command batches at the storage layer
`txn.restarts.readwithinuncertainty` | Number of restarts due to reading a new value within the uncertainty interval
`txn.restarts.serializable` | Number of restarts due to a forwarded commit timestamp and isolation=SERIALIZABLE
`txn.restarts.txnaborted` | Number of restarts due to an abort by a concurrent transaction (usually due to deadlock)
`txn.restarts.txnpush` | Number of restarts due to a transaction push failure
`txn.restarts.unknown` | Number of restarts due to a unknown reasons
`txn.restarts.writetooold` | Number of restarts due to a concurrent writer committing first
`txn.restarts.writetoooldmulti` | Number of restarts due to multiple concurrent writers committing first
`txn.restarts` | Number of restarted KV transactions
`txn.rollbacks.async.failed` | Number of KV transaction that failed to send abort asynchronously which is not always retried
`txn.rollbacks.failed` | Number of KV transaction that failed to send final abort
`txnrecovery.attempts.pending` | Number of transaction recovery attempts currently in-flight
`txnrecovery.attempts.total` | Number of transaction recovery attempts executed
`txnrecovery.failures` | Number of transaction recovery attempts that failed
`txnrecovery.successes.aborted` | Number of transaction recovery attempts that aborted a transaction
`txnrecovery.successes.committed` | Number of transaction recovery attempts that committed a transaction
`txnrecovery.successes.pending` | Number of transaction recovery attempts that left a transaction pending
`txnwaitqueue.deadlocks_total` | Number of deadlocks detected by the txn wait queue
`txnwaitqueue.pushee.waiting` | Number of pushees on the txn wait queue
`txnwaitqueue.pusher.slow` | The total number of cases where a pusher waited more than the excessive wait threshold
`txnwaitqueue.pusher.wait_time` | Histogram of durations spent in queue by pushers
`txnwaitqueue.pusher.waiting` | Number of pushers on the txn wait queue
`txnwaitqueue.query.wait_time` | Histogram of durations spent in queue by queries
`txnwaitqueue.query.waiting` | Number of transaction status queries waiting for an updated transaction record
`valbytes` | Number of bytes taken up by values
`valcount` | Count of all values
