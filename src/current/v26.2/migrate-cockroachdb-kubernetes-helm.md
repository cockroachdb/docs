---
title: Migrate from Helm StatefulSet
summary: Migration guide detailing how to migrate away from a Helm deployment of CockroachDB to the {{ site.data.products.cockroachdb-operator }}.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

# Automatic Migration from Helm StatefulSet to CockroachDB Operator

This guide covers the automatic migration of a CockroachDB cluster managed via a Helm
StatefulSet to the CockroachDB Operator.

The CockroachDB Operator's migration controller handles the complex logic of migrating nodes,
certificates, and resources automatically, ensuring a seamless transition with minimal
manual intervention.

## Compatibility

Before starting migration, verify your cluster configuration is supported.

| Feature | Supported | Notes |
|---|---|---|
| Self-signer certs (Helm built-in) | Yes | Regenerated with join service DNS SANs; originals preserved |
| cert-manager certs | Yes | Certificate CR updated with join service DNS SANs; issuer references preserved |
| User-provided certs (`tls.certs.provided`) | Yes | CrdbNode pods mount user's secrets directly; cert regeneration skipped (see prerequisites) |
| Insecure clusters (TLS disabled) | Yes | Detected from `--insecure` flag; cert migration phase skipped entirely |
| WAL failover (dedicated PVC) | Yes | Detected from `failover*` VolumeClaimTemplate and `--wal-failover` flag |
| Dedicated logs PVC (`logsdir` / `logs-dir`) | Yes | VolumeClaimTemplate and mount path preserved as LogsStore |
| PCR (virtualized/standby) | Yes | Detected from `{name}-init` Job args (`--virtualized`, `--virtualized-empty`) |
| Custom service account | Yes | Preserved with `create: false` |
| Custom start flags | Partial | Known operator-managed flags (`--join`, `--listen-addr`, `--certs-dir`, etc.) are excluded; all others preserved in `startFlags.upsert` |
| Multi-region | Yes | Requires `migration-regions` annotation with all regions before starting |
| Ingress (UI/SQL) | Partial | Existing ingress continues working during migration (service names preserved). Config saved as annotation for reference. Ingress resources themselves are not created or modified. Manual Helm adoption required |
| ServiceMonitor / PodMonitor | No | Not handled by migration. Must be recreated manually after migration to match new pod labels |
| NetworkPolicy | No | Must be recreated manually if present |
| Log-config Secret | Yes | Automatically converted to ConfigMap (operator uses ConfigMaps, Helm uses Secrets) |

## Before You Begin

Verify the following before starting migration:

- [ ] CockroachDB cluster is managed by a Helm StatefulSet (not the public operator).
- [ ] All StatefulSet pods are Running and Ready with no pending rolling updates, scale operations, or evictions.
- [ ] `kubectl` and `helm` are installed and configured with access to the target cluster.
- [ ] For multi-region clusters: cloud region and provider labels are applied to K8s nodes (see Step 2).
- [ ] For multi-region clusters: `migration-regions` annotation is prepared with the full topology.
- [ ] You have reviewed the Compatibility table above and confirmed your configuration is supported.
- [ ] **If using `tls.certs.provided` (user-provided certs)**: Your certificates include join
  service DNS SANs (`{cluster-name}-join`, `{cluster-name}-join.{namespace}`,
  `{cluster-name}-join.{namespace}.svc.cluster.local`). The controller cannot regenerate
  certificates when the CA private key is not available.
- [ ] **If using `tls.certs.provided` with `tls.certs.tlsSecret: false`**: Secrets are re-keyed
  to use Kubernetes TLS convention (`tls.crt`, `tls.key`, `ca.crt`) instead of cockroach-native
  key names (`node.crt`, `node.key`). The operator expects TLS secrets in the
  standard Kubernetes format. This is not needed for self-signer or cert-manager modes.

## Overview

### What the Migration Controller Does Automatically

- Detects cert-manager, self-signer, or user-provided certificates. Self-signer and cert-manager
  certs are regenerated with join service DNS SANs automatically. User-provided certs are mounted
  directly (regeneration skipped).
- Creates RBAC resources (ServiceAccount, Role, RoleBinding, ClusterRole, ClusterRoleBinding)
  with namespace-qualified names for cluster-scoped resources.
- Deletes old PDB and creates a new one during finalization (no protection gap because the new PDB is
  created immediately after old PDB deletion).
