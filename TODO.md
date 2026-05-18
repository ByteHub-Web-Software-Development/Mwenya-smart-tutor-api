# TODO (BlackboxAI)

- [ ] Fix failing unit test: `src/chat/chat.service.spec.ts`
  - Add ConfigModule (or provide ConfigService mock) to TestingModule.

- [ ] Fix failing unit test: `src/chat/chat.controller.spec.ts`
  - Provide Throttler module/options (import `ThrottlerModule.forRoot()` with test config) so `ThrottlerGuard` DI works.

- [ ] Re-run `npm test` to ensure all suites pass.

