---
title: Programmability of RPC, HTTP and other interfaces
summary: Which other interfaces other than SQL and the CLI are programmable and forward compatibility guarantees.
toc: true
---

CockroachDB provides several other interfaces besides the [command
line](programmability-of-command-line-interfaces.html) and
[SQL](overview-of-apis-and-interfaces.html):

- the embedded [Admin UI](admin-ui-overview.html),
- [HTTP status endpoints](monitoring-and-alerting.html),
- RPC endpoints served for CLI commands and other clients.

For each of them, the accompanying [forward compatibility
guarantees](compatibility-and-programmability-guarantees.html) are
listed below.

## Web UI components

| Component                            | Status                      |
|--------------------------------------|-----------------------------|
| pages linked from the entry page     | [public and non-programmable] |
| pages not linked from the entry page | [reserved]                    |

## HTTP status endpoints

| Component                                                 | Status                    |
|-----------------------------------------------------------|---------------------------|
| [`/health`](monitoring-and-alerting.html)                 | [public and programmable] |
| [`/monitoring`](monitor-cockroachdb-with-prometheus.html) | [public and programmable] |
| `/debug`                                                  | [reserved]                |

## RPC endpoints

See [`server/serverpb/admin.proto` in the source code
repository](https://github.com/cockroachdb/cockroach/blob/master/pkg/server/serverpb/admin.proto)
for a detaild list of the supported RPC endpoints.

Note: we mirror these RPC endpoints (defined using [gRPC](https://grpc.io/)) as REST-style
HTTP endpoints on the HTTP port. These are separate facilities from
the HTTP status endpoints described above.


| Component                                                                     | Status                  |
|-------------------------------------------------------------------------------|-------------------------|
| `ChartCatalog(ChartCatalogRequest) -> ChartCatalogResponse`                   | [public and programmable] |
| `Cluster(ClusterRequest) -> ClusterResponse`                                  | [public and programmable] |
| `Databases(DatabasesRequest) -> DatabasesResponse`                            | [public and programmable] |
| `Decommission(DecommissionRequest) -> DecommissionResponse`                   | [public and programmable] |
| `DecommissionStatus(DecommissionStatusRequest) -> DecommissionStatusResponse` | [public and programmable] |
| `Drain(DrainRequest) -> DrainResponse`                                        | [public and programmable] |
| `Events(EventsRequest) -> EventsResponse`                                     | [public and programmable] |
| `Locations(LocationsRequest) -> LocationsResponse`                            | [public and programmable] |
| `MetricMetadata(MetricMetadataRequest) -> MetricMetadataResponse`             | [public and programmable] |
| `QueryPlan(QueryPlanRequest) -> QueryPlanResponse`                            | [public and programmable] |
| `RangeLog(RangeLogRequest) -> RangeLogResponse`                               | [public and programmable] |
| `Settings(SettingsRequest) -> SettingsResponse`                               | [public and programmable] |
| `Users(UsersRequest) -> UsersResponse`                                        | [public and programmable] |
| `DataDistribution(DataDistributionRequest) -> DataDistributionResponse`       | [reserved]                |
| `DatabaseDetails(DatabasesDetailsRequest) -> DatabasesDetailsResponse`        | [reserved]                |
| `EnqueueRange(EnqueueRangeRequest) -> EnqueueRangeResponse`                   | [reserved]                |
| `GetUIData(GetUIDataRequest) -> GetUIDataResponse`                            | [reserved]                |
| `Health(HealthRequest) -> HealthResponse`                                     | [reserved]                |
| `Jobs(JobsRequest) -> JobsResponse`                                           | [reserved]                |
| `Liveness(LivenessRequest) -> LivenessResponse`                               | [reserved]                |
| `NonTableStats(NonTableStatsRequest) -> NonTableStatsResponse`                | [reserved]                |
| `SetUIData(SetUIDataRequest) -> SetUIDataResponse`                            | [reserved]                |
| `TableDetails(TableDetailsRequest) -> TableDetailsResponse`                   | [reserved]                |
| `TableStats(TableStatsRequest) -> TableStatsResponse`                         | [reserved]                |

## Cluster settings

| Component                                                                                                                                             | Status if feature documented on this site                                                    | Status if not documented on this site |
|-------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| Effect and configurability of settings whose name contains the word `experimental`                                                                    | [public and programmable] with  [“experimental” status](experimental-feature-lifecycle.html) | [reserved]                            |
| Effect and configurability of hidden settings (now listed in `SHOW ALL CLUSTER SETTINGS`)                                                             | [reserved]                                                                                   | [reserved]                            |
| Effect and configurability of settings pertaining to low-level CockroachDB internals, e.g., whose name starts with `kv.`, `server.`, `rocksdb.`, etc. | [public and non-programmable]                                                                | [reserved]                            |
| Effect and configurability of other settings                                                                                                          | [public and programmable]                                                                    | [reserved]                            |

For more details, see the page on [Cluster Settings](cluster-settings.html).

## See also

- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Experimental feature lifecycle](experimental-feature-lifecycle.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
