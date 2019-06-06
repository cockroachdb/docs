---
title: Contribute to CockroachDB
summary: Contribute to the development of CockroachDB.
toc: true
---

We made CockroachDB source-available to empower developers to fix and extend the product to better meet their needs. Nothing thrills us more than people so passionate about the product that they‘re willing to spend their own time to learn the codebase and give back to the community. We created this doc so we can support contributors in a way that doesn’t sacrifice precious bandwidth that we use to serve our users and otherwise meet our business goals.


## Introduction

A good way to find a project properly sized for a first time contributor is to search for open issues with the label ["help wanted"](https://github.com/cockroachdb/cockroach/labels/help%20wanted).

We separate three levels of complexity for projects:

- **Low complexity:** You can work on these projects on your own and tell us afterwards about it. These are often tagged “easy” in our issues list.
- **Medium complexity:** You can work on these projects on your own, but you should write an [RFC](https://github.com/cockroachdb/cockroach/tree/master/docs/RFCS) before you start implementing.
- **High complexity:** You should discuss these projects with us before you start working on design or solution.

Below you’ll find steps for contributing to the codebase; we’ve broken these down by complexity.

## How complex is your project?

A project is likely to be **low complexity** if all the following conditions apply:

- Users do not need to change the way they use CockroachDB as a result.
- Other CockroachDB contributors do not need to change the way they work as a result.
- The architecture of the software or the project doesn’t change in a way that’s visible to more than a handful of developers.
- The change doesn’t impact the cost model of CockroachDB (how much time and how much memory is used for common operations) in a way that's noticeable by users.
- You can predict in advance that completing the change will not cost you more than a week of work (provided this isn’t your very first contribution).

A project is likely **high complexity** if _any_ of the following conditions apply:

- More than a few users/apps will need to change the way they use CockroachDB as a result.
- More than a few other CockroachDB contributors will need to change the way they work as a result.
- The architecture of the software or the project changes in a way visible to more than a handful of developers.
- The change impacts the cost model of CockroachDB (how much time and how much memory is used for common operations) in a way that's noticeable by users.
- New software dependencies are introduced.
- New subdirectories/packages will be created in the repository.
- You can predict in advance that completing this change will take more than a month.

Projects that are neither definitely simple nor complex can be considered **medium complexity**.

## How to contribute

### Prerequisites

Before you start a project:

1. See [CONTRIBUTING.md](https://github.com/cockroachdb/cockroach/blob/master/CONTRIBUTING.md) to set up your local dev environment and learn about our code review workflow.
2. Follow a few [code reviews](https://github.com/cockroachdb/cockroach/pulls).
3. See [style.md](https://github.com/cockroachdb/cockroach/blob/master/docs/style.md) to learn about our code style and conventions.

### Low-complexity projects

These cover things like bug fixes and small enhancements that do not involve any major architectural or design decisions. You should feel free to submit these for review as you come across them.

1. Find or create an issue.
2. Write the fix, include the appropriate tests, and follow our [code review workflow](https://github.com/cockroachdb/cockroach/blob/master/CONTRIBUTING.md#code-review-workflow).
3. A CockroachDB engineer will validate and merge.

A good place to find these types of projects are open issues with the label ["easy"](https://github.com/cockroachdb/cockroach/issues?q=is%3Aopen+is%3Aissue+label%3Aeasy+label%3Ahelpwanted).

### Medium-complexity projects

For these projects, you should:

1. Proactively reach out to the Cockroach team and discuss your proposal.
2. One of our engineers will provide feedback on your design. Occasionally, you will be asked to contribute an RFC, too, in which case you should follow the regular [RFC process](https://github.com/cockroachdb/cockroach/tree/master/docs/RFCS) before you start implementing the solution.
3. When everyone is happy, you can get started coding and follow the normal [code review workflow](https://github.com/cockroachdb/cockroach/blob/master/CONTRIBUTING.md#code-review-workflow).

{{site.data.alerts.callout_info}}If we are under time pressure to deliver a feature and it’s not tracking towards completion (or if your team goes radio silent), we may pull development back in house.{{site.data.alerts.end}}

Here’s a great example of a contributor [building support for outer joins](https://github.com/cockroachdb/cockroach/issues/13342) in partnership with our engineering team.

### High-complexity projects

These projects involve fundamental changes to the way CockroachDB works. What’s important to remember here is that supporting external development of these projects will take a non-trivial amount of time from the Cockroach team that would otherwise be spent building the product, so we really need to make sure it’s worth it. In practice, we’ve found even strong developers have little success with these types of projects and, in most cases, it is faster for our team to build these features ourselves.

That being said, if you’re up for the challenge there are a few prerequisites. You should:

1. Convince the CockroachDB team of your ability to drive a larger project. For this, you can either work with the CockroachDB team on mid-sized projects first, or provide some other evidence that you are an expert at building high quality distributed systems.
    {{site.data.alerts.callout_info}}The engineering team may not support further exploration if they think the project is too complex for an external contributor or if we already have a schedule for this work and you cannot guarantee delivery on that schedule.{{site.data.alerts.end}}
2. Make a high-level proposal for your project, declaring your intention, the area of functionality, and how much time (and, if applicable, people) you have available to work on the project. You should do this via a GitHub issue.
3. Engineers and product managers will review your plans to understand how it fits into our roadmap from a technical and business point of view. This will inform how much support we will be able to provide.
    {{site.data.alerts.callout_info}}This review may take a few days to a few weeks, depending on our team’s availability and the complexity of the project.{{site.data.alerts.end}}
4. Submit an [RFC](https://github.com/cockroachdb/cockroach/tree/master/docs/RFCS).
5. Engineers will review your RFC and discuss the detailed design from a technical perspective. This will further inform how much support we will be able to provide.
6. Once everyone is on the same page in terms of the design and impact, you can begin implementation with our support.
    {{site.data.alerts.callout_info}}The CockroachDB team may have to pull a project back in house if development is happening too slowly or your team goes radio silent.{{site.data.alerts.end}}

Pitfalls:

- Avoid submitting an [RFC](https://github.com/cockroachdb/cockroach/tree/master/docs/RFCS) for a complex project before approaching the CockroachDB first with a high-level description. The risk is that you spend a lot of effort on writing a RFC and the CockroachDB team then decides the project doesn't fit on the roadmap.
- If you fork the CockroachDB repository and start working on a complex project in your fork without following the process above, **chances are extremely slim** that your functionality will eventually be merged in the main CockroachDB distribution. The reason for this is that we will not agree to merge any code changes that have not been validated step by step (i.e., commit by commit) in accordance with our quality standards, and we are not yet able to validate these quality standards on external repositories.

In situations where we will not be able to support your team through an implementation, we will do our best to communicate why we are making that decision.
