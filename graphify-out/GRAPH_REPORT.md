# Graph Report - ampulife  (2026-05-01)

## Corpus Check
- 42 files · ~46,184 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 348 nodes · 865 edges · 21 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `update()` - 25 edges
2. `z()` - 24 edges
3. `c()` - 23 edges
4. `w()` - 23 edges
5. `$()` - 23 edges
6. `pushLog()` - 18 edges
7. `updatea()` - 17 edges
8. `qe()` - 16 edges
9. `bt()` - 16 edges
10. `cloneState()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Ye()` --calls--> `e()`  [INFERRED]
  public\legacy\js\jquery.min.js → public\legacy\js\sweetalert2.all.min.js
- `I()` --calls--> `h()`  [INFERRED]
  public\legacy\js\jquery.min.js → public\legacy\js\sweetalert2.all.min.js
- `$()` --calls--> `e()`  [INFERRED]
  public\legacy\js\jquery.min.js → public\legacy\js\sweetalert2.all.min.js
- `z()` --calls--> `R()`  [INFERRED]
  public\legacy\js\jquery.min.js → public\legacy\js\sweetalert2.all.min.js
- `te()` --calls--> `S()`  [INFERRED]
  public\legacy\js\jquery.min.js → public\legacy\js\sweetalert2.all.min.js

## Hyperedges (group relationships)
- **Layered Architecture Components** — readme_layered_architecture, healthengine_js, eventscatalog_js, gamerepository_js [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (34): getIllnessById(), applyStatDelta(), clamp(), cloneState(), generateRandomName(), pushLog(), pushNotification(), canTakeJob() (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (39): $(), A(), Ae(), B(), Be(), c(), $e(), ee() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (51): back(), bebasp(), beliMobil(), beliRumah(), dapatKerja(), ged(), getFemaleFN(), getLN() (+43 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): Le(), ae(), at(), b(), ce(), dn(), k(), le() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (22): A(), Ct(), de(), ee(), It(), j(), jt(), L() (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (16): bt(), dt(), f(), g(), gt(), ht(), mt(), nt() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (5): Home(), CreatePage(), LayeredGameView(), GamePage(), useLayeredGame()

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (14): an(), cn(), d(), emit(), fe(), _getHandlersByEventName(), In(), jn() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (10): e(), et(), gn(), h(), _main(), n(), Wn(), xn() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.21
Nodes (6): a(), b(), c(), e(), n(), x()

### Community 10 - "Community 10"
Cohesion: 0.26
Nodes (12): en(), ft(), hn(), m(), nn(), on(), once(), qt() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.31
Nodes (10): be(), c(), Ge(), i(), Ie(), je(), ke(), pe() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.52
Nodes (1): kn

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (3): createInitialGameState(), loadGameState(), parseSave()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (2): AmpuLife Project, Layered Architecture Pattern

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Migration Plan

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): Legacy Game Entry

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): Agent Rules

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (1): AmpuLife Logo

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (1): Drug Icon

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (1): Docker Infrastructure

## Knowledge Gaps
- **8 isolated node(s):** `AmpuLife Project`, `Migration Plan`, `Layered Architecture Pattern`, `Legacy Game Entry`, `Agent Rules` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 12`** (7 nodes): `kn`, `.constructor()`, `.getTimerLeft()`, `.increase()`, `.isRunning()`, `.start()`, `.stop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `AmpuLife Project`, `Layered Architecture Pattern`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Migration Plan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `Legacy Game Entry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `Agent Rules`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `AmpuLife Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `Drug Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `Docker Infrastructure`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `$()` connect `Community 2` to `Community 10`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `u()` connect `Community 10` to `Community 2`, `Community 3`, `Community 4`, `Community 7`, `Community 9`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `e()` connect `Community 8` to `Community 11`, `Community 1`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `$()` (e.g. with `updateFormTgl()` and `updateDayOptions()`) actually correct?**
  _`$()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AmpuLife Project`, `Migration Plan`, `Layered Architecture Pattern` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._