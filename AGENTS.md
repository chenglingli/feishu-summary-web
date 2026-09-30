# Repository instructions

- Read README.md and the sibling server repository's docs/IMPLEMENTATION_STATUS.md.
- Never put Feishu or model secrets in VITE variables, source files or test fixtures.
- Generate API types from contracts/openapi.json; keep aliases in src/api/types.ts.
- Treat router guards as UX only. The backend must enforce user and administrator scope.
- Run npm test, npm run build and relevant browser flows after changes.
- Keep necessary comments around session, CSRF and polling behavior.
- Every commit needs a descriptive subject and body stating changes and validation.
