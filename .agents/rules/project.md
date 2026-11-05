# Always-on project rules
1. Before ANY task, read PROJECT_BRIEF.md and PROGRESS.md.
2. Do ONLY the current step I give you. Do not build later steps. Do not add features listed under NON-GOALS.
3. Use only the stack in PROJECT_BRIEF.md. If you believe a new dependency is needed, stop and ask first, with the reason.
4. Security: parameterised SQL only, zod validation on all input, every /admin route behind auth middleware, never log secrets or passwords, never commit .env.
5. Never run destructive commands (rm -rf, DROP DATABASE, git reset --hard, force push) without asking me first.
6. Do NOT run git commit/push. I commit manually after verifying.
7. When finished: run lint and tests, update PROGRESS.md, then give me a short numbered list of how to verify the work myself.
8. Keep code simple and commented where the logic is non-obvious. Prefer small files and reusable partials/helpers over duplication.
9. Mobile-first and accessible by default.
