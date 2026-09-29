import * as migration_20260619_171143_initial from './20260619_171143_initial';
import * as migration_20260624_164913_site_config_hero_carousel from './20260624_164913_site_config_hero_carousel';
import * as migration_20260625_120000_about_backstage_caption from './20260625_120000_about_backstage_caption';
import * as migration_20260722_140146_media_allow_low_resolution from './20260722_140146_media_allow_low_resolution';
import * as migration_20260929_092031_payload_3_90 from './20260929_092031_payload_3_90';

export const migrations = [
  {
    up: migration_20260619_171143_initial.up,
    down: migration_20260619_171143_initial.down,
    name: '20260619_171143_initial',
  },
  {
    up: migration_20260624_164913_site_config_hero_carousel.up,
    down: migration_20260624_164913_site_config_hero_carousel.down,
    name: '20260624_164913_site_config_hero_carousel',
  },
  {
    up: migration_20260625_120000_about_backstage_caption.up,
    down: migration_20260625_120000_about_backstage_caption.down,
    name: '20260625_120000_about_backstage_caption',
  },
  {
    up: migration_20260722_140146_media_allow_low_resolution.up,
    down: migration_20260722_140146_media_allow_low_resolution.down,
    name: '20260722_140146_media_allow_low_resolution',
  },
  {
    up: migration_20260929_092031_payload_3_90.up,
    down: migration_20260929_092031_payload_3_90.down,
    name: '20260929_092031_payload_3_90'
  },
];
