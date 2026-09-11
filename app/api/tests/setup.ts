// Vitest setup: runs before every test file is imported.
// api/lib/jwt.ts derives its signing secret from process.env.JWT_SECRET at
// module load time, and api/boot.ts imports it transitively. Pin a stable
// test secret so those modules can be imported without a real .env file.
process.env.JWT_SECRET ??= "test-only-jwt-secret-for-api-regression-tests";