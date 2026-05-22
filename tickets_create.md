Jira Ticket Specification: cockroachdb/docs → cockroachlabs/docs (Private) Migration

Instructions for AI Ticket Creator

Create one Jira ticket per section below. Each section contains all fields needed to create the ticket. Use the following mappings:





Project: DOC or EDUENG as specified per ticket



Issue Type: Story unless otherwise stated



Labels: Always include project-stanley, docs-repo-migration



Epic Link: Link to DOC-17040 (Update cockroachdb/docs to be compatible with Project Stanley) unless specified otherwise



Priority: Use the priority stated in each ticket



Assignee: Use the suggested assignee; leave unassigned if not specified



TICKET 1

Project: EDUENG Summary: Reconnect Netlify build & deploy pipeline from cockroachdb/docs to cockroachlabs/docsPriority: Critical Suggested Assignee: Eeshan Bembi Labels: project-stanley, docs-repo-migration, netlify, ci-cd Epic: EDUENG-720

Description

The docs site's Netlify project is currently connected to the GitHub repository cockroachdb/docs via GitHub App authorization. When the docs repo moves to cockroachlabs/docs (private), Netlify will lose access to the repository and all builds — including production builds and PR preview deploys — will fail immediately.

Currently, deploy preview URLs follow the pattern:

https://deploy-preview-{PR_NUMBER}--cockroachdb-docs.netlify.app


These are tied to the Netlify project's GitHub integration with the cockroachdb org.

What breaks:





Production deploys on merge to main stop triggering



PR preview deployments stop generating (reviewers lose the preview link bot comment)



The netlify-prod-build GitHub Actions workflow (prod-build-notify.yml) that monitors build status will begin reporting failures since it can no longer detect Netlify events tied to the new repo



All existing deploy preview URLs in open PRs become stale

What needs to change:





In the Netlify dashboard (app.netlify.com), disconnect the cockroachdb-docs site from cockroachdb/docs and reconnect it to cockroachlabs/docs



Re-authorize the Netlify GitHub App for the cockroachlabs org (may require org admin approval from Dev-Inf)



Confirm that the Netlify build settings (build command, publish directory, environment variables) transfer correctly



Update the prod-build-notify.yml workflow to correctly reference the new repo if it contains any hardcoded org references



Verify that PR preview deploys work end-to-end for a test PR against cockroachlabs/docs



Validate that all environment variables and secrets stored in Netlify (e.g., Algolia keys, any API tokens) are still present and valid after the reconnect

Acceptance Criteria:





Netlify site successfully triggers on push to cockroachlabs/docs main branch



PR preview deploys generate correctly for new PRs against cockroachlabs/docs



The Netlify bot posts preview URLs in PR comments as before



prod-build-notify.yml reports correct build status in GitHub



No regression in build time or reliability



Full production build completes successfully after reconnect

Dependencies:





Requires the cockroachlabs/docs repo to exist and have content (repo migration must happen first)



Requires org-admin access to the cockroachlabs GitHub org to authorize the Netlify GitHub App



Coordinate with Dev-Inf (Kiki Carter) for org-level GitHub App authorization



TICKET 2

Project: EDUENG Summary: Update Exalate Jira↔GitHub sync from cockroachdb/docs to cockroachlabs/docsPriority: Critical Suggested Assignee: Kikia Carter (coordinate with James Linder / Rishabh Makhija) Labels: project-stanley, docs-repo-migration, exalate, jira-sync Epic: EDUENG-720

Description

Exalate is the tool that syncs GitHub issues and PRs with the Jira DOC project. The cockroachlabs/exalate repository contains dedicated sync rule scripts for the cockroachdb/docs <> DOC connection. These scripts are hardcoded with:

GITHUB_ORG=cockroachdb
GITHUB_REPO=docs


The Exalate connection is named Jira_DOC_GitHub_docs_Production and syncs the Jira Documentation (DOC) project with the GitHub cockroachdb/docs repo.

If the docs repo moves to cockroachlabs/docs, the sync will silently break — new Jira DOC tickets will not create GitHub issues, and GitHub PR events will not update Jira tickets.

What breaks:





New DOC Jira tickets will not sync to cockroachlabs/docs GitHub issues



GitHub PR comments and status changes on cockroachlabs/docs will not update corresponding Jira tickets



