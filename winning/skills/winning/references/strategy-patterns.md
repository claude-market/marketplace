# Strategy Patterns

Deterministic pattern selection and decomposition templates. Every recommendation is a rule, not a suggestion.

## Pattern Selection Decision Tree

Match top-to-bottom. First match wins.

```
IF task mentions "test", "coverage", "spec", "validation"
  THEN -> Testing Split (3-5 rounds)

IF task mentions "API", "endpoint", "REST", "GraphQL", "route", "handler"
  THEN -> API Development Split (5-8 rounds)

IF task mentions "pipeline", "ETL", "ingest", "transform", "data flow", "stream"
  THEN -> Data Pipeline Split (4-7 rounds)

IF task mentions "migrate", "upgrade", "port", "convert", "move from X to Y"
  THEN -> Migration Split (5-8 rounds)

IF task mentions "fix", "bug", "broken", "error", "failing", "500", "crash"
  IF root cause location is known
    THEN -> Fix Approach Split (2-4 rounds)
  ELSE
    THEN -> Diagnosis Split (3-6 rounds)

IF task mentions "slow", "optimize", "performance", "speed", "latency", "memory"
  THEN -> Dimension Split (4-7 rounds)

IF task mentions "refactor", "restructure", "clean up", "extract", "decouple"
  IF test coverage exists (>60%)
    THEN -> Scope Split (4-6 rounds)
  ELSE
    THEN -> Scope Split with test-first Strategy A (5-8 rounds)

IF task mentions "design", "UI", "UX", "page", "component", "layout", "content"
  THEN -> Perspective Split (3-5 rounds)

IF task mentions "build", "create", "implement", "add feature"
  IF modifying existing codebase with established patterns
    THEN -> Methodology Split (4-7 rounds)
  ELSE (greenfield / new module)
    THEN -> Architecture Split (5-8 rounds)

ELSE -> Methodology Split (safest default, 4-7 rounds)
```

## Patterns

### Testing Split
When: task is primarily about adding/improving tests or coverage.
When NOT: task is about fixing a specific bug (use Diagnosis/Fix Approach instead).
Expected rounds: 3-5.

- **A -- Coverage-gap**: Analyze uncovered code paths, write tests for highest-risk gaps first
- **B -- Behavior-driven**: Write tests from user-story acceptance criteria, outside-in
- **C -- Mutation-based**: Run mutation testing to find weak assertions, harden test suite

### API Development Split
When: building new endpoints or overhauling existing API surface.
When NOT: task is only about API performance (use Dimension Split).
Expected rounds: 5-8.

- **A -- Contract-first**: Define OpenAPI/GraphQL schema, generate stubs, implement handlers against contract
- **B -- Vertical-slice**: Build one complete endpoint (handler + validation + persistence + tests) at a time
- **C -- Inside-out**: Build data layer first, then service layer, then handlers last

### Data Pipeline Split
When: building ETL, streaming, or data transformation workflows.
When NOT: task is about optimizing existing query performance (use Dimension Split).
Expected rounds: 4-7.

- **A -- Schema-driven**: Define input/output schemas and transformations declaratively, then implement
- **B -- Sample-first**: Process one real record end-to-end, then generalize and scale
- **C -- Checkpoint-based**: Build pipeline with idempotent stages and checkpoint/resume at each boundary

### Migration Split
When: moving between frameworks, languages, database versions, or API versions.
When NOT: task is a refactor within the same technology (use Scope Split).
Expected rounds: 5-8.

- **A -- Parallel-run**: New system alongside old, compare outputs, swap when matching
- **B -- Incremental-cutover**: Migrate one component/table/endpoint at a time behind feature flags
- **C -- Snapshot-rewrite**: Export current state, rewrite in target, validate against snapshot

### Diagnosis Split
When: bug exists, root cause location unknown.
When NOT: you already know which function/module is broken (use Fix Approach Split).
Expected rounds: 3-6.

- **A -- Top-down**: Start from error symptoms, trace through call stack toward root cause
- **B -- Bottom-up**: Start from data layer, verify each layer upward until failure found
- **C -- Bisect**: Binary search through recent changes to isolate breaking commit

### Fix Approach Split
When: broken component identified, deciding how to fix.
When NOT: root cause still unclear (use Diagnosis Split).
Expected rounds: 2-4.

- **A -- Minimal-patch**: Smallest change that fixes the symptom with regression test
- **B -- Root-cause**: Trace to fundamental issue, fix underlying problem
- **C -- Rewrite**: Replace buggy component entirely with cleaner implementation

### Dimension Split
When: measurable performance problem -- latency, throughput, memory, CPU.
When NOT: perceived slowness without measurements (add instrumentation first).
Expected rounds: 4-7.

- **A -- Algorithmic**: Better data structures, reduced complexity, eliminated redundant work
- **B -- Caching**: Memoization, precomputation, result caching at appropriate layer
- **C -- Parallelism**: Concurrent execution, batch processing, async I/O, connection pooling

### Scope Split
When: restructuring existing code while maintaining behavior.
When NOT: changing behavior (that is a feature task -- use Methodology Split).
Expected rounds: 4-6 (with tests), 5-8 (without tests).

- **A -- Incremental**: Small safe refactors one at a time, tests green after each step
- **B -- Extract-and-replace**: Build new implementation alongside old, swap atomically
- **C -- Strangler-fig**: Route new calls to new code, gradually migrate old callers

### Perspective Split
When: UI, UX, content, or design tasks with subjective quality criteria.
When NOT: purely technical frontend work (use Methodology Split).
Expected rounds: 3-5.

- **A -- User-first**: Optimize for end-user experience, clarity, accessibility
- **B -- System-first**: Optimize for component reuse, maintainability, design-system alignment
- **C -- Performance-first**: Optimize for render speed, bundle size, interaction latency

### Methodology Split
When: adding features to existing codebase. Default when no other pattern matches.
When NOT: greenfield projects (use Architecture Split).
Expected rounds: 4-7.

- **A -- TDD-first**: Write comprehensive tests, then implement to satisfy them
- **B -- Prototype-first**: Build working prototype fast, then add tests and refine
- **C -- Spec-first**: Define interfaces/types/schemas, then implement against contracts

### Architecture Split
When: greenfield projects or new modules where structure is undecided.
When NOT: existing codebase with established architecture (use Methodology Split).
Expected rounds: 5-8.

- **A -- Monolithic**: Single module, direct implementation, optimize structure later
- **B -- Modular**: Decompose into focused modules with explicit interfaces from the start
- **C -- Event-driven**: Build around events/messages for loose coupling

## Selection Principles

1. **First match wins** -- traverse decision tree top-to-bottom, stop at first match
2. **Genuine diversity** -- strategies must differ in approach, not minor details
3. **Independent execution** -- no strategy depends on another's output
4. **Early signal** -- design so failures surface by round 2, not at the end