- Updates service selectors during migration and restores them on rollback.
- Migrates nodes one at a time (highest index first), verifying cluster health between each node.
- Detects and preserves Ingress configuration as an annotation on the CrdbCluster.
- Migrates `logsdir` / `logs-dir` VolumeClaimTemplate to CrdbNode LogsStore.
- Converts log-config Secret to ConfigMap (Helm uses Secrets, operator uses ConfigMaps).
- Detects Physical Cluster Replication (PCR) configuration from init jobs.
- Detects WAL failover configuration from VolumeClaimTemplates and `--wal-failover` flag.

### What Requires Manual Action

- Cloud region and provider node labels must be applied before deploying the operator.
- The StatefulSet must be manually deleted after finalization to complete migration.
- Helm adoption annotations must be applied to all resources post-migration.
- Old bare-named ClusterRole/ClusterRoleBinding must be deleted post-migration.
- Ingress resources are not annotated for Helm adoption (manual step required).
- ServiceMonitor / PodMonitor resources must be recreated with updated pod labels.

### Migration Phases

```
Init -> CertMigration -> PodMigration -> Finalization -> (user deletes STS) -> Complete
```

| Phase | Duration (approx.) | What happens |
|---|---|---|
| Init | Seconds | Validates prerequisites, creates v1beta1 CrdbCluster, records original replica count |
| CertMigration | Seconds to minutes | Detects cert type, regenerates certs with join service SANs, creates CA ConfigMap, labels existing pods |
| PodMigration | ~5-15 min per node | Creates CrdbNode, waits for health, scales down STS by one. Repeats for each node (highest index first) |
| Finalization | Seconds | Sets cluster spec (regions, TLS, resources), deletes old PDB, creates new PDB, sets Mode=MutableOnly |
| Complete | Seconds (after user deletes STS) | Records completion, updates migration label to `complete` |

---

## Step 1: Export Environment Variables

Export the necessary environment variables to identify your existing deployment.

```bash
# STS_NAME is the CockroachDB StatefulSet deployed via Helm chart.
export STS_NAME="crdb-test-cockroachdb"

# NAMESPACE is the namespace where the StatefulSet is installed.
export NAMESPACE="default"

# RELEASE_NAME is the Helm release name.
export RELEASE_NAME=$(kubectl get sts $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.metadata.annotations.meta\.helm\.sh/release-name}')
```

## Step 2: Apply Cloud Region and Provider Labels (Multi-Region Only)

CockroachDB uses K8s node labels for locality-based pod placement. These labels must exist
on the nodes before the operator starts scheduling pods.

```bash
# AWS
kubectl label node <node-name> \
  topology.kubernetes.io/region=us-east-1 \
  topology.kubernetes.io/zone=us-east-1a \
  cockroach.io/cloud=aws

# GCP
kubectl label node <node-name> \
  topology.kubernetes.io/region=us-central1 \
  topology.kubernetes.io/zone=us-central1-a \
  cockroach.io/cloud=gcp

# Azure
kubectl label node <node-name> \
  topology.kubernetes.io/region=eastus \
  topology.kubernetes.io/zone=eastus-1 \
  cockroach.io/cloud=azure
```

If the required labels are missing, CrdbNode pods will remain Pending with scheduling errors.

For multi-region clusters, annotate the StatefulSet with the full topology before starting
migration:

```bash
kubectl annotate sts $STS_NAME \
  'crdb.cockroachlabs.com/migration-regions=[{"code":"us-east-1","nodes":3,"namespace":"ns-east"},{"code":"eu-west-1","nodes":3,"namespace":"ns-west"}]' \
  -n $NAMESPACE
```

If the annotation is missing, the controller defaults to the operator's configured cloud
region. For single-region clusters this default is usually correct and the annotation can
be omitted.

The fallback order is: (1) `migration-regions` annotation, (2) `regionCode` and
`cloudProvider` annotations, (3) operator environment configuration, (4) default
`us-east1`. For single-region clusters, the default is usually acceptable.

## Step 3: Verify StatefulSet Is Stable

All replicas must be ready before migration begins.

```bash
kubectl get sts $STS_NAME -n $NAMESPACE
# READY column must equal DESIRED

kubectl get pods -l app.kubernetes.io/name=cockroachdb -n $NAMESPACE
# All pods must be Running/Ready
```

No ongoing rolling updates, scale operations, or pending evictions.

## Step 4: Install CockroachDB Operator with Migration Enabled

Install the operator with migration enabled. This registers the migration controller
which watches for the `crdb.io/migrate` label.

```bash
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator \
  --set migration.enabled=true
```

> `migration.enabled=true` on the **operator chart** enables the migration controller and
> registers the conversion webhook. This is different from `migration.enabled=true` on the
> **cockroachdb chart** (used later in Step 13), which relaxes pre-upgrade validation so the
> chart can adopt an existing migrated CrdbCluster. Both must be set at their respective steps.

