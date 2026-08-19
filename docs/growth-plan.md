# CtxWise visibility plan — evidence before hype

## Objective and baseline

The goal is not raw impressions. It is to recruit developers who can test
CtxWise on a real Codex setup and produce evidence that improves the project.

- Launch window: 9–23 August 2026.
- Primary audience: active Codex CLI users with several skills, plugins, MCP
  servers, or custom `AGENTS.md` instructions.
- Offer: see what loads, lock the intended capability surface, and detect drift
  without uploading prompts or adding another model call.
- Primary metric: **independent benchmark reproduction reports**.
- Verified 9 August baseline: 0 GitHub stars, 0 forks, 0 unique visitors, 0
  unique clones, and 0 comments on the reproduction issue.
- 14-day target: 3 independent reproduction reports, including at least 1
  actionable bug, compatibility finding, or benchmark-design improvement.

Technical-release checkpoint on 9 August: 2 stars, 0 forks, 0 pull requests,
and no independent benchmark response. GitHub's traffic endpoint still
reported 0 views and 0 clones; because those counters can be delayed, they are
not used to infer that nobody visited the repository.

Interim Show HN checkpoint on 11 August at 14:46 CEST, about 35 hours after
submission: 1 HN point, 0 HN comments, 103 unique GitHub visitors in the
rolling traffic window, and 59 unique cloners. The launch day itself recorded
101 unique visitors and 14 unique cloners; GitHub attributed 16 unique
referrals to HN. The repository had 4 stars, including the maintainer's own
star, and no pull requests. Clone counts include 46 unique cloners from before
the HN post and may include automation, so they are not treated as installs.
An external review produced an actionable nested-guidance bug; this is a
qualified product finding, not an independent benchmark reproduction.

The 48-hour review on 12 August at 18:36 CEST recorded 146 repository views
from 107 unique visitors and 188 clones from 63 unique cloners in GitHub's
rolling window. HN remained at 1 point and 0 comments, with 16 unique GitHub
referrals. The repository remained at 4 stars, 0 forks, 0 pull requests, and 0
independent reproductions. npm reported 517 downloads from 9–12 August, but the
release-day concentration is consistent with automation and registry activity,
so it is not treated as a user count.

The review also found activation friction in Issue #1: the documented
preflight could reuse the committed `2026-08-09-v1` ledger and therefore
perform no fresh calls. Version 0.2.3 replaces that path with a fresh two-turn
community ledger, a bounded share report, and checksums. Promotion resumes only
after that release is public.

The Reddit checkpoint on 14 August, roughly 14 hours after the manual
`r/OpenaiCodex` post, recorded 616 post views, 1 upvote, 0 comments, and 0
shares. The post ranked eighth among that day's community submissions. The
rolling GitHub window showed 166 views from 111 unique visitors and 207 clones
from 71 unique cloners, with 4 stars and 1 fork. GitHub did not list Reddit as
a top referrer, so no repository visit is attributed to Reddit. Attribution is
incomplete and the counters are not users.

The contribution metric did convert: the first external code PR added targeted
task selection and was merged after maintainer TDD follow-ups and CI on Node
20, 22, and 24. Version 0.2.4 exposes that work as
`npm run benchmark:quick`. Independent benchmark reproductions remain at zero;
the next experiment optimizes for that activation event rather than more
impressions.

## Conversion path

```text
Evidence-led community post
  → README hero + 20-second demo
  → npm install
  → ctxwise audit / lock / drift
  → npm run benchmark:quick
  → report outcome in Issue #1
```

CtxWise intentionally has no telemetry. Activation is therefore measured only
through voluntary public evidence, not silent CLI tracking.

| Stage                | Qualified event                                       | Data source                     | Baseline | 14-day target |
| -------------------- | ----------------------------------------------------- | ------------------------------- | -------: | ------------: |
| Exposure             | One evidence-led Show HN submission                   | Hacker News item                |        0 |             1 |
| Visit                | Unique repository visitor                             | GitHub Traffic                  |        0 |           100 |
| Intent               | Unique repository clone                               | GitHub Traffic                  |        0 |            10 |
| Activation           | Independent reproduction with environment + outcome   | GitHub Issue #1 / linked PR     |        0 |             3 |
| Contribution         | Actionable issue, benchmark improvement, or code PR   | GitHub Issues and pull requests |        0 |             1 |
| Retention / referral | Same tester returns or links a second independent run | Public follow-up                |        0 |             1 |

GitHub traffic retains a short rolling window, clones are not the same as
installs, and npm download counts can include automation. Reviews must report
these limitations with the numbers.

## Experiment 1 — Show HN

- Decision: does an evidence-first message attract qualified Codex testers?
- Hypothesis: developers will test a local drift guard when the public raw
  benchmark, limitations, and privacy boundary are visible before installation.
- Audience rule: people using Codex CLI with a non-trivial local context setup.
- Channel: one Show HN submission; no simultaneous cross-post during the first
  48 hours, so feedback remains attributable enough to learn from.
- Intervention: v0.2.1 release, new repository hero, short demo, concise
  benchmark card, and one CTA to reproduce Issue #1.
- Primary metric: independent reproduction reports.
- Guardrails: zero quota-bypass language, zero fabricated social proof, zero
  telemetry, and maintainer replies within 24 hours.
- Effort cap: 4 hours of launch preparation plus 30 minutes per day for replies.
- Start / end: 10 August 2026 / 24 August 2026.
- Minimum useful observation: 7 days and 50 unique GitHub visitors. If the post
  never reaches 50 visitors, treat it as a distribution test, not a product
  verdict.
- Success threshold: 3 independent reports and at least 1 actionable finding.
- Stop condition: pause promotion if a benchmark claim cannot be reproduced or
  a privacy/security issue is credible; fix and disclose before resuming.

