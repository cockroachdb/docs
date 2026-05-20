- There is no guaranteed state switch from `DECOMMISSIONING` to `DECOMMISSIONED` if [`node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) is interrupted in one of the following ways:
    - The `cockroach node decommission --wait-all` command was run and then interrupted
    - The `cockroach node decommission --wait=none` command was run

    This is because the state flip is effected by the CLI program at the end. Only the CLI (or its underlying API call) is able to finalize the "decommissioned" state. If the command is interrupted, or `--wait=none` is used, the state will only flip to "decommissioned" when the CLI program is run again after decommissioning has done all its work. [#94430](https://github.com/cockroachdb/cockroach/issues/94430)
