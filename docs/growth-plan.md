# CtxRay visibility plan — evidence before hype

## Objective and baseline

The goal is not raw impressions. It is to recruit developers who can test
CtxRay on a real Codex setup and produce evidence that improves the project.

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
An external reporter opened actionable nested-guidance bug Issue #6; this is a
qualified product finding, not an independent benchmark reproduction.

Stars remain a discovery signal for the OpenAI application, but they are not
treated as product validation on their own.

## Conversion path

```text
Show HN evidence post
  → README hero + 20-second demo
  → npm install
  → ctxray audit / lock / drift
  → reproduce one paired task
  → report outcome in Issue #1
```

CtxRay intentionally has no telemetry. Activation is therefore measured only
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

## Launch assets

| Asset                 | Purpose                         | File                                     |
| --------------------- | ------------------------------- | ---------------------------------------- |
| Repository hero       | Explain the promise instantly   | `assets/brand/ctxray-hero.svg`           |
| GitHub social preview | Make shared links recognizable  | `assets/brand/ctxray-social-preview.png` |
| Short landscape demo  | README, HN, GitHub release      | `benchmarks/demo/ctxray-demo.mp4`        |
| Square social cut     | LinkedIn and X follow-up        | `benchmarks/demo/ctxray-demo-square.mp4` |
| Reproduction CTA      | Capture qualified activation    | GitHub Issue #1                          |
| Initial raw evidence  | Make first run inspectable      | `benchmarks/results/2026-08-09-v1/`      |
| Maintainer repeat     | Show repeat + disclosed erratum | `benchmarks/results/2026-08-09-v2/`      |

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
5. At day 7, decide: iterate the message, fix product friction, or test Reddit
   using the revised evidence. Do not copy the same post unchanged.
6. At day 14, publish a compact learning note with absolute counts, conversion
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
