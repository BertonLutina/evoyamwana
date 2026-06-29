import type { TeacherDto } from '@evoyamwana/shared';
import { getTeacherAvatarUrl, getTeacherDisplayName } from '../utils/teacherProfile';

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
} as const;

type TeacherAvatarProps = {
  teacher?: Pick<TeacherDto, 'photoUrl' | 'firstName' | 'lastName'> | null;
  size?: keyof typeof sizeClasses;
  className?: string;
  photoUrl?: string | null;
};

export const TeacherAvatar = ({ teacher, size = 'lg', className = '', photoUrl }: TeacherAvatarProps) => {
  const profile = teacher
    ? { ...teacher, photoUrl: photoUrl ?? teacher.photoUrl }
    : { firstName: 'E', lastName: 'V', photoUrl: photoUrl ?? null };

  return (
    <img
      src={getTeacherAvatarUrl(profile)}
      alt={`Avatar de ${getTeacherDisplayName(profile)}`}
      className={`shrink-0 rounded-xl object-cover ring-2 ring-ocean/15 ${sizeClasses[size]} ${className}`}
    />
  );
};
