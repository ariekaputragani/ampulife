# Graph Report - .  (2026-05-01)

## Corpus Check
- Corpus is ~43,603 words - fits in a single context window. You may not need a graph.

## Summary
- 345 nodes · 859 edges · 20 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 91 edges (avg confidence: 0.8)
- Token cost: 1,500 input · 800 output

## Community Hubs (Navigation)
- [[_COMMUNITY_jQuery Core Utilities|jQuery Core Utilities]]
- [[_COMMUNITY_Legacy Game Logic|Legacy Game Logic]]
- [[_COMMUNITY_Modern Layered Services|Modern Layered Services]]
- [[_COMMUNITY_SweetAlert UI Handlers|SweetAlert UI Handlers]]
- [[_COMMUNITY_SweetAlert Utilities A|SweetAlert Utilities A]]
- [[_COMMUNITY_SweetAlert Utilities B|SweetAlert Utilities B]]
- [[_COMMUNITY_Next.js Presentation|Next.js Presentation]]
- [[_COMMUNITY_SweetAlert Lifecycle|SweetAlert Lifecycle]]
- [[_COMMUNITY_SweetAlert Animation|SweetAlert Animation]]
- [[_COMMUNITY_Select2 Integration|Select2 Integration]]
- [[_COMMUNITY_SweetAlert Event Bus|SweetAlert Event Bus]]
- [[_COMMUNITY_SweetAlert Timer|SweetAlert Timer]]
- [[_COMMUNITY_State & Persistence|State & Persistence]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Migration Strategy|Migration Strategy]]
- [[_COMMUNITY_Legacy Entry Point|Legacy Entry Point]]
- [[_COMMUNITY_Workspace Rules|Workspace Rules]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_Game Icons|Game Icons]]
- [[_COMMUNITY_Docker Infrastructure|Docker Infrastructure]]

## God Nodes (most connected - your core abstractions)
1. `update()` - 25 edges
2. `z()` - 24 edges
3. `c()` - 23 edges
4. `w()` - 23 edges
5. `$()` - 23 edges
6. `updatea()` - 17 edges
7. `pushLog()` - 17 edges
8. `qe()` - 16 edges
9. `bt()` - 16 edges
10. `t()` - 15 edges

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

### Community 0 - "jQuery Core Utilities"
Cohesion: 0.09
Nodes (39): $(), A(), Ae(), B(), Be(), c(), $e(), ee() (+31 more)

### Community 1 - "Legacy Game Logic"
Cohesion: 0.11
Nodes (51): back(), bebasp(), beliMobil(), beliRumah(), dapatKerja(), ged(), getFemaleFN(), getLN() (+43 more)

### Community 2 - "Modern Layered Services"
Cohesion: 0.07
Nodes (33): getIllnessById(), applyStatDelta(), clamp(), cloneState(), generateRandomName(), pushLog(), pushNotification(), canTakeJob() (+25 more)

### Community 3 - "SweetAlert UI Handlers"
Cohesion: 0.12
Nodes (23): an(), at(), cn(), dn(), emit(), en(), fe(), _getHandlersByEventName() (+15 more)

### Community 4 - "SweetAlert Utilities A"
Cohesion: 0.26
Nodes (23): A(), Ct(), de(), ee(), It(), j(), jt(), L() (+15 more)

### Community 5 - "SweetAlert Utilities B"
Cohesion: 0.13
Nodes (22): bt(), d(), dt(), f(), ft(), g(), gt(), ht() (+14 more)

### Community 6 - "Next.js Presentation"
Cohesion: 0.12
Nodes (5): Home(), CreatePage(), LayeredGameView(), GamePage(), useLayeredGame()

### Community 7 - "SweetAlert Lifecycle"
Cohesion: 0.19
Nodes (11): e(), gn(), h(), jn(), _main(), oe(), ut(), vn() (+3 more)

### Community 8 - "SweetAlert Animation"
Cohesion: 0.19
Nodes (14): Le(), ae(), b(), ce(), et(), Ge(), i(), k() (+6 more)

### Community 9 - "Select2 Integration"
Cohesion: 0.21
Nodes (6): a(), b(), c(), e(), n(), x()

### Community 10 - "SweetAlert Event Bus"
Cohesion: 0.43
Nodes (7): be(), c(), Ie(), je(), pe(), R(), ve()

### Community 11 - "SweetAlert Timer"
Cohesion: 0.52
Nodes (1): kn

### Community 13 - "State & Persistence"
Cohesion: 0.33
Nodes (3): createInitialGameState(), loadGameState(), parseSave()

### Community 16 - "Project Documentation"
Cohesion: 1.0
Nodes (2): AmpuLife Project, Layered Architecture Pattern

### Community 25 - "Migration Strategy"
Cohesion: 1.0
Nodes (1): Migration Plan

### Community 26 - "Legacy Entry Point"
Cohesion: 1.0
Nodes (1): Legacy Game Entry

### Community 27 - "Workspace Rules"
Cohesion: 1.0
Nodes (1): Agent Rules

### Community 28 - "Brand Assets"
Cohesion: 1.0
Nodes (1): AmpuLife Logo

### Community 29 - "Game Icons"
Cohesion: 1.0
Nodes (1): Drug Icon

### Community 30 - "Docker Infrastructure"
Cohesion: 1.0
Nodes (1): Docker Infrastructure

## Knowledge Gaps
- **8 isolated node(s):** `AmpuLife Project`, `Migration Plan`, `Layered Architecture Pattern`, `Legacy Game Entry`, `Agent Rules` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `SweetAlert Timer`** (7 nodes): `kn`, `.constructor()`, `.getTimerLeft()`, `.increase()`, `.isRunning()`, `.start()`, `.stop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Documentation`** (2 nodes): `AmpuLife Project`, `Layered Architecture Pattern`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Migration Strategy`** (1 nodes): `Migration Plan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Legacy Entry Point`** (1 nodes): `Legacy Game Entry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Workspace Rules`** (1 nodes): `Agent Rules`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Brand Assets`** (1 nodes): `AmpuLife Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Icons`** (1 nodes): `Drug Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Docker Infrastructure`** (1 nodes): `Docker Infrastructure`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `$()` connect `Legacy Game Logic` to `SweetAlert UI Handlers`, `SweetAlert Utilities A`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `u()` connect `SweetAlert UI Handlers` to `Legacy Game Logic`, `SweetAlert Utilities A`, `SweetAlert Utilities B`, `SweetAlert Animation`, `Select2 Integration`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `e()` connect `SweetAlert Lifecycle` to `jQuery Core Utilities`, `SweetAlert UI Handlers`, `SweetAlert Utilities A`, `SweetAlert Animation`, `SweetAlert Event Bus`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `$()` (e.g. with `updateFormTgl()` and `updateDayOptions()`) actually correct?**
  _`$()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AmpuLife Project`, `Migration Plan`, `Layered Architecture Pattern` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `jQuery Core Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Legacy Game Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._