During a major-version upgrade, certain features and performance improvements are not available until the upgrade is finalized. In v26.1, these are:

- **Improved introspection query performance**: Queries against `pg_catalog` and `information_schema` now use cached descriptors, significantly improving performance when there are many tables in the cluster. The `sql.catalog.allow_leased_descriptors.enabled` cluster setting controls this behavior (default: `true`). For more information, see the release notes for [v26.1.0-alpha.1](#v26-1-0-alpha-1-leased-descriptors) and [v26.1.0-beta.3](#v26-1-0-beta-3-leased-descriptors-default).

{% comment %}TODO: Verify with engineering that leased descriptors truly requires upgrade finalization{% endcomment %}

{% comment %}TODO: Add anchor IDs to the referenced release notes if they don't exist{% endcomment %}

{% comment %}
Additional features reviewed but NOT included:
- Distributed merge for IMPORT (bulkio.import.distributed_merge.mode): Opt-in feature, already documented in cluster settings
- Auto stats concurrency control: Internal implementation, already documented in cluster settings
{% endcomment %}
