import { defineConfig } from 'vitest/config'

const now = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const sessionTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
process.env.TEST_LOG_SESSION = process.env.TEST_LOG_SESSION || sessionTimestamp

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['server/**/*.test.ts'],
          exclude: ['**/*.integration.test.ts', 'tests/integration/**'],
          environment: 'node',
          globals: true
        }
      },
      {
        test: {
          name: 'integration',
          include: [
            'server/**/*.integration.test.ts',
            'tests/integration/**/*.test.ts'
          ],
          setupFiles: ['./tests/integration/vitest.setup.ts'],
          environment: 'node',
          globals: true,
          fileParallelism: false
        }
      }
    ]
  }
})