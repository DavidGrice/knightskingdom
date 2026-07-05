import Page2 from './page_2.png';
import Page4 from './page_4.png';
import Knight2 from './knight_2.png';
import Knight4 from './knight_4.png';
import Baronet2 from './baronet_2.png';
import Baronet4 from './baronet_4.png';
import { AUTH_HD_BASE, hiDpiImgProps } from '../../Common/hiDpiAsset';

const hd = (file) => `${AUTH_HD_BASE}/${file}`;

/** Rank row sprites — 1× bundled; 2× from public/auth-hd/ when present locally */
export const AUTH_RANK_SPRITES = {
  page: {
    idle: hiDpiImgProps(Page2, hd('page_2.png')),
    active: hiDpiImgProps(Page4, hd('page_4.png')),
  },
  knight: {
    idle: hiDpiImgProps(Knight2, hd('knight_2.png')),
    active: hiDpiImgProps(Knight4, hd('knight_4.png')),
  },
  baronet: {
    idle: hiDpiImgProps(Baronet2, hd('baronet_2.png')),
    active: hiDpiImgProps(Baronet4, hd('baronet_4.png')),
  },
};

export const getAuthRankSprite = (level, isSelected) => {
  const rank = AUTH_RANK_SPRITES[level] ?? AUTH_RANK_SPRITES.page;
  return isSelected ? rank.active : rank.idle;
};