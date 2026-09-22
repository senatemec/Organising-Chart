/**
 * Normalizes a society / club name or ID for consistent, robust comparison
 * e.g. "Excel MEC" -> "excel", "Union Senate" -> "union", "IEDC MEC" -> "iedc"
 */
export function normalizeSocietyKey(str) {
  if (!str) return '';
  const lower = str.toLowerCase().trim();
  
  // Union / Senate aliases
  if (lower.includes('union') || lower.includes('senate')) {
    return 'union';
  }

  // Remove common words / suffixes
  const stripped = lower
    .replace(/\b(mec|student|branch|chapter|cell|club|community|official|college)\b/gi, '')
    .replace(/mec$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (stripped.length > 0) {
    return stripped;
  }
  return lower.replace(/[^a-z0-9]/g, '');
}

/**
 * Checks whether the logged-in user is the authorized representative for a given club.
 * Strictly verifies ownership by email, normalized society, allowedUsers whitelist, or Union admin role.
 */
export function isRespectiveClubUser(currentUser, club, allowedUsers = []) {
  if (!currentUser || !club) return false;

  const userEmail = (currentUser.email || '').toLowerCase().trim();
  const userSociety = (currentUser.society || '').toLowerCase().trim();
  const clubEmail = (club.email || '').toLowerCase().trim();
  const clubSociety = (club.society || '').toLowerCase().trim();
  const clubId = (club.id || '').toLowerCase().trim();
  const clubName = (club.name || '').toLowerCase().trim();

  // 1. Direct email match (if club has contact email)
  if (userEmail && clubEmail && userEmail === clubEmail) {
    return true;
  }

  // 2. Direct society / id match
  if (userSociety && clubSociety && userSociety === clubSociety) {
    return true;
  }
  if (userSociety && clubId && (userSociety === clubId || userSociety.replace(/[^a-z0-9]+/g, '-') === clubId)) {
    return true;
  }

  // 3. Normalized key match
  const normUser = normalizeSocietyKey(userSociety);
  const normClub = normalizeSocietyKey(clubSociety);
  const normClubId = normalizeSocietyKey(clubId);
  const normClubName = normalizeSocietyKey(clubName);

  if (normUser && (normUser === normClub || normUser === normClubId || normUser === normClubName)) {
    return true;
  }

  // 4. Match via allowedUsers whitelist mapping
  if (Array.isArray(allowedUsers) && userEmail) {
    const allowedEntry = allowedUsers.find(u => (u.email || '').toLowerCase().trim() === userEmail);
    if (allowedEntry && allowedEntry.society) {
      const allowedSoc = (allowedEntry.society || '').toLowerCase().trim();
      if (allowedSoc === clubSociety || allowedSoc === clubId) {
        return true;
      }
      const normAllowedSociety = normalizeSocietyKey(allowedEntry.society);
      if (normAllowedSociety && (normAllowedSociety === normClub || normAllowedSociety === normClubId || normAllowedSociety === normClubName)) {
        return true;
      }
    }
  }

  // 5. Union Senate special access: Senate / Union Chairman can edit Union profile
  const isUnionUser = Boolean(
    currentUser.isUnionAdmin ||
    normUser === 'union' ||
    userEmail === 'senatemec@mec.ac.in' ||
    userEmail === 'senate@mec.ac.in' ||
    userEmail === 'union@mec.ac.in' ||
    userEmail === 'mohammedshaddaad.mec@gmail.com' ||
    userEmail.startsWith('chairman_senate') ||
    userEmail.startsWith('general_secretary')
  );
  const isUnionClub = Boolean(normClub === 'union' || normClubId === 'union' || clubId === 'union');
  if (isUnionUser && isUnionClub) {
    return true;
  }

  return false;
}

/**
 * Finds the club belonging to the current user from the list of clubs
 */
export function findRespectiveClub(currentUser, clubs = [], allowedUsers = []) {
  if (!currentUser || !Array.isArray(clubs) || clubs.length === 0) return null;
  return clubs.find(club => isRespectiveClubUser(currentUser, club, allowedUsers)) || null;
}
