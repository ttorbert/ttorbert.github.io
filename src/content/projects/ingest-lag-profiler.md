---
title: Ingest Lag Profiler
tagline: Find the Elastic Security detection rules that silently miss late-arriving logs, and see how far each one should look back to close the gap.
---

> An independent personal project, not an official Elastic product. Status: **v0.1.0-dev**, validated end to end in a lab on Elastic 9.5.6.

## The risk

A detection rule checks a fixed slice of recent time on a schedule, for example the last 9 minutes, every 5 minutes. Logs don't always arrive promptly: agents queue events, forwarders back up, and cloud services deliver audit logs in batches.

**If an event arrives after the rule has already searched its time slice, the rule never sees it.** Nothing fails and no error is reported. The rule runs on time and looks healthy, but the alert never fires.

In the lab, a rule that ran every 5 minutes and looked back 6 minutes looked perfectly healthy. In fact, an estimated **11.7% of its events arrived too late to be checked**.

## The surprise: most prebuilt rules are already safe

This started as a hunch that ingest lag was a widespread, unmeasured gap. Testing it turned up a more useful answer.

**In Elastic 9.5.6, 89% of Elastic's prebuilt rules (2,039 of 2,297) search on `event.ingested`**, the time an event *arrived*, rather than `@timestamp`, the time it *happened*. Lag can't push events out of their window. A copy of a test rule that searched `event.ingested` missed **0 of 3,000** late events, even at 11 minutes of lag.

So the risk is concentrated in a smaller set of rules, the ones that search on `@timestamp`:

- **Custom rules** written in-house
- **Third-party and imported rules**
- **The 146 supported prebuilt rules** that still use `@timestamp`
- **Events with no `event.ingested`** at all, which even "safe" rules fall back to `@timestamp` for

If your detection content is mostly prebuilt rules on Fleet integrations, your exposure is probably small. If you write your own rules, ingest through custom pipelines or Logstash, or import rules from elsewhere, it's worth measuring.

## What the profiler does

Every hour, inside your existing Elastic deployment, it:

1. **Measures ingest lag** (`event.ingested` minus `@timestamp`) for every data stream your enabled rules search.
2. **Estimates each rule's missed events and miss rate** from that lag and the rule's schedule and look-back.
3. **Recommends a look-back** that would close the gap, including the exact **additional look-back** value to enter in Kibana.
4. **Points to the cause:** slow hosts, sources with wrong clocks, and data streams with no arrival time.
5. **Keeps 90 days of history** in a dashboard, and **alerts** when a rule's estimated miss rate passes a threshold (1% by default).
6. **Sorts your rules into groups:** measured, unaffected (`event.ingested`), and unsupported. Nothing is silently skipped.

It runs entirely in Elastic, built from Workflows, ES|QL, ingest pipelines, a dashboard and alerting rules. There are no agents, servers or external services to run.

[![The Ingest Lag Profiler dashboard in Kibana, showing rules at risk with estimated missed events, miss rates and recommended look-backs, plus lag trends, slow hosts, clock problems, measurement gaps and rule coverage](/screens/ingest-lag-profiler-dashboard.png)](/screens/ingest-lag-profiler-dashboard.png)

*The dashboard after an hour of lab traffic from normal, slow, bursty and clock-skewed hosts. Click to enlarge.*

**Missed events, not just rates.** Rules at risk are ranked by estimated missed events. In the lab run above, a rule with a 2.5% miss rate missed 1,346 events in an hour, nearly as many as one at 11.5% (1,535), because it searches four times the volume. A rate alone would have ranked it as minor. The rate still matters for rules hunting rare, high-severity events, where a handful of misses counts.

**Total versus additional look-back.** A rule's search window is its interval plus Kibana's *Additional look-back time*. The dashboard shows both the recommended total and the additional value to enter. For example, for a rule running every 5 minutes with a recommended 16-minute window, you set the additional look-back to 11.

## Does the estimate hold up?

The method was tested against real detection rules in a lab. 3,000 events were sent with known lags of 3 to 11 minutes, and every alert was matched back to its event.

| | Miss rate |
| --- | ---: |
| Profiler estimate | **55.8%** |
| Observed from real alerts | **55.6%** |

At each lag, the observed miss rate fell within the 95% interval of the formula's prediction. A per-event check predicted 2,963 of 2,963 judged outcomes correctly. [Full validation results →](https://github.com/ttorbert/ingest-lag-profiler/blob/main/docs/validation-results.md)

## What it costs

- **License:** Elastic Enterprise or trial, which Workflows requires. Elastic 9.5.6 or later.
- **Compute:** one query per hour, about 1 second per million events in that hour on a single-node lab, however many rules there are.
- **Storage:** summary rows only (one per rule, data source and hour), kept 90 days. No log data is copied.
- **Time:** about 30 minutes to install, then a few minutes a week to review.

## Limits

- **It estimates, it doesn't prove.** Figures are expected shares of events that fall outside a rule's window, not counts of missed alerts.
- **It recommends; it never changes rules.** A person decides.
- **It can only measure events with `event.ingested`.** It lists the data streams that don't have it.
- **Not covered:** machine learning rules, ES|QL rules, and rules that use a data view. They're listed so the gap is visible.
- **It can't see delay that happens before an event is timestamped**, for example when a collector stamps `@timestamp` on receipt.
- **Not yet tested** on Elastic Cloud or Serverless installs.

## Try it

**In a lab (recommended first).** On [Rancher Desktop](https://rancherdesktop.io), one command starts Elasticsearch and Kibana 9.5.6 and installs the profiler. A second sends events from slow, bursty and clock-skewed hosts:

```bash
make lab-up
make lab-traffic
```

**In your deployment.** A single Python installer (no packages needed) checks your cluster, then installs everything:

```bash
python3 scripts/lagprof.py check   --target-file targets/prod.env
python3 scripts/lagprof.py install --target-file targets/prod.env
```

Scheduled workflow runs use the permissions of whoever last saved the workflow. The setup guide shows how to run them as a dedicated low-privilege user.

**Read more:**
[Why use it](https://github.com/ttorbert/ingest-lag-profiler/blob/main/docs/value.md) ·
[Setup guide](https://github.com/ttorbert/ingest-lag-profiler/blob/main/docs/setup-guide.md) ·
[User guide](https://github.com/ttorbert/ingest-lag-profiler/blob/main/docs/user-guide.md) ·
[Miss model](https://github.com/ttorbert/ingest-lag-profiler/blob/main/docs/miss-model.md)

Results from real environments are especially welcome. [Open an issue](https://github.com/ttorbert/ingest-lag-profiler/issues) to share what you find.
