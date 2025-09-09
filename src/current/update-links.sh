#!/bin/bash

sed -i '' -E 's/"..\/cockroachcloud\/connect-to-a-serverless-cluster.html/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/connect-to-a-serverless-cluster/g' v23.1/connect-to-the-database.md
sed -i '' -E 's/"..\/cockroachcloud\/connect-to-a-serverless-cluster.html/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/connect-to-a-serverless-cluster/g' v23.1/connect-to-the-database.md
sed -i '' -E 's/"..\/cockroachcloud\/transactions-page.html/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/transactions-page/g' v23.1/performance-recipes.md
sed -i '' -E 's/"..\/cockroachcloud\/metrics-page.html#sql-statement-contention/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/metrics-page#sql-statement-contention/g' v23.1/performance-recipes.md
sed -i '' -E 's/"..\/cockroachcloud\/metrics-page.html#transaction-restarts/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/metrics-page#transaction-restarts/g' v23.1/performance-recipes.md
sed -i '' -E 's/"..\/releases\/\{\{page.version.version\}\}.html/"https:\/\/www.cockroachlabs.com\/docs\/releases\/\{\{page.version.version\}\}/g' v23.1/install-cockroachdb-linux.md
sed -i '' -E 's/"..\/tutorials\/demo-json-support-interactive.html/"https:\/\/www.cockroachlabs.com\/docs\/tutorials\/demo-json-support-interactive/g' v23.1/demo-json-support.md
sed -i '' -E 's/"..\/cockroachcloud\/create-your-cluster.html/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/create-your-cluster/g' v23.1/index.md
sed -i '' -E 's/"..\/releases\/\{\{page.version.version\}\}.html/"https:\/\/www.cockroachlabs.com\/docs\/releases\/\{\{page.version.version\}\}/g' v23.1/index.md
sed -i '' -E 's/"..\/releases\/index.html/"https:\/\/www.cockroachlabs.com\/docs\/releases\/index/g' v23.1/index.md
sed -i '' -E 's/"..\/releases\/release-support-policy.html/"https:\/\/www.cockroachlabs.com\/docs\/releases\/release-support-policy/g' v23.1/index.md
sed -i '' -E 's/"..\/releases\/\{\{ page.version.version \}\}.html#\{\{ r.release_name | replace: '.', '-' \}\}/"https:\/\/www.cockroachlabs.com\/docs\/releases\/\{\{ page.version.version \}\}#\{\{ r.release_name | replace: '.', '-' \}\}/g' v23.1/fips.md
sed -i '' -E 's/"..\/cockroachcloud\/quickstart.html/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/quickstart/g' v23.1/choose-a-deployment-option.md
sed -i '' -E 's/"..\/cockroachcloud\/serverless-faqs.html#what-is-a-request-unit/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/serverless-faqs#what-is-a-request-unit/g' v23.1/choose-a-deployment-option.md
sed -i '' -E 's/"..\/cockroachcloud\/quickstart-trial-cluster.html/"https:\/\/www.cockroachlabs.com\/docs\/cockroachcloud\/quickstart-trial-cluster/g' v23.1/choose-a-deployment-option.md
sed -i '' -E 's/"..\/releases\/\{\{page.version.version\}\}.html/"https:\/\/www.cockroachlabs.com\/docs\/releases\/\{\{page.version.version\}\}/g' v23.1/install-cockroachdb-windows.md
sed -i '' -E 's/"..\/tutorials\/demo-spatial-tutorial-interactive.html/"https:\/\/www.cockroachlabs.com\/docs\/tutorials\/demo-spatial-tutorial-interactive/g' v23.1/spatial-tutorial.md
sed -i '' -E 's/"..\/releases\/\{\{page.version.version\}\}.html/"https:\/\/www.cockroachlabs.com\/docs\/releases\/\{\{page.version.version\}\}/g' v23.1/install-cockroachdb-mac.md

sed -i '' -E 's/"..\/sso-db-console.html/"{% link {{ page.version.version }}\/sso-db-console.md %}/g' v23.1/security-reference/security-overview.md
sed -i '' -E 's/"..\/gssapi_authentication.html/"{% link {{ page.version.version }}\/gssapi_authentication.md %}/g' v23.1/security-reference/security-overview.md

sed -i '' -E 's/"..\/sql-audit-logging.html/"{% link {{ page.version.version }}\/sql-audit-logging.md %}/g' v23.1/security-reference/security-overview.md
sed -i '' -E 's/"..\/demo-fault-tolerance-and-recovery.html/"{% link {{ page.version.version }}\/demo-fault-tolerance-and-recovery.md %}/g' v23.1/security-reference/security-overview.md
sed -i '' -E 's/"..\/demo-fault-tolerance-and-recovery.html/"{% link {{ page.version.version }}\/demo-fault-tolerance-and-recovery.md %}/g' v23.1/security-reference/security-overview.md