Verify the operator is running and CRDs are available:

```bash
kubectl get pods -l app=cockroachdb-operator -n $NAMESPACE
kubectl get crd crdbclusters.crdb.cockroachlabs.com

# Verify both API versions are accessible (conversion webhook is active)
kubectl api-resources | grep crdbclusters
```

If a public operator is also running in the cluster, scope the CockroachDB Operator to the target
namespace. Without `watchNamespaces`, the CockroachDB Operator's cluster controller will attempt to
reconcile all CrdbClusters cluster-wide, interfering with clusters managed by the public
operator in other namespaces.

```bash
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator \
  --set migration.enabled=true \
  --set watchNamespaces=$NAMESPACE
```

When migrating clusters across multiple namespaces, migrate one namespace at a time. Update
`watchNamespaces` (or use a comma-separated list) to include additional namespaces only after
the previous migration is complete.

## Step 5: Start Migration

Initiate the migration by labeling the StatefulSet.

```bash
kubectl label sts $STS_NAME crdb.io/migrate=start -n $NAMESPACE
```

The operator detects this label and begins the migration automatically.

## Step 6: Monitor Migration

### DB Console

The DB Console is accessible via the public service throughout migration.

```bash
# Port-forward to access DB Console
kubectl port-forward svc/${STS_NAME}-public 8080 -n $NAMESPACE
# Then open https://localhost:8080 in your browser
```

Key things to monitor in the DB Console:

- **Node List**: Watch for nodes joining and leaving as migration progresses. Total node
  count stays constant (new CrdbNode created before old STS pod is removed).
- **Replication Status**: Under-replicated and unavailable ranges should stay at zero.
  The migration controller waits for under-replicated ranges to clear before proceeding
  to the next node.
- **Ranges Dashboard**: Under-replicated ranges counter should not increase during migration.

### CockroachDB Health Checks

The controller performs these checks automatically between each node migration, but you can
verify manually:

```bash
# Check under-replicated ranges (should be 0)
# During migration, STS pods use container name "db"; after migration, CrdbNode pods use "cockroachdb"
kubectl exec $STS_NAME-0 -n $NAMESPACE -c db -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT sum((metrics->>'ranges.underreplicated')::INT8) FROM crdb_internal.kv_store_status;"

# Check all nodes are live (count should match total nodes)
kubectl exec $STS_NAME-0 -n $NAMESPACE -c db -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT count(DISTINCT node_id) FROM crdb_internal.kv_store_status;"

# For insecure clusters, replace --certs-dir with --insecure
```

### Watch migration status

```bash
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.status.migration.phase} {.status.migration.message}' -w
```

### Watch events

```bash
kubectl get events -n $NAMESPACE \
  --field-selector involvedObject.name=$STS_NAME \
  --sort-by='.lastTimestamp'
```

### Watch CrdbNode creation during PodMigration

```bash
kubectl get crdbnode -n $NAMESPACE \
  -l crdb.cockroachlabs.com/cluster=$STS_NAME -w
```

### Phase-Specific Checks

| Phase | What to watch |
|-------|---------------|
| Init | `kubectl describe crdbcluster $STS_NAME` for MigrationStarted event |
| CertMigration | For self-signer: `kubectl get secret $STS_NAME-node-secret -n $NAMESPACE`. For cert-manager: check the secret name from the Certificate CR (`kubectl get certificate $STS_NAME-node -n $NAMESPACE -o jsonpath='{.spec.secretName}'`). For user-provided certs: your existing secret is used directly. TLS clusters only |
| PodMigration | `kubectl get crdbnode -n $NAMESPACE -w` for one node per pod |
| Finalization | `kubectl get crdbcluster $STS_NAME -o jsonpath='{.status.migration.message}'` for "Finalization complete" |
| Complete | After StatefulSet deletion; `spec.mode: MutableOnly` and `crdb.io/migrate` label changes to `complete` |

### Auto-pause behavior

During PodMigration, if a newly created CrdbNode does not pass health checks within
**10 minutes**, the controller automatically pauses migration by setting the phase to
`PhaseStopped`. Health checks run every **10 seconds** and verify:

1. CrdbNode has `PodReady=True` condition
2. Pod is in `Running` phase with `Ready=True` condition
3. SQL health check passes (zero under-replicated ranges and correct live node count)
4. Pod is registered in the headless service endpoints

When auto-paused, investigate the stuck node and resume with `kubectl label sts $STS_NAME crdb.io/migrate=start --overwrite`.

### Prometheus Metrics

