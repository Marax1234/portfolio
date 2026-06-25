import * as migration_20260619_171143_initial from './20260619_171143_initial';
import * as migration_20260624_164913_site_config_hero_carousel from './20260624_164913_site_config_hero_carousel';
import * as migration_20260625_120000_about_backstage_caption from './20260625_120000_about_backstage_caption';

export const migrations = [
  {
    up: migration_20260619_171143_initial.up,
    down: migration_20260619_171143_initial.down,
    name: '20260619_171143_initial',
  },
  {
    up: migration_20260624_164913_site_config_hero_carousel.up,
    down: migration_20260624_164913_site_config_hero_carousel.down,
    name: '20260624_164913_site_config_hero_carousel'
  },
  {
    up: migration_20260625_120000_about_backstage_caption.up,
    down: migration_20260625_120000_about_backstage_caption.down,
    name: '20260625_120000_about_backstage_caption'
  },
];
