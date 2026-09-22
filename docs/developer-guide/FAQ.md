# FAQ

**Q: Do I need a new route file per tool?**  
A: No — use configuration + dynamic [slug] tool page.

**Q: Where do I put business logic?**  
A: tool-engine/logic modules or data-engine transformers.

**Q: How are secrets handled?**  
A: SecretManager interface only; never commit secrets; browser only sees NEXT_PUBLIC_*.