```
crdb_operator_migration_phase{cluster, namespace, phase}
crdb_operator_migration_pods_total{cluster, namespace}
crdb_operator_migration_pods_migrated{cluster, namespace}
crdb_operator_migration_duration_seconds{cluster, namespace, phase}
crdb_operator_migration_errors_total{cluster, namespace, phase, error_type}
crdb_operator_migration_rollbacks_total{cluster, namespace, reason}
```

### PDB Behavior During Migration

- **Init through PodMigration**: The original Helm PDB remains active. Pod disruption
  protection is maintained throughout.
- **Finalization**: The controller deletes the old PDB (`{name}` or `{name}-budget`) and
  immediately creates the new PDB (`{name}-pdb`). There is no gap in protection.
- **Rollback**: All PDB variants are deleted (`{name}`, `{name}-budget`, `{name}-pdb`).
  The original PDB is not recreated by the migration controller. It is recreated by the
  Helm chart on the next `helm upgrade` or by the Helm release's existing resources.

## Step 7: Delete StatefulSet to Complete Migration

After Finalization completes, the controller stops processing and waits for the user to
delete the StatefulSet. The StatefulSet is intentionally left intact. Once deleted, the
controller sets `spec.mode=MutableOnly` and records `Phase=Complete`.

```bash
# Verify Finalization is done (Mode is still Disabled at this point)
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.status.migration.message}'
# Expected: Finalization complete. Delete the StatefulSet to mark migration complete.

# Delete the StatefulSet to trigger Phase=Complete
kubectl delete sts $STS_NAME -n $NAMESPACE

# Verify completion (may take a few seconds)
# Mode switches to MutableOnly and label changes to "complete" after STS deletion.
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.spec.mode} {.status.migration.phase}'
# Expected: MutableOnly Complete
```

All STS pods are already at replicas=0 by the time Finalization runs (scaled down one by one
during PodMigration). Deleting the StatefulSet object does not evict any running pods.

## Step 8: Verify Cluster Health Post-Migration

```bash
# All CrdbNodes should be healthy
kubectl get crdbnode -n $NAMESPACE -l crdb.cockroachlabs.com/cluster=$STS_NAME

# All pods running
kubectl get pods -n $NAMESPACE -l crdb.cockroachlabs.com/cluster=$STS_NAME

# Verify data integrity from any CrdbNode pod
# Note: post-migration, the container name is "cockroachdb" (not "db" as in the original STS)
kubectl exec $STS_NAME-0 -n $NAMESPACE -c cockroachdb -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT count(*) FROM [SHOW RANGES];"

# Verify under-replicated ranges are zero
kubectl exec $STS_NAME-0 -n $NAMESPACE -c cockroachdb -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT sum((metrics->>'ranges.underreplicated')::INT8) FROM crdb_internal.kv_store_status;"
```

### Verify preserved configurations

```bash
# WAL failover (if configured)
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.spec.template.spec.walFailoverSpec}'

# Logs PVC (if configured)
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.spec.template.spec.logsStore}'

# Log-config ConfigMap (converted from Helm Secret)
kubectl get configmap ${STS_NAME}-log-config -n $NAMESPACE

# TLS certificates (secret names depend on cert type)
# Self-signer: {name}-node-secret, {name}-client-secret (regenerated by migration)
kubectl get secret $STS_NAME-node-secret -n $NAMESPACE
kubectl get secret $STS_NAME-client-secret -n $NAMESPACE
# cert-manager: secrets are managed by cert-manager (names from Certificate CR)
kubectl get certificate $STS_NAME-node -n $NAMESPACE -o jsonpath='{.spec.secretName}'
# User-provided: your original secrets are used directly
# CA ConfigMap (created for all TLS cert types)
kubectl get configmap $STS_NAME-ca-crt -n $NAMESPACE

# PCR (if configured)
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.spec.template.spec.virtualCluster}'
```

## Step 9: Prepare values.yaml for CockroachDB Helm Chart

Before running `helm upgrade`, create a `values.yaml` that matches the migrated CrdbCluster
spec. The CockroachDB Helm chart generates a CrdbCluster from these values, so they must align
with what migration produced.

```bash
# Inspect the migrated CrdbCluster spec to extract the values you need
kubectl get crdbcluster $STS_NAME -n $NAMESPACE -o yaml
```

### Option A: Generate values.yaml automatically

```bash
./bin/migration-helper export-values \
  --crdb-cluster $STS_NAME \
  --namespace $NAMESPACE \
  --output-dir ./manifests
```

Review the generated file:

```bash
cat ./manifests/values.yaml
```

