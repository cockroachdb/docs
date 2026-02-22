# CockroachDB Docs

This repository contains the source files for the CockroachDB documentation available at [cockroachlabs.com/docs](https://cockroachlabs.com/docs).

## Suggest Improvements

Want a topic added to the docs? Need additional details or clarification? See an error or other problem? Please [open an issue](https://github.com/cockroachdb/docs/issues).

## Resources

- [Code of conduct](CODE_OF_CONDUCT.md)

---

## Contents summary

This repository contains the source and tooling for the CockroachDB documentation site. Typical contents include:

- docs/ or site/ content: topics, how-to guides, tutorials, and reference pages.
- examples/: sample projects and code snippets used in docs.
- images/ or assets/: screenshots and illustrations referenced by topics.
- build/ or scripts/: tooling and scripts to build or preview the site locally.
- config files: site generator configuration, navigation, and metadata.
- CONTRIBUTING.md and CODE_OF_CONDUCT.md: contribution and community guidelines.

(If you need a file-level inventory, run git ls-files in this repository to list every file.)

## Getting started (clone)

Clone the repository and switch to the project directory:

```bash
git clone https://github.com/cockroachdb/docs.git
cd docs
```

If you prefer SSH:

```bash
git clone git@github.com:cockroachdb/docs.git
cd docs
```

## Raise a Pull Request (typical workflow)

1. Fork the repository on GitHub (if you don't have push access to the main repo).
2. Create a branch for your change:

```bash
git checkout -b <your-username>/short-descriptive-branch-name
```

3. Make your edits locally. Run linters/tests or the local preview to verify changes when applicable.
4. Commit your changes with a clear message:

```bash
git add <files>
git commit -m "brief: concise summary of change"
```

5. Push your branch to your fork:

```bash
git push origin <your-username>/short-descriptive-branch-name
```

6. Open a Pull Request from your branch in your fork to the upstream repository's main/default branch. In the PR description include:
   - What you changed and why.
   - Any tests or steps to verify the change locally.
   - Screenshots or links if applicable.
   - A reference to any related issue number (e.g., fixes #123).

7. Address review feedback, update the branch, and push additional commits. Once approved, the PR will be merged by project maintainers.

## Local preview and testing

Check CONTRIBUTING.md for repository-specific build and preview instructions. Common patterns include:

- Running a static-site generator (Hugo, MkDocs, etc.) to serve a local preview.
- Running a local script such as `./build.sh` or `make serve` if provided.

Example (replace with actual commands if your repo uses a specific tool):

```bash
# install dependencies (example)
# npm install
# start local preview (example)
# npm run start
```

If the repository includes tests or linters, run them before opening a PR.

## Contributing & support

- Follow the project's CONTRIBUTING.md and CODE_OF_CONDUCT.md.
- For documentation style, prefer clear examples, short commands, and reproducible steps.
- If you're unsure where to add a topic, open an issue describing the proposed change before submitting a PR.
- For questions or urgent issues, contact maintainers as listed in the repository, or open an issue tagged appropriately.

## Useful links

- Repo (this project): https://github.com/cockroachdb/docs
- Live docs site: https://www.cockroachlabs.com/docs/
- Contributing guidelines: ./CONTRIBUTING.md
- Code of Conduct: ./CODE_OF_CONDUCT.md
- Issue tracker: https://github.com/cockroachdb/docs/issues
- Pull request templates and GitHub metadata: https://github.com/cockroachdb/docs/tree/main/.github
- Examples and sample code (if present): ./examples
- Community & discussion: https://github.com/cockroachdb/docs/discussions

## Development details (local setup)

This repository may use a static site generator such as Hugo or MkDocs. Replace the commands below with the project's specific tooling if different.

Hugo example:

```bash
# install Hugo (macOS)
brew install hugo

# install dependencies (if any) and run local server
hugo server -D
```

MkDocs example:

```bash
# install Python dependencies
pip install mkdocs mkdocs-material

# serve locally
mkdocs serve
```

Docker example (if provided):

```bash
# build and run a local preview container (example)
docker build -t docs-site .
docker run --rm -p 1313:1313 docs-site
```

Check CONTRIBUTING.md for exact commands and prerequisites.

## Branch & commit conventions

- Branch naming: <your-username>/short-descriptive-name or feature/<short-name>.
- Keep branch scopes small and focused.
- Commit messages: use clear, imperative tense. Prefer Conventional Commits style, e.g.,
  - feat(docs): add example for X
  - fix(docs): correct command in Y

## CI, linters & checks

- Pull requests typically trigger CI pipelines (linting, link checks, build). Address failures before requesting merge.
- Run any available linters or link checkers locally if available.

## Reporting security issues

If you discover a security vulnerability, do NOT open a public issue. Instead follow the project's security disclosure policy (if present), or contact the maintainers privately. You can also use the GitHub security advisory flow: https://docs.github.com/en/code-security/security-advisories.

## License

Refer to the LICENSE file in the repository root for license details. If a license file is missing, contact the maintainers.

---
