# Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| CSP still permissive (unsafe-inline) | Medium | Nonce/hash CSP in follow-up |
| In-memory rate limits not multi-instance | Medium | Shared store at edge |
| Duplicate search stacks | Low | Prefer src/search; consolidate later |
| Seed tools without logic handlers | Medium | Register logic before marketing launch |
| Full CI not proven in offline sandbox | Medium | Run READINESS_FULL on CI runners |
| Legal page content missing | Low | Add privacy/terms content routes |
| Provider JS weight | Low | Keep experimental flags off in prod |

Overall launch risk: **Moderate → Acceptable** after checklist completion.