If the generated file contains `cockroachdb.crdbCluster.rbac.serviceAccount.name`, keep
that value as is. It preserves the service account used by the migrated cluster.

### Option B: Build values.yaml manually

Key values to set (map each to your migrated spec):

| Helm value | Source from migrated CrdbCluster |
|---|---|
| `cockroachdb.crdbCluster.image.name` | `spec.template.spec.image` |
| `cockroachdb.crdbCluster.regions` | `spec.regions` (code, nodes, namespace, cloudProvider) |
| `cockroachdb.tls.enabled` | `spec.tlsEnabled` |
| `cockroachdb.crdbCluster.rbac.serviceAccount.name` | `spec.template.spec.serviceAccountName` (leave empty to use default fullname) |
| `cockroachdb.crdbCluster.resources` | `spec.template.spec.podTemplate.spec.containers[0].resources` |
| `cockroachdb.crdbCluster.rollingRestartDelay` | `spec.rollingRestartDelay` |
| `cockroachdb.crdbCluster.clusterSettings` | `spec.clusterSettings` |

If the source Helm release used custom values (affinity, tolerations, nodeSelector, etc.),
carry those forward into the new values.yaml as well.

### Field Mapping Reference

| Source (StatefulSet) | Migrated v1beta1 shape | Helm adoption value |
|---|---|---|
| StatefulSet name | `CrdbCluster.metadata.name` | `k8s.fullnameOverride` |
| Container image | `spec.template.spec.image` | `cockroachdb.crdbCluster.image.name` |
| Data PVC template | `spec.template.spec.dataStore` | `cockroachdb.crdbCluster.dataStore` |
| `--wal-failover=path=...` | `spec.template.spec.walFailoverSpec` | `cockroachdb.crdbCluster.walFailoverSpec` |
| Dedicated `logsdir` PVC | `spec.template.spec.logsStore` | `cockroachdb.crdbCluster.log.logsStore` |
| Helm log Secret | Converted to ConfigMap; `spec.template.spec.loggingConfigMapName` | `cockroachdb.crdbCluster.loggingConfigMapName` |
| Service account | `spec.template.spec.podTemplate.spec.serviceAccountName` | `cockroachdb.crdbCluster.rbac.serviceAccount.name` with `create=false` |
| `--locality` tier keys | `spec.template.spec.localityLabels` | Exported into values; patch `localityMappings` for custom labels |
| Ingress intent | Preserved as annotation on CrdbCluster | `cockroachdb.crdbCluster.service.ingress` |
| PCR config | `spec.template.spec.virtualCluster` | `cockroachdb.crdbCluster.virtualCluster` |

## Step 10: Annotate Resources for Helm Adoption

The migration controller creates resources but does not annotate them for Helm ownership.
For `helm upgrade` to manage these resources, they must carry Helm ownership annotations.

```bash
# Namespace-scoped resources
for RESOURCE in \
  "crdbcluster/${STS_NAME}" \
  "serviceaccount/${STS_NAME}" \
  "service/${STS_NAME}-public" \
  "role/${STS_NAME}" \
  "rolebinding/${STS_NAME}"; do
  kubectl annotate "${RESOURCE}" \
    meta.helm.sh/release-name="${RELEASE_NAME}" \
    meta.helm.sh/release-namespace="${NAMESPACE}" \
    -n "${NAMESPACE}" --overwrite
  kubectl label "${RESOURCE}" \
    app.kubernetes.io/managed-by=Helm \
    -n "${NAMESPACE}" --overwrite
done

# Ingress resources (only if your cluster has Ingress resources)
for RESOURCE in \
  "ingress/ui-${RELEASE_NAME}" \
  "ingress/sql-${RELEASE_NAME}"; do
  kubectl get "${RESOURCE}" -n "${NAMESPACE}" 2>/dev/null && \
  kubectl annotate "${RESOURCE}" \
    meta.helm.sh/release-name="${RELEASE_NAME}" \
    meta.helm.sh/release-namespace="${NAMESPACE}" \
    -n "${NAMESPACE}" --overwrite && \
  kubectl label "${RESOURCE}" \
    app.kubernetes.io/managed-by=Helm \
    -n "${NAMESPACE}" --overwrite
done
```

If skipped, `helm upgrade` will fail with "resource already exists" errors.

Do not annotate the migration-created ClusterRole/ClusterRoleBinding for Helm adoption.
The CockroachDB Helm chart creates its own cluster-scoped RBAC with different names
(`{fullname}-{namespace}-node-reader`). The migration-created ones are stale and should
be deleted (see next step).

## Step 11: Delete Stale Resources