The Jira_DOC_GitHub_docs_Production Exalate connection becomes orphaned

What needs to change:





Open a PR in cockroachlabs/exalate to update the docs-DOC sync rule environment variables: 

GITHUB_ORG=cockroachlabs
GITHUB_REPO=docs




Regenerate and redeploy all four affected groovy scripts:





docs-DOC/jira-incoming-sync-rule.groovy



docs-DOC/jira-outgoing-sync-rule.groovy



docs-DOC/github-incoming-sync-rule.groovy



docs-DOC/github-outgoing-sync-rule.groovy



Update the test connection variables (JIRA_PROJECT=DOCSTEST, GITHUB_REPO=exalate-test-docs) if a new test repo is needed under cockroachlabs



Re-test using the DOCTEST Jira project and exalate-test-docs GitHub repo (or a new equivalent under cockroachlabs)



Verify the Automatic Deployment Exalate GitHub Actions workflow in cockroachlabs/exalate picks up the changes and redeploys

Acceptance Criteria:





Creating a new DOC Jira ticket correctly creates a linked GitHub issue in cockroachlabs/docs



Commenting on a cockroachlabs/docs PR updates the corresponding Jira ticket



Merging a cockroachlabs/docs PR transitions the linked Jira ticket status



No sync events are lost or duplicated during cutover



Old cockroachdb/docs Exalate connection is cleanly deactivated (not just abandoned)

Dependencies:





Requires James Linder and/or Rishabh Makhija access to the Exalate admin panel



Requires cockroachlabs/docs to exist and have the GitHub App for Exalate installed



Must coordinate timing with the repo cutover date to avoid a sync blackout window



TICKET 3

Project: EDUENG Summary: Reinstall GitHub Apps (docs-orchestrator, release-notes-automation) on cockroachlabs/docsPriority: Critical Suggested Assignee: Kikia Carter Labels: project-stanley, docs-repo-migration, github-apps, service-accounts Epic: EDUENG-720

Description

GitHub Apps installed on cockroachdb/docs do not automatically carry over when the repo moves to a different organization. The following GitHub Apps are currently installed on cockroachdb/docs and are used by EDUENG tooling:





docs-orchestrator: Handles webhook triggers for the AI documentation pipeline



release-notes-automation: Handles automated release note workflows

Additionally, fine-grained Personal Access Tokens (PATs) and service account tokens scoped to cockroachdb/docs will cease to work on cockroachlabs/docs. Examples include:





DOCS_FORK_PUSH_TOKEN (used by ccloud automation to push to docs fork)



DOCS_PR_CREATE_TOKEN (used to create PRs against cockroachdb/docs)

What breaks:





The docs orchestrator stops receiving webhook events from the docs repo



Automated release note PRs can no longer be created against the docs repo



Any CI/CD token that was scoped to cockroachdb/docs will get 403 Forbidden errors on cockroachlabs/docs

What needs to change:





Install docs-orchestrator GitHub App on cockroachlabs/docs (requires org admin in cockroachlabs)



Install release-notes-automation GitHub App on cockroachlabs/docs



Rotate all fine-grained PATs that are scoped to cockroachdb/docs:





Create new PATs scoped to cockroachlabs/docs with equivalent permissions (Contents: Read/Write, Pull Requests: Read/Write, Issues: Read/Write)



Update the secrets in all repos and services that consume these tokens



Verify webhook delivery is working by triggering a test event on cockroachlabs/docs



Confirm the docs-orchestrator GitHub App is present in the cockroachlabs org (may need to be configured there separately if it was only installed at the cockroachdb org level)

Acceptance Criteria:





Both GitHub Apps show as installed and active on cockroachlabs/docs



Webhook delivery test shows events being received by docs-orchestrator from cockroachlabs/docs



A test automated PR can be created against cockroachlabs/docs using the new PATs



Old tokens scoped to cockroachdb/docs are revoked after verified cutover



All downstream services (AI pipeline, release notes workflow) updated with new token values

Dependencies:





Requires cockroachlabs org-admin access (coordinate with Dev-Inf)



Blocks Ticket 7 (AI documentation suite webhook update)



Must complete before cutover date



TICKET 4

