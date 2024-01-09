import { User } from 'firebase/auth';
import { getFirstString } from './get-first-string';
import { titleString } from './title-string';

export function getUserName(user: User | UserType) {
  return titleString(
    getFirstString(user.displayName) ||
      getFirstString(user.email, '@') ||
      'User'
  );
}