The migration controller creates some resources that do not match what the CockroachDB Helm
chart produces. These must be deleted before or after `helm upgrade`.

```bash
# Migration-created ClusterRole and ClusterRoleBinding use "{namespace}-{name}" naming.
# The CockroachDB Helm chart creates its own with "{fullname}-{namespace}-node-reader" naming.
# Delete the migration versions so they don't accumulate as orphans.
kubectl delete clusterrole ${NAMESPACE}-${STS_NAME} --ignore-not-found
kubectl delete clusterrolebinding ${NAMESPACE}-${STS_NAME} --ignore-not-found

# Old ClusterRole and ClusterRoleBinding from the source Helm release (bare cluster name)
kubectl delete clusterrole ${STS_NAME} --ignore-not-found
kubectl delete clusterrolebinding ${STS_NAME} --ignore-not-found

# Old PDB from source Helm chart (operator creates its own "{name}-pdb" format)
kubectl delete pdb ${STS_NAME} -n ${NAMESPACE} --ignore-not-found
kubectl delete pdb ${STS_NAME}-budget -n ${NAMESPACE} --ignore-not-found
```

## Step 12: Configure LocalityMappings

The migration controller preserves the `--locality` flag tier keys (e.g. `region`, `zone`)
as `localityLabels` on the CrdbNodeSpec. `localityLabels` is deprecated in favor of
`localityMappings`, which maps K8s node labels to CockroachDB locality tiers. The default
mapping covers standard K8s topology labels (`topology.kubernetes.io/region` → `region`,
`topology.kubernetes.io/zone` → `zone`).

If your cluster uses custom K8s node labels for locality, update `localityMappings` to
match. Each entry maps a K8s node label key to a CockroachDB locality tier name.

```bash
kubectl patch crdbcluster $STS_NAME -n $NAMESPACE --type merge -p '
spec:
  template:
    spec:
      localityMappings:
        - nodeLabel: "my-custom-label/region"
          localityLabel: "region"
        - nodeLabel: "my-custom-label/zone"
          localityLabel: "zone"
'
```

If you are using the standard `topology.kubernetes.io/*` labels, the kubebuilder defaults
are correct and no action is needed.

## Step 13: Run Helm Upgrade with CockroachDB Chart

Before upgrading, verify the operator has fully reconciled the migrated cluster. Do not
proceed until `generation` and `observedGeneration` match and all pods are running.

```bash
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.metadata.generation} {.status.observedGeneration}'
# Both values should match

kubectl get pods -n $NAMESPACE -l crdb.cockroachlabs.com/cluster=$STS_NAME
# All pods should be Running and Ready
```

```bash
helm upgrade ${RELEASE_NAME} ./cockroachdb-parent/charts/cockroachdb \
  --namespace ${NAMESPACE} \
  --set migration.enabled=true \
  --values ./manifests/values.yaml
```

Verify the upgrade succeeded and no resources were duplicated:

```bash
# CrdbCluster should be managed by Helm now
kubectl get crdbcluster $STS_NAME -n $NAMESPACE -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}'
# Expected: Helm

# ClusterRole should use the new naming convention
kubectl get clusterrole | grep $STS_NAME
# Expected: {fullname}-{namespace}-node-reader (created by Helm chart)
```

Use `migration.enabled=true` on the **cockroachdb chart** only for migration adoption. It
relaxes pre-upgrade validation so the chart can adopt an existing migrated CrdbCluster
without blocking on CRD checks. This is separate from `migration.enabled=true` on the
**operator chart** (set in Step 4), which enables the migration controller itself.

After adoption is verified, consider performing a rolling restart to confirm chart-managed
configuration is fully applied. Post-migration there is no StatefulSet, so trigger a rolling
restart via `helm upgrade` with an updated timestamp:

```bash
helm upgrade ${RELEASE_NAME} ./cockroachdb-parent/charts/cockroachdb \
  --namespace ${NAMESPACE} \
  --set migration.enabled=true \
  --set cockroachdb.crdbCluster.timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --values ./manifests/values.yaml
```

Verify generation matching to confirm the operator has reconciled:

```bash
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.metadata.generation} {.status.observedGeneration}'
# Both values should match
```

### Update Certificate Mode After Adoption

After migration, all certificate references are stored as `externalCertificates` on the
CrdbCluster spec, regardless of the original cert type. The `export-values` tool outputs
these as `cockroachdb.tls.externalCertificates`. After Helm adoption, update your
`values.yaml` to use the cert mode that matches your intended ongoing management:

