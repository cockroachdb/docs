- Feature Name: Training Delivery
- Status: draft
- Start Date: 2017-08-12
- Authors: sploiselle
- RFC PR: cockcroachdb/docs/#2002
- Cockroach Doc Issue: n/a

# Summary

I propose Cockroach Labs delivers training content through a Jekyll-generated HTML site, containing links to other hypertext deliverables (e.g. Google Sheets, embedded YouTube videos).

This approach leverages our existing toolchains (so it's familiar to create and iterate on content), as well as ensures that the content leverages our current branding, so it looks professional and cohesive. A secondary benefit is that it familiarizes users with Cockroach Labs' design language, making it easier to navigate through our other properties, as well.

Because of this approach's integration with our existing workflow, we can easily achieve it by placing this content in a subdirectory off of `cockroachlabs.com`, using a similar approach to both `/docs` and `/blog`.

# Motivation

We've begun developing training curriculum but have not yet determined where it lives, or how to best deliver it to attendees. Because this approach could drastically alter the authoring process, it's best to determine how this is done before we make substantial headway into producing these deliverables.

By the end of this RFC, there will be a plan for the method we plan to use for delivering training content.

# Guide-level explanation

### Elements

CockroachDB training is comprised of 3 elements:

- **Presentations** give the instructor a tool to make sure the class follows the outlined curriculum, as well as reinforce topics discussed for students with a quick summary to help them mentally model the content, as well as a canvas for visual aids.
- **Labs** provide attendees a chance to work with CockroachDB, using the information they just learned in the presentation. This should include a mixture of reinforcement of content from the presentation and step-by-step instructions to accomplish a task directly related to the presentation.
- **Demos** give the instructor the option to demonstrate something that might be difficult for attendees to quickly reproduce themselves, e.g. anomalous reads from something like Jepsen. These can be "staged" labs to help students understand that something is true or real without having to relate the conditions for it.

### Delivery

To deliver the material, each element has its own needs:

- Presentations require there being only a single bit of text presented at a time. To achieve this, I recommend using Google Slides.
- Labs require much more text, as well as other hypertext tools that we've already developed on `/docs`. To achieve this, I recommend using Markdown rendered into HTML through Jekyll.
- Demos each have different needs, but are often broadcast in the classroom from the instructor's computer. I recommend either recording demos that can be shown on YouTube, or solving demos on a case-by-case basis.

### Structure

As a wrapper around all of this content, the training material is hosted on `cockroachlabs.com/training`. We currently do not have password-restricted access on this content, but may in the future.

This site is written in Markdown and converted to HTML through Jekyll.

#### Organization

The training site is organized in this way

`home/<day>/<module>/`

That is:
- 1 home page for all training material (if this training system developers further, it's possible to insert levels above this)
- 1 page for each day, which contain links to its modules
- 1 page page for each module, which contains contains a brief summary, as well as links to both the presentations and the labs.

Off of the `../<module>/` subdirectory, there would also be a page for any labs from that day. We would not have a page for presentations because these could just be links to Google sheets.

### UX

Users go to the training site and the instructor guides them through each of the presentations. After the presentation, they return to the module page and follow through any labs related to the module.

At the end of each module page and each lab, there are links to the subsequent modules.

### Hosting

For the time being, we can include the `training` directory in `docs`, meaning it will be available at `https://cockroachlabs.com/docs/training/`.

If the project grows in scope, we could move the content elsewhere in the future.

## Drawbacks

This implementation _does not_ provide password protection, and therefor relies on obscurity to "protect" the content's IP. Because the training content is potentially monetizable, this could jeopardize that strategy.

This organization also requires the `day` and `module` pages to be re-made if we offer future trainings.

## Rationale and Alternatives

This design creates a straighforward user experience that's consistent with our docs site. It leverages our existing toolchain and requires little-to-no ramp up effort.

However, to overcome the drawbacks of lacking password authentication, training content could be delivered solely through Google Drive, swapping out HTML-rendered Markdown for Google Docs, and using Google Sheets as navigation elements. However, I think that the UX of this is very poor and places a burden onto the instructor and the attendees because of our hopes of monetizing the content.

As for the drawback of the organization of the site, we could structure the content around topics rather than by days. The challenge that poses is having users easily navigate through the entire training. However, we could certainly create different navigational structures in the future.

## Unresolved questions

- Which repo should this content belong to?
- Should this content be versioned?
- How should we handle different types of training (e.g. ops vs devs)
