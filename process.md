Hi, Claude. This doc is for you to understand the process

# Player Card Rating System

**Turning 500 real cricketers into cards that feel right to fans and balance right in a match**

Role: Systems and Economy Design
Context: Built on shipped work at Lightfury Games (E Cricket), extended into a standalone design model
Tools: Python, Excel, React, ESPNcricinfo data

---

## The problem

Any sports collection game has to answer one question before it can answer anything else: what number goes on the card?

Get it wrong in one direction and the game is statistically correct but feels broken. Get it wrong in the other and it feels good but the meta collapses, because ratings stop tracking anything a player can reason about.

The clearest version of this failure: if you build OVR directly off ICC rankings, Abhishek Sharma outranks Virat Kohli in T20I. That is accurate to current form and completely unacceptable to a cricket fan looking at a card. ICC rankings are a form tracker. A card rating is a claim about a player's identity.

So the design brief became:

1. A single visible OVR per player, per format
2. Credible to a fan who already has an opinion about that player
3. Derived from real data, not hand-assigned
4. Reproducible across ~500 players without manual curation
5. Explainable in one sentence per card

---

## Why one stat is not enough

The first instinct is batting average. It fails immediately in T20, where a 45 average at 118 strike rate is a worse card than a 28 average at 165.

Strike rate alone fails too. It rewards tail-end cameos. A number 9 with 6 innings and a 190 SR will beat a top-order anchor every time.

Every single metric I tested had a player it embarrassed. The fix was not a better metric. It was accepting that OVR is a composite of separate claims about a player, and making each claim a named, weighted input.

---

## The seven pillars

| # | Pillar | Weight | What it answers |
|---|---|---|---|
| 1 | Career Output | 25% | How productive is this player over a career? |
| 2 | Peak ICC Rating | 20% | How high did they ever climb? |
| 3 | Popularity | 15% | Does the fan expect this player to be good? |
| 4 | Role Reliability | 10% | Do they show up consistently in their role? |
| 5 | Opposition Quality | 10% | Did they do it against real teams? |
| 6 | Matchup Profile | 10% | Are they good against both pace and spin? |
| 7 | Current Form | 10% | Are they good right now? |

Every pillar is normalised to 0-100 against fixed historical floors and ceilings, then combined and mapped onto a bounded OVR scale.

### 1. Career Output (25%)

Three sub-inputs, weighted internally:

- Batting average, normalised across a 22 to 52 band, 35% of the pillar
- Strike rate, normalised across 118 to 172, 40% of the pillar
- Boundary percentage, normalised across 25 to 65, 25% of the pillar

Strike rate carries the most weight because the target product is a short-format game. In a 2-over match, scoring rate is the dominant contributor to a result. Boundary percentage is included separately because it captures ceiling in a way that strike rate averages away.

### 2. Peak ICC Rating (20%)

Normalised across a 700 to 920 band. This is the legacy anchor. It is what stops a player who dominated for six years from being demoted because of a bad eighteen months. It is also the single pillar that most closely matches how fans actually rank players in conversation.

### 3. Popularity (15%)

Log-scaled Instagram following. This is the pillar that gets the most pushback, so the reasoning matters.

A card rating is a product surface, not a scientific claim. If the game tells a player that a household name is a 74, the player does not conclude the household name has declined. They conclude the rating system is broken and stop trusting every other number in the game. Popularity is included as an explicit, bounded, visible input rather than as a thumb on the scale during manual review.

It is log-scaled because follower counts span three orders of magnitude and a linear scale would let two or three global superstars flatten everyone else into noise.

### 4. Role Reliability (10%)

Combines how often the player is in the XI, not-out percentage, and batting position consistency. This is what separates a fixed top-order batter from a floating utility pick with a similar average.

### 5. Opposition Quality (10%)

Records are filtered to performances against the top 10 ranked opposition, then weighted by country strength. Runs against a full-strength attack are worth more than runs padded against associate nations.

### 6. Matchup Profile (10%)

Separate vs pace and vs spin ratings, averaged into the pillar. These are also surfaced on the card as visible attributes rather than being buried inside OVR, because matchup is actionable information for squad building and OVR is not.

### 7. Current Form (10%)

Current ICC rating. Deliberately the smallest weight it can be while still moving the number. Form should make a card breathe across a season, not rewrite a player's identity.

---

## Calibration problems and fixes

Two structural failures showed up only after running the model across the full player set.

**Cameo inflation.** Tail-end bowlers with tiny sample sizes were ranking in the top ten. A bowler with 6 innings and two lucky slogs looked elite on rate stats. Fixed with a minimum innings threshold against top 10 opposition. Players below the threshold are excluded from the rated pool and written out separately for review rather than silently dropped.

**Over-penalising specialists.** The first innings-weight curve had a hard floor for anyone under 50 innings. This was meant to protect against small samples but it was punishing legitimate modern T20 specialists relative to long-career veterans, purely for having played in a shorter era. Fixed with a softer curve:

| Innings vs top 10 | Weight |
|---|---|
| 100+ | 1.00 |
| 50 to 99 | 0.95 |
| 30 to 49 | 0.90 |
| 15 to 29 | 0.85 |
| Under 15 | 0.75 |

Both fixes came from reading the output list top to bottom and asking a single question about each row: would a cricket fan argue with this? Every argument was a bug.

---

## What the prototype does

An interactive React tool that:

- Renders generated player cards with OVR and the visible sub-attributes
- Exposes every pillar weight as a live control
- Recalculates and reorders the full player list in real time as weights change
- Shows the pillar breakdown behind any single card, so any rating can be traced back to its inputs

The point of making the weights live is that it turns a static formula into an argument you can have. Drag popularity to zero and watch the leaderboard become statistically defensible and commercially unusable. That tradeoff is easier to demonstrate than to describe.

---

## What I would change

**Popularity is a proxy, not a measure.** Instagram following correlates with fame but also with market size and social media habits. A regionally beloved player in a smaller cricket nation is undervalued. A proper reputation index would blend search volume, jersey sales, and broadcast appearances.

**Format-specific cards, not one universal rating.** The gap between formats is large enough that a single OVR misrepresents most players. A Test specialist and a T20 specialist should not share a number.

**Bowling parity.** The seven pillars are tuned for batting. Bowling needs its own pillar set with economy and phase usage carrying the weight that strike rate carries here, not a mirrored version of the batting model.

**The card type layer.** The cleanest long-term answer to the form vs legacy tension is not a better single formula. It is separating base cards, peak-moment cards, and legend cards, and letting each one make a different claim.

---

## Takeaway

The hardest part of a rating system is never the math. It is deciding what the number should feel like to someone who already has an opinion, then defending that against balance requirements. Every weight in this model is a position on that tradeoff, and every one of them is written down and adjustable rather than buried in a spreadsheet.