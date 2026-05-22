/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Valid types per ci-cd-pwa.md §6
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'chore', 'test', 'docs', 'perf', 'ci', 'build', 'style'],
    ],
    // Keep header readable — 100 chars matches Prettier printWidth
    'header-max-length': [2, 'always', 100],
  },
}