## Experiment 2 — Reddit community reproduction

- Decision: does removing the reproduction trap convert qualified attention
  into at least one externally run benchmark or actionable failure?
- Hypothesis: a high-information post with one two-turn command will produce a
  verified report because the tester no longer has to choose an ID or infer
  which artifacts are safe to share.
- Audience rule: active Codex CLI users willing to spend two turns and review
  locally generated evidence before sharing it.
- Channel: one manually submitted `r/OpenaiCodex` Showcase after the original
  `r/codex` attempt was removed by an account-age filter. No bot submission and
  no simultaneous cross-post.
- Intervention: the published v0.2.3 post used
  `npm run benchmark:reproduce`; the v0.2.4 activation follow-up uses the more
  explicit `npm run benchmark:quick`, an automatic `community-*` ledger,
  `share.md`, and `SHA256SUMS.txt`.
- Primary metric: independently run reports accepted in Issue #1.
- Guardrails: state the two-turn quota cost, disclose maintainer affiliation,
  count failures, do not call npm downloads users, and follow subreddit flair
  and high-information rules.
- Effort cap: one post plus 30 minutes per day for three days of replies.
- Start / end: 13 August 2026 / 16 August 2026.
- Minimum useful observation: 72 hours after publication.
- Success threshold: at least 1 independently run report or 1 new actionable
  compatibility/benchmark finding.
- Stop condition: moderator removal, credible privacy/security concern, or a
  fresh-ledger failure; investigate before any further distribution.

## Experiment 3 — named Codex channels after the display rebrand

- Decision: does using the public name **CtxWise** on Codex-native
  channels convert qualified testers without colliding with the unrelated
  PyPI `ctxray` project?
- Hypothesis: people already using Codex plugins or GitHub Discussions will
  follow one two-turn command when the product name, package, and privacy
  boundary are unambiguous.
- Audience rule: Codex CLI users who can install `@framy2/ctxwise` or add the
  repository marketplace.
- Channel sequence, one at a time: GitHub `openai/codex` Show and tell, then
  OpenAI Developer Community, then Awesome Codex Plugins, then the unofficial
  Codex plugin marketplace, then a DEV write-up. Console.dev and Product Hunt
  wait for an independent reproduction.
- Intervention: full identity rename to CtxWise. Drafts are in
  `docs/republication-posts.md`.
- Primary metric: independently run reports accepted in Issue #1.
- Guardrails: no simultaneous cross-post, no fabricated social proof, disclose
  maintainer affiliation, do not call npm downloads users, do not submit
  Reddit again during the Experiment 2 observation window.
- Effort cap: one post per day plus 30 minutes of replies.
- Start / end: 15 August 2026 / 23 August 2026.
- Success threshold: at least 1 independently run report or 1 new actionable
  compatibility/benchmark finding.
- Stop condition: a benchmark claim cannot be reproduced, or a
  privacy/security issue is credible.

## Launch assets

| Asset                 | Purpose                         | File                                      |
| --------------------- | ------------------------------- | ----------------------------------------- |
| Repository hero       | Explain the promise instantly   | `assets/brand/ctxwise-hero.svg`           |
| GitHub social preview | Make shared links recognizable  | `assets/brand/ctxwise-social-preview.png` |
| Short landscape demo  | README, HN, GitHub release      | `benchmarks/demo/ctxwise-demo.mp4`        |
| Square social cut     | LinkedIn and X follow-up        | `benchmarks/demo/ctxwise-demo-square.mp4` |
| Reproduction CTA      | Capture qualified activation    | GitHub Issue #1                           |
| Initial raw evidence  | Make first run inspectable      | `benchmarks/results/2026-08-09-v1/`       |
| Maintainer repeat     | Show repeat + disclosed erratum | `benchmarks/results/2026-08-09-v2/`       |

## Operating cadence

1. Publish v0.2.1 and verify npm, CI, CodeQL, release links, video playback, and
   social preview. **Completed 9 August 2026.**
2. Post the approved Show HN draft from `docs/launch-kit.md`; record its public
   URL and start the 48-hour observation window. **Completed 10 August 2026:**
   <https://news.ycombinator.com/item?id=49238209>.
3. Reply with method or code links, not defensive marketing. Convert recurring
   confusion into README fixes or labeled issues.
4. At 48 hours, record visitors, clones, issue comments, stars, and the actual
   questions asked. A correctness issue discovered during the window pauses
   cross-posting until the tested v0.2.2 fix is public.
5. The 48-hour review selected one product repair and one channel: ship the
   fresh-ledger flow, then manually test Reddit with a revised evidence-led
   post. **Completed 13 August in `r/OpenaiCodex` after the `r/codex`
   account-age removal.**
6. Review the Reddit experiment after 72 hours. Version 0.2.4 lowers the CTA to
   a named two-turn smoke test and converts the first external PR into a request
   for independent evidence. The 17 August checkpoint recorded
   **0 independent reproductions**, 4 stars (1 maintainer), 1 fork, 113 unique
   visitors, and 93 unique cloners in GitHub's rolling window. v0.3.0 is the
   current public release.
7. At day 14, publish a compact learning note with absolute counts, conversion
   rates, caveats, and the next experiment.

## Review template

- Absolute counts: visitors / clones / reports / actionable findings / PRs.
- Rates: clone ÷ visitor; reproduction ÷ unique clone.
- Quality: which reports included enough data to reproduce?
- Burden: maintainer hours and median response time.
- Caveats: traffic window, automation, attribution, and selection bias.
- Decision: stop / iterate / scale.
- Next experiment: Reddit community test, maintainer outreach, or documentation
  repair — choose only one based on the evidence.