Project: EDUENG Summary: Update ccloud update-docs.yml workflow to target cockroachlabs/docs (private) Priority: Critical Suggested Assignee: Coordinate with Cloud Engineering (Christopher Fitzner) and Eeshan Bembi Labels: project-stanley, docs-repo-migration, github-actions, ccloud Epic: EDUENG-720

Description

The cockroachlabs/ccloud-private-automation-testing repository contains an update-docs.yml GitHub Actions workflow that automatically creates PRs against the docs repo when a new ccloud CLI release is cut. This workflow has a hardcoded reference to cockroachdb/docs:

- name: Checkout docs
  uses: actions/checkout@v6
  repository: cockroachdb/docs
  persist-credentials: false
  path: ${{ env.DOCS_DIR }}


Additionally, the workflow uses DOCS_FORK_PUSH_TOKEN and DOCS_PR_CREATE_TOKEN secrets scoped to cockroachdb/docs, and the pr_target_repo is hardcoded to cockroachdb/docs.

When the docs repo becomes cockroachlabs/docs (private), this workflow will fail with a 404/403 when trying to check out the repo — no automated ccloud docs PRs will be created.

What breaks:





update-docs.yml fails at the checkout step for every ccloud release



No automated docs PRs are created for ccloud CLI changes



The workflow summary shows failure for every release

What needs to change:





Update repository: cockroachdb/docs → repository: cockroachlabs/docs



Update pr_target_repo: cockroachdb/docs → pr_target_repo: cockroachlabs/docs



Replace DOCS_FORK_PUSH_TOKEN with a new fine-grained PAT scoped to cockroachlabs/docs



Replace DOCS_PR_CREATE_TOKEN with a new fine-grained PAT scoped to cockroachlabs/docs (Pull requests: Read/Write, Issues: Read/Write)



Update the fork_repo and related fork config if the bot (crl-gh-actions-pr-bot) uses a fork of cockroachdb/docs — ensure it has a fork of cockroachlabs/docs instead



Make the repo path configurable via an environment variable or secret so future org changes are a config-only update: 

env:
  DOCS_REPO: ${{ vars.DOCS_REPO || 'cockroachlabs/docs' }}




Test by triggering a manual dispatch of the workflow against cockroachlabs/docs

Acceptance Criteria:





update-docs.yml successfully checks out cockroachlabs/docs (private) with correct auth



A test manual dispatch creates a draft PR against cockroachlabs/docs



The PR is created by the correct bot account



Docs repo reference is configurable (not hardcoded)



Old secrets scoped to cockroachdb/docs are cleaned up

Dependencies:





Depends on Ticket 3 (new PATs scoped to cockroachlabs/docs)



Coordinate with Christopher Fitzner (Cloud Engineering) who owns ccloud-private-automation-testing



TICKET 5

Project: EDUENG Summary: Add cockroachlabs/docs to Terraform as a "critical" repository Priority: Critical Suggested Assignee: Kikia Carter (coordinate with Richard Stewart / Dev-Inf) Labels: project-stanley, docs-repo-migration, terraform, github-repo-management Epic: EDUENG-720

Description

cockroachdb/docs is currently classified as a critical repository and is managed via Terraform in crl-infrastructure. Critical repos have Terraform-managed branch protection, access controls, and repository settings. No one can gain JIT admin access to critical repos — all management goes through Terraform PRs.

