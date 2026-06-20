import * as migration_20260619_171143_initial from './20260619_171143_initial';

export const migrations = [
  {
    up: migration_20260619_171143_initial.up,
    down: migration_20260619_171143_initial.down,
    name: '20260619_171143_initial'
  },
];
