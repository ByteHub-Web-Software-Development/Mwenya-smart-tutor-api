# Chat test fixes

- [ ] Update `src/chat/chat.service.spec.ts` to include `ConfigModule.forRoot({ isGlobal: true })` or provide a mock `ConfigService`.
- [ ] Update `src/chat/chat.controller.spec.ts` to include `ThrottlerModule.forRoot({ ttl: <n>, limit: <n> })` and/or import `ConfigModule`.
- [ ] Re-run `npm test` to confirm all suites pass.

