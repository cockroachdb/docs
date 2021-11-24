---
title: What's New in CockroachDB Cloud
toc: true
summary: Additions and changes in CockroachDB Cloud since November 8, 2021.
---

## December 6, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- New v21.2 clusters now have Admission Control enabled by default. See https://www.cockroachlabs.com/docs/v21.2/architecture/admission-control.html for more information. (#7183)
- New pricing goes into effect December 1 ahead of hardware decouple

### Console changes

- Change logic to hide organization alerts tab
  
  * add unit test for including custom clusters
  
  * update visibility comment for alerts page (#7087)
- Prevent errors on VPC Peering and AWS
  PrivateLink pages when a large number of jobs exist in a cluster. (#7084)
- Some users will see a different label for the
  email field during sign up. (#6982)
- Add monitor card and refactor monitoring page
  
  * update tests
  
  * change props interface on dbconsole component
  
  * add box shadow
  
  * Address feedback from Andrii
  
  * add back old monitoring page to show if otel feature flag is not enabled
  
  * update styling and unit tests
  
  * update tests and more sryling updates
  
  * remove commented out styling (#7044)
- New Error page when something goes wrong and a page doesn't load. (#7144)
- Don't show upgrade banners on serverless clusters because serverless clusters versions are controlled by the host cluster. (#7160)
- Fix organization alerts selector (#7157)
- The "Add/remove" nodes button is now disabled for custom clusters. (#7133)
- Version endOfLife or cluster updating tooltips are no longer shown for serverless clusters (#7166)

### Bug fixes

- Update the browser tab title when the SQL Activity tab changes. (#7077)
- The "Data is unavailable for this graph" state should no longer show on the overview page when serverless tenants have been scaled down for extended periods. Furthermore, we now expect fully contiguous timeseries lines on the overview page, even if gaps exist in the actual values. (#7017)
- The Profile endpoints on DB console accessed through the SU dashboard will route redirects correctly. Prior to this fix, they would return 404 Not Found status errors. (#7213)