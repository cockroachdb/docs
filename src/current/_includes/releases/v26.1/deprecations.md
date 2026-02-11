The following deprecations are announced in v26.1.

- **`EXPERIMENTAL SCRUB` command**: The `EXPERIMENTAL SCRUB` command is deprecated in v26.1. Use the `INSPECT` command for data consistency validation. `INSPECT` is now implemented as a generally available (GA) feature with the release of v26.1.0.

    - To validate data consistency, use `INSPECT` instead of `EXPERIMENTAL SCRUB`
    - `INSPECT` supports a `DETACHED` option to run the operation without waiting for it
    - For more information, see the [`INSPECT`]({% link v26.1/inspect.md %}) documentation

    [#155485][#155485]

- **`enable_inspect_command` session variable**: The `enable_inspect_command` session variable has been deprecated and is now effectively always set to `true`. Since `INSPECT` is now a GA feature, this session variable is no longer needed. If you have this variable set in your application configurations, you can safely remove it. [#159750][#159750]

<!-- Link references -->
[#155485]: https://github.com/cockroachdb/cockroach/pull/155485
[#159750]: https://github.com/cockroachdb/cockroach/pull/159750
