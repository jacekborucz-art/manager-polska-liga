import React from 'react';
import { Club } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';

type ClubTeamMarkProps = {
  club?: Pick<Club, 'id' | 'name' | 'colorsHex'> | null;
  className: string;
  fallbackClassName: string;
  fallbackMode?: 'split' | 'solid';
};

export const ClubTeamMark: React.FC<ClubTeamMarkProps> = ({
  club,
  className,
  fallbackClassName,
  fallbackMode = 'split',
}) => {
  const logo = club ? getClubLogo(club.id) : undefined;
  const logoClassName = className
    .replace(/\bbg-\S+/g, '')
    .replace(/\bborder(?:-\S+)?/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (logo && club) {
    return (
      <img
        src={logo}
        alt={club.name}
        className={`${logoClassName} object-contain shrink-0 drop-shadow-lg`}
      />
    );
  }

  const primary = club?.colorsHex?.[0] ?? '#555';
  const secondary = club?.colorsHex?.[1] ?? primary;

  if (fallbackMode === 'solid') {
    return (
      <div
        className={fallbackClassName}
        style={{ backgroundColor: primary }}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      <div className="flex-1" style={{ backgroundColor: primary }} />
      <div className="flex-1" style={{ backgroundColor: secondary }} />
    </div>
  );
};
