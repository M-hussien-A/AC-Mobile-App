import i18n from '../i18n';

export function getLocalizedField<T extends Record<string, any>>(
  item: T,
  field: string
): string {
  const lang = i18n.language;
  if (lang === 'ar' && item[`${field}Ar`]) {
    return item[`${field}Ar`];
  }
  return item[field] || '';
}

export function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const t = i18n.t;

  if (diffMin < 1) return t('common.justNow');
  if (diffMin < 60) return t('common.minutesAgo', { count: diffMin });
  if (diffHr < 24) return t('common.hoursAgo', { count: diffHr });
  return t('common.daysAgo', { count: diffDay });
}

export function formatCountdown(isoDate: string): string {
  const now = new Date();
  const target = new Date(isoDate);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return i18n.t('common.arrived');
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} ${i18n.t('units.min')}`;
  const hr = Math.floor(diffMin / 60);
  const min = diffMin % 60;
  return `${hr}${i18n.t('units.hours')} ${min}${i18n.t('units.min')}`;
}

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const prefix = amount < 0 ? '-' : '';
  return `${prefix}${formatted} ${i18n.t('units.egp')}`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} ${i18n.t('units.meters')}`;
  }
  return `${km.toFixed(1)} ${i18n.t('units.km')}`;
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} ${i18n.t('units.kmh')}`;
}

export function getLOSColor(los: string): string {
  switch (los) {
    case 'A':
    case 'B':
      return '#22C55E';
    case 'C':
      return '#EAB308';
    case 'D':
    case 'E':
      return '#EF4444';
    case 'F':
      return '#1F2937';
    default:
      return '#9CA3AF';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#DC2626';
    case 'major':
    case 'warning':
      return '#F59E0B';
    case 'minor':
    case 'info':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
}

export function getParkingAvailabilityColor(available: number, total: number): string {
  if (total === 0) return '#9CA3AF';
  const ratio = available / total;
  if (ratio > 0.5) return '#22C55E';
  if (ratio > 0.2) return '#EAB308';
  if (ratio > 0) return '#EF4444';
  return '#9CA3AF';
}

export function getIncidentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    accident: 'car-crash',
    stoppedVehicle: 'car-off',
    debris: 'alert-octagon',
    wrongWay: 'swap-horizontal',
    pedestrian: 'walk',
    congestion: 'car-multiple',
    roadWork: 'hard-hat',
    other: 'alert-circle',
  };
  return icons[type] || 'alert-circle';
}

export function getViolationTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    redLight: 'traffic-light',
    speed: 'speedometer',
    wrongDirection: 'swap-horizontal',
    laneViolation: 'road-variant',
    illegalParking: 'car-brake-parking',
  };
  return icons[type] || 'alert-octagon';
}
