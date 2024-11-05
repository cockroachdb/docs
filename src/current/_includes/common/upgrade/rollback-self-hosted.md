To roll back a major-version upgrade that has not been finalized:

1. Follow the steps to [perform a major-version upgrade](#perform-a-major-version-upgrade), replacing the `cockroach` binary on each node with binary for the previous major version.
1. Like a major-version upgrade, a rollback must be [finalized](#finalize-a-major-version-upgrade). When the rollback is finalized, the rollback is complete.
