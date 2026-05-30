## Contributing to Dealership (Surya)

Thanks for contributing! This document explains how to set up your environment, branch and PR conventions, testing, and code quality expectations.

1. Getting started
------------------

- Fork the repository and create a topic branch from `main` or `develop`.
- Use descriptive branch names: `feature/<short-description>`, `fix/<issue-number>-<short-desc>`, `chore/<desc>`.

2. Development workflow
-----------------------

- Commit messages should be clear and reference issue numbers when applicable. Example: `feat: add product bulk import (#42)`.
- Make small, focused pull requests with a clear description of the change and testing instructions.

3. Running the project locally
-----------------------------

Backend (Node + Prisma):

```bash
cd backend-node
npm install
# create .env with DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma db push
node src/index.js
```

Frontend (Vite + React):

```bash
cd frontend
npm install
npm run dev
```

4. Tests & linting
------------------

- Run tests (if present): `npm test --if-present` in the relevant package folder.
- Run linter (if present): `npm run lint --if-present`.

5. Pull request checklist
------------------------

- [ ] Branch builds successfully in CI
- [ ] Linting passes
- [ ] Tests pass (unit/integration)
- [ ] Changes documented in `README.md` or relevant docs
- [ ] No sensitive data in commits

6. Coding standards
-------------------

- Keep functions small and focused.
- Use descriptive variable and function names.
- Avoid committing secrets or `.env` files.

7. Reporting issues
-------------------

- Open an issue with steps to reproduce, expected behavior, and logs or screenshots when applicable.

8. License and Code of Conduct
-----------------------------

- This project follows the MIT license (add `LICENSE` file at root).
- Consider adding a `CODE_OF_CONDUCT.md` if this is a public project.

Thank you for contributing!
