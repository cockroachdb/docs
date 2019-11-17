---
title: Licensing FAQs
summary: Get answers to frequently asked questions about CockroachDB's Licenses.
toc: true
toc_not_nested: true
---

## What licenses does CockroachDB use?

- Apache 2.0 for core features released up to and including the 19.1 release
- Time-limited Business Source License (BSL) for core features released in and after the 19.2 release. After three years, the license converts to the standard Apache 2.0 license. The three-year restriction is applied on a rolling basis for each release.
- Cockroach Community License (CCL) for enterprise features in perpetuity

The following table lists the current license for non-CCL features for each published release:


CockroachDB version | License | Converts to Apache 2.0   
--------------------|---------|----------------------------
19.2 | Business Source License | Oct 01, 2022
19.1 | Apache 2.0 | -                          
2.1 | Apache 2.0 | -
2.0 | Apache 2.0 | -

## How does the change to the BSL affect me as a CockroachDB user?

It likely does not. As a CockroachDB user, you can freely use CockroachDB or embed it in your applications (irrespective of whether you ship those applications to customers or run them as a service). The only thing you cannot do is offer CockroachDB as a service without buying a license.

## Is the date for conversion to Apache 2.0 license different for alphas, betas, and point releases compared to major releases?

No, for each release all associated alpha, beta, major, and minor (point) releases will become Apache 2.0 on the same day three years after the major release date.

## Can I still contribute code to CockroachDB?

Yes, you can. Contributing code will follow the same process and requires the same Contributor License Agreement as before.

## What about enterprise features?

CockroachDB’s enterprise features have always been licensed under the Cockroach Community License (CCL) and will continue to be licensed this way in our 19.2 release and beyond. The Cockroach Community License does not convert to Apache 2.0.

There are two categories of features in under the CCL: CCL (Paid) and CCL (Free). Access to CCL (Paid) features requires access to an enterprise license with Cockroach Labs. You can grab a 30-day free trial enterprise license [here](https://www.cockroachlabs.com/get-cockroachdb). CCL (Free) features are included without an enterprise license.

## What is the major difference between the Apache 2.0 license and the BSL?

The BSL license prevents hosting CockroachDB as a service without an agreement with Cockroach Labs. Outside of this usage, BSL features will continue to be free to use and source code for features under both the BSL and CCL will continue to be available.

## Can I host CockroachDB as a service for internal use at my organization?

Yes, employees and contractors can use your internal CockroachDB instance as a service, but no people outside of your organization will be able to use it without purchasing a license. Use of enterprise features will always require a license.

## What constitutes hosting CockroachDB as a service?

Hosting CockroachDB as a service means creating an offering that allows third parties (other than your employees and contractors) to operate a database. Specifically, third parties cannot modify table schemas.

## What are the differences between the BSL for CockroachDB and MariaDB’s MaxScale?

MariaDB’s MaxScale restricts production usage to “a total of less than three server instances for any purpose” while CockroachDB does not place any such restrictions. The only restriction with CockroachDB’s BSL is that CockroachDB cannot be deployed as a service without buying an enterprise license.

## Is the Business Source License an open source license?

MariaDB has not certified the BSL as complying to the [Open Source Definition](https://en.wikipedia.org/wiki/The_Open_Source_Definition) by the [Open Source Initiative](https://en.wikipedia.org/wiki/Open_Source_Initiative) (OSI). However, all source code is available from the start and most of the OSI criteria are met. As long as the software is used within the usage limitations, it’s free to use at no cost.

## Can Cockroach Labs change the license to prevent code under the BSL from becoming open source?

No, once a release is published under the new license, all code under the BSL will become open source at the specified change date. A new release can have a new license, but published releases must adhere to the license terms.

## I would like to reuse a single component from the CockroachDB project in my own software, which uses the AGPL or another open source license. Is this possible?

The CockroachDB team is committed to support the open source community and willing to  consider extracting specific internal components that are generally useful as a separate project with its own license, for example APL. For more details, feel free to [contact us](https://support.cockroachlabs.com/hc/en-us).

## Can I fork the CockroachDB project pre-BSL and create my own CockroachDB derivative with a different license?

You can fork any historical version of CockroachDB in your own project, as allowed by the license available for that version, and modify it for your purpose. Note however that only the copyright holder (Cockroach Labs) can relicense the components that you forked from: your derivative will need to keep the original license at the time of the fork. Any component you copy from a BSL-licensed CockroachDB into your project will make the BSL apply to your project as well.

## Are there additional dual-licensing options? Can Cockroach Labs issue a custom license for my use of CockroachDB?

[Contact us](https://support.cockroachlabs.com/hc/en-us).

## I work for a non-profit, as a student, or in academia, and I would like to use CockroachDB. Do I need a license to access enterprise features?

Cockroach Labs is willing to offer self-hosted CockroachDB enterprise features free of charge and discounted prices for CockroachCloud to select non-profit organizations and non-commercial academic projects. To learn more, please [contact us](https://support.cockroachlabs.com/hc/en-us).