The new cockroachlabs/docs repo also needs to be classified as critical and added to Terraform config. Richard Stewart has confirmed this should happen once the repo exists (referenced in #docs-infrastructure-team Slack thread from 2026-05-20).

What is at risk without this:





Without Terraform management, cockroachlabs/docs would be an "open" repo where anyone could gain JIT admin access — inappropriate for the private docs repo



Branch protection rules (required PR reviews, required status checks) would not be enforced



The repo could be misconfigured accidentally by anyone with JIT access

What needs to change:





Ping Richard Stewart in #docs-infrastructure-team to initiate the Terraform PR for cockroachlabs/docs



Open a PR to crl-infrastructure (or the appropriate Terraform repo) to add cockroachlabs/docs as a critical repository resource



Configure the Terraform resource to match the current cockroachdb/docs settings:





Branch protection on main (require PR review, require status checks: pr-review, link check, etc.)



Required reviewers (docs team)



Dismiss stale reviews on push



Validate that the new Terraform resource applies cleanly without destroying existing repo settings



Document the Terraform resource location for the EDUENG team runbook

Acceptance Criteria:





cockroachlabs/docs appears in Terraform state as a critical repository



Branch protection rules are applied: PRs require review, required status checks are enforced



No one can gain JIT admin access to the repo outside of Terraform



Terraform apply completes without errors



Dev-Inf confirms the repo is classified as critical in their internal registry

Dependencies:





Requires Richard Stewart / Dev-Inf coordination



Must be completed before or simultaneously with the repo cutover



Blocks ability to configure branch protection, webhooks, and repo settings



TICKET 6

Project: EDUENG Summary: Migrate and audit all GitHub Actions workflows from cockroachdb/docs to cockroachlabs/docsPriority: High Suggested Assignee: Eeshan Bembi Labels: project-stanley, docs-repo-migration, github-actions, ci-cd Epic: EDUENG-720

Description

The cockroachdb/docs repository contains multiple GitHub Actions workflows in .github/workflows/. These workflows need to be present in cockroachlabs/docs and audited for any hardcoded references to the cockroachdb org.

Known workflows that exist and need migration/audit:





prod-build-notify.yml — Monitors Netlify production builds



pr-review check — Required status check for PR mergeability



Cross-version link check — Validates links across versioned docs pages



sql_test_runner.py workflow — SQL block extraction and testing (EDUENG-131, open PR #23350)



Any other workflows discovered during audit

Specific hardcoding concerns:





Workflows that use github.repository — this will automatically resolve to the new repo, so these are usually safe



Workflows that hardcode cockroachdb/docs as a string in repository:, env:, or run: steps — these break



Workflows that reference secrets by name (fine as long as secrets are re-added to new repo)



GITHUB_TOKEN permissions — these scope to the current repo automatically, so they are safe



Any uses: referencing a reusable workflow in another org/repo — verify access still works

What needs to change:





Audit: Run a scan across all files in .github/ for hardcoded cockroachdb/docs strings



Migrate: Copy all workflow files to cockroachlabs/docs/.github/workflows/



Update: Replace any hardcoded cockroachdb org references with the new org, or make them configurable via env vars



Secrets: Re-add all required repository secrets to cockroachlabs/docs (list them in the ticket during audit)



Branch protection: Confirm required status checks (pr-review, link-check) are re-registered as required once workflows run in the new repo



Runners: Confirm self-hosted runner labels (if any) are valid for the cockroachlabs org

Acceptance Criteria:





All workflows from cockroachdb/docs are present and passing in cockroachlabs/docs



No hardcoded cockroachdb/docs references remain in any workflow file



All required secrets are added to the new repo



Required status checks (pr-review, link check) are enforced on the main branch



At least one full PR cycle (open → review → merge) completes successfully with all checks green

Dependencies:





Depends on Ticket 5 (Terraform / branch protection)



Depends on Ticket 1 (Netlify integration, for preview deploy workflow)



SQL test workflow (EDUENG-131) should be validated in the new repo context



TICKET 7

Project: DOC Summary: Complete remote_include elimination before cockroachdb/docs repo move (DOC-17061 long tail) Priority: High Suggested Assignee: Eeshan Bembi Labels: project-stanley, docs-repo-migration, remote-include Epic: DOC-17040

Description

PR #23297 vendors 88 machine-generated docs files and removes {% remote_include %} calls for generated reference content (cluster settings, event log, functions/operators, log formats, logging). However, it leaves a long tail of remaining remote_include uses, specifically in:

_includes/*/misc/tooling.md


These remaining remote_include directives fetch content from raw.githubusercontent.com/cockroachdb/cockroach. While Project Stanley (making cockroachdb/cockroach private) is the primary driver of DOC-17061, the same principle applies to the docs repo move: if any external system or build step fetches raw content from raw.githubusercontent.com/cockroachdb/docs, those calls will break when the docs repo becomes private under cockroachlabs.

Additionally, the vendoring PR (#23297) was flagged as not including a sync automation process — just a one-time copy. The tooling to keep vendored files current needs to be defined and documented.

What needs to change:





Resolve the outstanding review feedback on PR #23297: add or reference a sync process/script for keeping vendored generated files current



Audit and remove or replace remaining remote_include calls in _includes/*/misc/tooling.md





Run: rg -n 'remote_include https://raw\.githubusercontent\.com/cockroachdb/cockroach' src/current



Confirm no other files in the docs repo use remote_include with any raw.githubusercontent.com/cockroachdb/docs URL (content that references itself)



Scan for any external systems that may pull raw content from raw.githubusercontent.com/cockroachdb/docs/ — these would break when the docs repo goes private



Document the sync process for vendored generated files (how and when to refresh them)

Acceptance Criteria:





Zero remaining remote_include calls to raw.githubusercontent.com/cockroachdb/cockroach in the docs repo



Vendored files in _includes/cockroach-generated/ have a documented and scripted sync process



No external systems are found that fetch raw content from raw.githubusercontent.com/cockroachdb/docs



PR #23297 is merged or superseded with the sync automation gap addressed



DOC-17061 can be marked Done after this ticket resolves

Dependencies:





Blocks: docs repo move (repo cannot go private until remote fetches are eliminated)



Related: DOC-17062 (raw YAML/JSON/script download handling)



Discuss with Paul Blankinship and Ryan Kuo on approach before PRing (per Docs Weekly notes)



TICKET 8

Project: EDUENG Summary: Update SQL diagram generation and grammar sync to work against private repo Priority: High Suggested Assignee: Eeshan Bembi Labels: project-stanley, docs-repo-migration, sql-diagrams, grammar-sync, developer-tooling Epic: EDUENG-720 Due: 2026-05-26

Description

Two developer tooling systems are assigned to Eeshan in the EDUENG migration plan and have not yet been fully audited for docs-repo dependencies:

SQL Diagram Generation: SQL diagrams are generated from schema definitions that may be pulled from cockroachdb/cockroach. The generation scripts may reference cockroachdb/docs as the output destination. TeamCity jobs check that SQL diagrams and the docs repo are in sync whenever a new release branch is cut — this TeamCity job references the docs repo by path. If the docs repo moves, the TeamCity job breaks silently.

Grammar Sync Enforcement: The grammar sync tool enforces that grammar files in the docs repo match those in cockroachdb/cockroach. It likely references both the cockroach repo (already going private as cockroachlabs/cockroach-private) and the docs repo by hardcoded path.

What needs to change:





Audit SQL diagram scripts: Find all references to cockroachdb/docs in the SQL diagram generation tooling (check scripts/, TeamCity job configs, any CI workflows)



Audit grammar sync scripts: Find all references to cockroachdb/docs in grammar sync enforcement tooling



Make configurable: Per the EDUENG design principle, replace hardcoded org/repo paths with environment variables: 

DOCS_REPO=${DOCS_REPO:-cockroachlabs/docs}
COCKROACH_REPO=${COCKROACH_REPO:-cockroachlabs/cockroach-private}




Update TeamCity jobs: Coordinate with Dev-Inf to update any TeamCity job configurations that reference cockroachdb/docs



Validate: Run a full SQL diagram generation cycle and grammar sync against the new repo paths to confirm correctness

Acceptance Criteria:





Complete audit document listing every reference to cockroachdb/docs in SQL diagram and grammar sync tooling



All references are made configurable (not hardcoded)



SQL diagram generation runs successfully against the new repo setup



Grammar sync enforcement runs successfully



TeamCity job configs are updated (or confirmed to not reference the docs repo path directly)



No regressions: diagrams and grammar sync produce equivalent output before and after changes

Dependencies:





Depends on Ticket 3 (service account / token access for the new repo)



Coordinate with Dev-Inf for TeamCity job config changes



TICKET 9

Project: DOC Summary: Update "Edit this page", "View source", and "Report doc issue" links in the published docs site Priority: High Suggested Assignee: Docs team (Brandon Sanchez / Paul Blankinship) Labels: project-stanley, docs-repo-migration, site-config, external-links Epic: DOC-17040

Description

The published CockroachDB documentation site (cockroachlabs.com/docs) has "Edit This Page", "View Page Source", and "Report Doc Issue" links in the page footer/header. These links are generated from a template and point to:

https://github.com/cockroachdb/docs/edit/{branch}/{file_path}
https://github.com/cockroachdb/docs/blob/{branch}/{file_path}


When the docs repo becomes cockroachlabs/docs (private), clicking any of these links will show a GitHub "Repository not found" or "404" error to all users — including internal Cockroach Labs employees without explicit access to the private repo.

Additionally, the community-tooling.md file has a hardcoded old-style link:

open a pull request to our docs GitHub repository
href: https://github.com/cockroachdb/docs/edit/master/v21.2/community-tooling.md


What needs to change:





Find the Jekyll/site config template that generates the "Edit this page" and "View source" href base — update it to point to cockroachlabs/docs (or remove these links if the repo is private and external contribution is no longer supported)



Decide on external contribution policy: if the repo is private, external PRs are impossible. Update the contribution guidance on the docs site accordingly



Update community-tooling.md hardcoded link (and any similar pages) to either:





Point to the new private repo URL (accessible only to Cockroach Labs employees)



Remove the "open a PR" CTA for external contributors if the repo is private



Check for any other hardcoded github.com/cockroachdb/docs links in .md files across the docs source using: 

rg -rn 'github\.com/cockroachdb/docs' src/current/




Update the contributing/style guide docs to reflect the new contribution workflow

Acceptance Criteria:





No 404 errors when clicking "Edit this page" links on the published site



community-tooling.md contribution link is updated or removed



Scan of all docs source files finds zero remaining hardcoded github.com/cockroachdb/docs links (or all found instances are intentionally updated)



External contributor guidance on the docs site reflects the current repo access model

Dependencies:





Requires a policy decision on external contributions (Paul Blankinship / leadership)



Should be deployed before the docs repo goes private



TICKET 10

Project: DOC Summary: Define external contribution strategy for private cockroachlabs/docs repo Priority: Medium Suggested Assignee: Paul Blankinship (decision), Kikia Carter (implementation) Issue Type: Task Labels: project-stanley, docs-repo-migration, community, external-contributions Epic: DOC-17040

Description

cockroachdb/docs is currently a public repository with 207 stars, open forks, and external community contributions. The "Third-Party Tools Supported by the Community" page explicitly invites external PRs. Moving to a private repo under cockroachlabs/docs eliminates all external contribution workflows.

This ticket tracks the policy and communication decisions required before the repo goes private.

Questions that must be answered:





Will external contributors still be able to contribute? If so, how? (Public mirror? Issue-based feedback only?)



What happens to existing forks of cockroachdb/docs? (They become inaccessible to forkers)



Should the existing cockroachdb/docs public repo remain as a read-only mirror or archive?



How should users who click "Edit this page" be redirected? (GitHub issue template? Feedback form?)



Do we need to notify the 207 current stargazers / watchers?

What needs to change:





Hold a decision-making meeting with Paul Blankinship and stakeholders



Document the decided contribution policy



Update the docs site contribution CTA based on the decision (feeds into Ticket 9)



If keeping a public mirror: set up a one-way sync from cockroachlabs/docs → cockroachdb/docs



Communicate the change to the community (blog post, Slack community channels, docs site notice)

Acceptance Criteria:





Written decision on external contribution policy, approved by Paul Blankinship



Contribution guidance on the docs site updated to reflect new policy



If applicable: public mirror or archive of cockroachdb/docs is configured



Community communication plan drafted and executed before repo goes private

Dependencies:





Feeds into Ticket 9 (what to do with "Edit this page" links)



Should be resolved before cutover date



TICKET 11

Project: EDUENG Summary: Update AI Documentation Suite webhooks and DB references for cockroachlabs/docsPriority: Medium Suggested Assignee: Eeshan Bembi / Mohini Pandey Labels: project-stanley, docs-repo-migration, ai-pipeline, docs-orchestrator Epic: EDUENG-720

Description

The AI Documentation Suite (docs-orchestrator, release-notes-manager, docs dashboard) interacts with the docs repo via GitHub webhooks, API calls, and potentially database records that store repo URLs.

Specific areas to audit and update:





Webhook configuration: The docs-orchestrator listens for GitHub webhook events from cockroachdb/docs. After the repo move, webhook events will come from cockroachlabs/docs. Webhooks must be reconfigured in the new repo's GitHub settings.



GitHub API calls: Any code in the orchestrator that calls api.github.com/repos/cockroachdb/docs/... needs to be updated to api.github.com/repos/cockroachlabs/docs/.... Make the org/repo configurable via environment variable.



Database records: The docs dashboard and orchestrator DB may store source_url values containing github.com/cockroachdb/docs. These rows will not automatically update and could cause incorrect routing or broken links in the dashboard.



Release notes manager: Check if cockroachdb/release-notes-manager has hardcoded references to cockroachdb/docs as the PR target.

What needs to change:





Audit all cockroach-education-ai-initiatives services for hardcoded cockroachdb/docs references



Make repo path configurable in orchestrator config (env var: DOCS_REPO=cockroachlabs/docs)



Update webhook delivery URL in cockroachlabs/docs GitHub repo settings (post-Ticket 3 GitHub App install)



Write and run a DB migration to update any github.com/cockroachdb/docs references in stored records to github.com/cockroachlabs/docs



Update release-notes-manager PR target if it creates PRs against the docs repo

Acceptance Criteria:





Complete audit of all cockroach-education-ai-initiatives services for cockroachdb/docs references



All references made configurable via environment variable



Webhook events from cockroachlabs/docs are correctly received and processed by the orchestrator



DB migration run successfully — no stale cockroachdb/docs URLs in stored records



A test end-to-end cycle (trigger → webhook → pipeline → PR) completes successfully against the new repo

Dependencies:





Depends on Ticket 3 (GitHub App reinstall and new webhook setup)



Coordinate with Mohini Pandey for release-notes pipeline side



TICKET 12

Project: EDUENG Summary: Update Glean connector to index cockroachlabs/docs (private repo) Priority: Medium Suggested Assignee: Kikia Carter (coordinate with Glean admin / Dev-Inf) Issue Type: Task Labels: project-stanley, docs-repo-migration, glean, search-indexing Epic: EDUENG-720

Description

Glean currently indexes cockroachdb/docs as a public GitHub repository. Search results across Glean (e.g., searching for docs PRs, files, or code within the docs repo) all point to cockroachdb/docs. When the repo moves to cockroachlabs/docs (private), Glean's connector will need to be reconfigured to:





Index the new repository location (cockroachlabs/docs)



Use appropriate authentication (a GitHub token or GitHub App with repo scope for the cockroachlabs org) to access the private repo



Apply correct permission mapping so only Cockroach Labs employees with access to the repo can see the indexed content in Glean

What breaks:





Glean search results for docs PRs, files, and code will still point to cockroachdb/docs (stale, or 404 for private content)



New content added to cockroachlabs/docs will not appear in Glean search



Docs team members using Glean to find docs PRs will get stale results

What needs to change:





Identify the Glean GitHub connector admin (likely Dev-Inf or IT)



Add cockroachlabs/docs as a new data source in the Glean GitHub connector with a service account token that has read access to the private repo



Configure Glean's permission model to map cockroachlabs GitHub org access to Glean visibility (i.e., only users who have GitHub access to cockroachlabs/docs should see indexed content)



Trigger an initial full crawl of cockroachlabs/docs in Glean



Once verified, remove or archive the cockroachdb/docs index in Glean (or let it naturally go stale if the old repo remains as a read-only archive)

Acceptance Criteria:





Glean search returns results from cockroachlabs/docs for new PRs and files



Permission model is correct — only authorized employees can see private repo content in Glean



Initial crawl completes without errors



Old cockroachdb/docs index is cleaned up or noted as archive-only

Dependencies:





Requires Glean admin access (coordinate with IT or Dev-Inf)



Requires a GitHub service account / token with private repo read access to cockroachlabs/docs



Should be done after the repo is populated and stable in its new location



Meta Notes for AI Ticket Creator





Ticket ordering / dependencies: Tickets 3 and 5 must be completed first as they unblock most others. The recommended order is: 5 → 3 → 1 → 2 → 4 → 6 → 7 → 8 → 9 → 10 → 11 → 12.



Epic linking: Tickets 1, 3, 4, 5, 6, 8, 11, 12 → link to EDUENG-720. Tickets 2, 7, 9, 10 → link to DOC-17040.



Sprint: All Priority Critical/High tickets should target the sprint ending before 2026-06-01 (the Project Stanley cutover deadline).



Parent ticket: Consider creating a parent Epic or Initiative ticket that groups all 12 tickets under the theme "cockroachdb/docs → cockroachlabs/docs migration".



Labels to apply globally: project-stanley, docs-repo-migration

