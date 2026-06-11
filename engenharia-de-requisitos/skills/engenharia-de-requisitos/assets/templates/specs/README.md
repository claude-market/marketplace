<!-- GENERIC TEMPLATE — adapt to your project. Only present when the project uses SDD. -->
# Specs — Spec-Driven Development (o "COMO")

> Cada feature não-trivial ganha um folder `<feature-slug>/` com o **contrato de design** que a
> implementação deve satisfazer. Design primeiro, código depois. O **porquê** vive em `../requirements/`;
> o **quê/quando** em `../backlog/`.

## Estrutura por feature

```
specs/<feature-slug>/
├── DESIGN.md            contrato de design (arquitetura, modelo de dados, camadas)
├── BACKLOG.md           quebra de tasks local (espelha backlog/features/F-NN)
├── TEST-STRATEGY.md     como a feature é testada
├── SECURITY-REVIEW.md   threat model + mitigações
└── adrs/                ADRs TIER 2 desta feature (INDEX.md + tracker.md + ADR-NNN)
```

## Index de specs

| Feature | Spec | Status |
| --- | --- | --- |
| <nome> | [<slug>](./<slug>/DESIGN.md) | 📝 |

Use `_feature-template/` como ponto de partida (`cp -r _feature-template <slug>`).