- **Self-signer**: Switch to `cockroachdb.tls.selfSigner.enabled: true` and remove the
  `externalCertificates` block. The operator's self-signer will manage cert rotation going
  forward. The migration-created `{name}-node-secret` and `{name}-client-secret` secrets
  become stale once the self-signer creates its own. Delete them after verifying the new
  certs are working.
- **cert-manager**: Switch to `cockroachdb.tls.certManager.enabled: true` with the
  appropriate issuer reference. The migration preserved the Certificate CR and its
  `spec.secretName`, so cert-manager continues to manage rotation. Remove the
  `externalCertificates` block from values.
- **User-provided / External**: Keep `cockroachdb.tls.externalCertificates` as exported.
  You are responsible for cert rotation.

After updating cert mode, run `helm upgrade` again and verify pods are healthy. Clean up
any stale secrets that are no longer referenced:

```bash
# Check which secrets are actually mounted by pods
kubectl get pod $STS_NAME-0 -n $NAMESPACE -o jsonpath='{.spec.volumes[*].secret.secretName}'

# Delete stale migration-created secrets if they are no longer mounted
kubectl delete secret $STS_NAME-node-secret -n $NAMESPACE --ignore-not-found
kubectl delete secret $STS_NAME-client-secret -n $NAMESPACE --ignore-not-found
```

---

## Certificate Detection

The controller automatically detects your certificate method. No manual configuration is needed.

- **cert-manager**: If cert-manager Certificate CRs exist for the cluster (`{name}-node`),
  the controller updates the Certificate CR with join service DNS SANs and preserves the
  issuer references. cert-manager then regenerates the secrets automatically. CrdbNode pods
  mount from the cert-manager-managed secret (the name from `spec.secretName` in the
  Certificate CR), not `{name}-node-secret`. This keeps cert-manager's automatic rotation
  working after migration.
- **Self-signer** (Helm built-in): The controller loads the existing CA from cluster secrets,
  regenerates node and client certificates with join service DNS SANs, and writes them to
  the destination secrets (`{name}-node-secret`, `{name}-client-secret`). CrdbNode pods
  mount from `{name}-node-secret`. The regenerated certificates have a 1-year TTL and are
  stored as `ExternalCertificates` in the v1beta1 spec. The operator does not auto-rotate
  `ExternalCertificates`, so after migration you should switch to
  `cockroachdb.tls.selfSigner.enabled: true` via Helm adoption (Step 9-13) to enable
  automatic rotation. If you delay this step, the certs will expire silently after one year.
- **Provided certs** (`tls.certs.provided`): The CA private key is not available, so the
  controller skips cert regeneration. CrdbNode pods mount the user's existing secrets
  directly (the secret name parsed from the StatefulSet volumes). The user must update their
  certificates to include join service DNS SANs before starting the migration (see
  prerequisites).
- **Insecure clusters**: Detected from the `--insecure` start flag. The entire cert migration
  phase is skipped. An `InsecureClusterMigration` warning event is emitted.

> **Note**: Regardless of the original cert type, after migration all certificate secret names
> are stored as `ExternalCertificates` on the CrdbNode spec. This is the internal representation
> used by the operator to mount the correct secrets into pods.

---

## Controlling Migration (Stop / Resume / Rollback)

### Stop (Pause)

Pauses migration at the current phase. No resources are deleted. CrdbNodes already created
remain running and serving traffic.

```bash
kubectl label sts $STS_NAME crdb.io/migrate=stop --overwrite -n $NAMESPACE
```

### Resume

There is no separate "resume" label value. Use `start` again to resume from the paused phase.
The controller detects the `PhaseStopped` state internally and resumes at the correct phase
based on how many nodes have already been migrated.

```bash
kubectl label sts $STS_NAME crdb.io/migrate=start --overwrite -n $NAMESPACE
```

### Rollback

Rollback is safe at any phase before Complete. Removing the label triggers automatic rollback.

The controller automatically:
1. Deletes all CrdbNodes and waits for their pods to terminate.
2. Restores StatefulSet to original replica count.
3. Removes migration labels (`crdb.cockroachlabs.com/cluster`, `svc`) from pods.
4. Deletes CA ConfigMap (`{name}-ca-crt`).
5. Deletes the ConfigMap created from the log-config Secret.
6. Deletes all PDB variants (`{name}`, `{name}-budget`, `{name}-pdb`).
7. Restores original service selectors (`app.kubernetes.io/instance`, `app.kubernetes.io/name`).
8. Deletes namespace-qualified ClusterRole and ClusterRoleBinding (`{namespace}-{name}`).
9. Removes the migration label from the StatefulSet.

All cleanup steps are non-fatal. If a resource is already deleted or inaccessible, the
controller logs a warning and continues with the remaining cleanup.

