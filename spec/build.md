# Build

> Coordinator-maintained narrative board. TRACK, NEXT, PARKED and DROPPED are coordinator prose: keep them true in the change that moves feature state. NOW and PROVEN are generated from the feature lanes by `limen land`, `limen ticket done` and `limen board --write`; edit the tickets, not those lines.

TRACK at most three bullets. NEXT one clause per ticket. PROVEN names the last ten landed features, then one count line per month.

Status marks are prose only: 🟠 ACTIVE · 🔴 PLANNED · 🟢 PROVEN · ⚪ DROPPED. Nothing in `limen` treats them as workflow state.

## Model policy

The owner-approved route for this project is OMP. It applies to the coordinator,
workers, reviewers, and GitHub doorbell tasks unless the owner explicitly changes it.

| Role | Engine | Provider | Model | Thinking |
| --- | --- | --- | --- | --- |
| Coordinator | omp | openai-codex | gpt-6.1-sol | medium |
| Worker | omp | openai-codex | gpt-6.1-sol | medium |
| Reviewer | omp | openai-codex | gpt-6.1-sol | medium |

Pass all four choices explicitly when starting a job:
`--engine omp --provider openai-codex --model gpt-6.1-sol --thinking medium`.
For `limen github review` and `limen github work`, read this policy and pass these
same four flags. Do not fall back to Pi, gpt-6-astra, or another route silently.
If the selected route is unavailable, stop and report the error to the owner.
OMP itself takes provider/model/thinking flags, not an `--engine` flag.

GitHub comments may request review or work, but do not authorize approval, merge,
or push. The owner performs those actions separately. A failed launch is not a
completed review; report the actual job result and any unresolved checks.

## TRACK

- <!-- Current stretch: intended outcome, why it matters, and material constraint. At most three bullets. -->

## NOW

<!-- Generated from spec/features/active/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

## NEXT

- `FNNN-slug` (PLANNED): <!-- One clause: likely outcome, dependency, or sequencing reason. -->

## PROVEN

<!-- Generated from spec/features/done/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->
