# Continuous Integration

Every pull request in the docs repository is automatically built, deployed to a
test S3 bucket (`cockroach-docs-review`), and run through HTML proofer. Only if
all three of these steps succeed does the PR get a green checkmark from CI.

This process is orchestrated by the `pull-request` script in this directory.
*Please* do not make changes to the build process in the CI build configuration.
Versioning the build script along with the code means we can isolate build
script changes to one branch and atomically update the configuration when that
branch merges.

To save time, pull requests do not check external links. Those are instead
checked every night when TeamCity triggers an automatic run of the `nightly`
script in this repository.

The `builder` script and the `Dockerfile` configure a Docker image,
`cockroachdb/docs-builder`, that bundles all the necessary dependencies to run
the `nightly` and `pull-request` scripts. If you're familiar with the
[cockroachdb/cockroach] repository, `builder` operates much like the
[CockroachDB `build/builder` script][cockroachdb-builder].

[cockroachdb/cockroach]: https://github.com/cockroachdb/cockroach
[cockroachdb-builder]: https://github.com/cockroachdb/cockroach/blob/master/build/builder.sh

## Building a new docs-builder

1. Modify `ci/Dockerfile` as necessary.

2. Locally build a new version of the image:

    ```shell
    $ ci/builder build
    ```

3. Locally test your changes:

    ```shell
    $ COCKROACH_DOCS_BUILDER_VERSION=latest ci/builder run htmltest
    ````

4. Push your changes to the Docker repository.

    ```shell
    $ ci/builder push
    The push refers to a repository [docker.io/cockroachdb/docs-builder]
    ...
    YYYYMMDD-HHMMSS: digest: sha256:ade6c2ff12b2088a3eec903740b769bce1444a245002d2f2cbaadaa34589eea3 size: 1153
    ```

    You'll need to create a Docker Hub account and ask someone to give you
    access to the `cockroachdb` repository.

5. Replace the version in `ci/builder` with the version (`YYYYMMDD-HHMMSS`)
   from above.

## Changing the Gemfile

While we could run `bundle install` at the start of every CI build to pick up
any changes to the `Gemfile`, this leads to a Docker image that doesn't actually
bundle the necessary gems. Over time, this slows down CI, as it has to
re-install the gems for every build.

Instead, whenever you add or update a dependency, you'll need to bake a new
version of the `docs-builder` image by following the steps above, or the build
will fail with a missing gem error. Running `./builder build` will
automatically pick up any changes to the `Gemfile` or `Gemfile.lock`.