```bash
kubectl label sts $STS_NAME crdb.io/migrate- -n $NAMESPACE
```

**What happens to data during rollback?** Data written during migration is safe. CockroachDB
replicates data across nodes. When CrdbNodes are deleted, their data is re-replicated to the
remaining STS pods (which are scaled back up). No data is lost as long as the replication
factor is maintained.

**During rollback, two sets of pods may briefly coexist.** The controller scales the STS back
up before deleting CrdbNodes, ensuring the cluster always has enough replicas.

**What happens to PVCs during rollback?** When CrdbNodes are deleted, their PVCs are also
deleted. When the StatefulSet scales back up, Kubernetes creates new PVCs. Unlike forward
migration (which reuses existing PVCs), rollback creates fresh storage. Data safety is
maintained through CockroachDB's built-in replication. Data is re-replicated from the
nodes that remain healthy throughout the process.

### Rollback safety by phase

| Phase | Rollback safe? | Notes |
|---|---|---|
| Init | Yes | Only a CrdbCluster has been created; no pods affected |
| CertMigration | Yes | Only cert secrets created; no pods affected |
| PodMigration | Yes | Controller deletes CrdbNodes and scales STS back up |
| Finalization | Conditional | Safe if STS still exists. If STS was already deleted, rollback sets `PhaseFailed` |
| Complete | No | STS has been deleted. Manual recovery required |

### Label Values Reference

| Label Value | Who Sets It | Meaning |
|-------------|-------------|---------|
| `start` | User | Begin or resume migration |
| `stop` | User | Pause migration |
| `rollback` | User | Request rollback (same as removing label) |
| `in-progress` | Controller | Migration is actively running |
| `stopped` | Controller | Migration is paused |
| `complete` | Controller | Migration finished successfully |
| `failed` | Controller | Migration hit an unrecoverable error |
| (removed) | User | Triggers rollback |

### Rollback After Complete

Once `Phase=Complete`, automated rollback is not possible. The StatefulSet has been deleted.
Manual recovery steps:
1. Delete all CrdbNodes
2. Manually recreate the StatefulSet with original spec
3. Scale up and verify cluster health
4. Remove the migration label

---

## Troubleshooting

### Migration Stuck at PodMigration

If a node fails health checks for more than 10 minutes, migration auto-pauses to `PhaseStopped`.

```bash
# Check why migration stopped
kubectl get crdbcluster $STS_NAME -n $NAMESPACE \
  -o jsonpath='{.status.migration.lastError}'

# Check pod status
kubectl describe pod $STS_NAME-<index> -n $NAMESPACE

# Check CrdbNode status
kubectl get crdbnode $STS_NAME-<index> -n $NAMESPACE -o yaml

# Resume after fixing the issue
kubectl label sts $STS_NAME crdb.io/migrate=start --overwrite -n $NAMESPACE
```

### Locality Labels Missing

If CrdbNode pods remain Pending, check for locality label warnings:

```bash
kubectl get events -n $NAMESPACE \
  --field-selector reason=LocalityLabelsRequired
```

Apply the required labels to K8s nodes (see Step 2).

### Insecure Cluster Migration

The controller detects insecure clusters (`--insecure` flag) and skips certificate migration.
An `InsecureClusterMigration` warning event is emitted. No action needed unless you want to
enable TLS post-migration.

### Under-replicated Ranges

If health checks report under-replicated ranges, wait for replication to catch up. The
controller retries every 10 seconds. If ranges remain under-replicated for 10 minutes,
migration pauses.

```bash
# Check from any running CockroachDB pod (use -c db during migration, -c cockroachdb after)
kubectl exec $STS_NAME-0 -n $NAMESPACE -c cockroachdb -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT sum((metrics->>'ranges.underreplicated')::INT8) FROM crdb_internal.kv_store_status;"
```

### Status Conflict Errors

Status update conflicts are normal during migration (multiple controllers may update the same
object). The controller retries immediately on conflict. If you see repeated conflict errors
in logs, verify that no other controller is competing for the CrdbCluster status.

### Verifying RBAC

```bash
# Check namespace-scoped RBAC
kubectl get role $STS_NAME -n $NAMESPACE
kubectl get rolebinding $STS_NAME -n $NAMESPACE

# Check cluster-scoped RBAC (namespace-qualified names)
kubectl get clusterrole ${NAMESPACE}-${STS_NAME}
kubectl get clusterrolebinding ${NAMESPACE}-${STS_NAME}

# Verify ServiceAccount
kubectl get sa $STS_NAME -n $NAMESPACE
```
