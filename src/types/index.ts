/**
 * ACUD ITS Traveler Mobile App - TypeScript Interfaces
 */

// ── Geospatial Primitives ─────────────────────────────────────

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LatLngBounds {
  northeast: LatLng;
  southwest: LatLng;
}

// ── Traffic & Intersections ───────────────────────────────────

export type LOSGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type SignalPhase = 'green' | 'yellow' | 'red' | 'flashing';

export interface Intersection {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  los: LOSGrade;
  signalPhase: SignalPhase;
  countdown?: number;
  speedLimit: number;
  avgSpeed: number;
  volume: number;
  occupancy: number;
  updatedAt: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  nameAr: string;
  startPoint: LatLng;
  endPoint: LatLng;
  waypoints: LatLng[];
  los: LOSGrade;
  speedLimit: number;
  avgSpeed: number;
  travelTime: number;
  length: number;
  lanes: number;
  updatedAt: string;
}

// ── Incidents ─────────────────────────────────────────────────

export type IncidentType =
  | 'accident'
  | 'breakdown'
  | 'construction'
  | 'congestion'
  | 'road_closure'
  | 'hazard'
  | 'event'
  | 'other';

export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  location: LatLng;
  affectedRoadSegments: string[];
  startTime: string;
  endTime?: string;
  estimatedClearTime?: string;
  verified: boolean;
  source: string;
  updatedAt: string;
}

// ── DMS Messages ──────────────────────────────────────────────

export type DMSStatus = 'active' | 'inactive' | 'maintenance';

export interface DMSMessage {
  id: string;
  signId: string;
  location: LatLng;
  message: string;
  messageAr: string;
  status: DMSStatus;
  priority: number;
  startTime: string;
  endTime?: string;
  updatedAt: string;
}

// ── Parking ───────────────────────────────────────────────────

export type ParkingType = 'garage' | 'lot' | 'street' | 'underground';

export type ParkingAvailability = 'available' | 'limited' | 'full' | 'unknown';

export interface ParkingFacility {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  type: ParkingType;
  totalSpaces: number;
  availableSpaces: number;
  availability: ParkingAvailability;
  ratePerHour: number;
  currency: string;
  operatingHours: string;
  amenities: string[];
  evChargingSpaces: number;
  disabledSpaces: number;
  distanceFromUser?: number;
  updatedAt: string;
}

export type ParkingSessionStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export interface ParkingSession {
  id: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  vehiclePlateNumber: string;
  startTime: string;
  endTime?: string;
  duration: number;
  cost: number;
  currency: string;
  status: ParkingSessionStatus;
  paymentId?: string;
}

// ── Transit ───────────────────────────────────────────────────

export type TransitMode = 'bus' | 'metro' | 'tram' | 'ferry' | 'cable_car';

export interface TransitRoute {
  id: string;
  name: string;
  nameAr: string;
  shortName: string;
  mode: TransitMode;
  color: string;
  stations: TransitStation[];
  frequency: number;
  operatingHours: string;
  fare: number;
  currency: string;
  isActive: boolean;
  updatedAt: string;
}

export interface TransitStation {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  routeIds: string[];
  amenities: string[];
  isAccessible: boolean;
  nextArrivals: TransitArrival[];
  updatedAt: string;
}

export interface TransitArrival {
  routeId: string;
  routeName: string;
  destination: string;
  estimatedArrival: string;
  delayMinutes: number;
  vehicleId?: string;
}

export interface TransitTicket {
  id: string;
  userId: string;
  routeId: string;
  routeName: string;
  ticketType: 'single' | 'return' | 'day_pass' | 'weekly' | 'monthly';
  validFrom: string;
  validUntil: string;
  price: number;
  currency: string;
  qrCode: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchasedAt: string;
}

// ── Alerts ────────────────────────────────────────────────────

export type AlertCategory =
  | 'traffic'
  | 'transit'
  | 'parking'
  | 'weather'
  | 'incident'
  | 'enforcement'
  | 'emergency'
  | 'general';

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: IncidentSeverity;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  location?: LatLng;
  radius?: number;
  startTime: string;
  endTime?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ── Violations & Enforcement ──────────────────────────────────

export type ViolationStatus = 'pending' | 'paid' | 'disputed' | 'overdue' | 'cancelled';

export interface Violation {
  id: string;
  userId: string;
  vehiclePlateNumber: string;
  type: string;
  typeAr: string;
  description: string;
  descriptionAr: string;
  location: LatLng;
  locationName: string;
  fineAmount: number;
  currency: string;
  status: ViolationStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  evidenceUrls: string[];
}

// ── Trip Planning & Routes ────────────────────────────────────

export type TravelMode = 'driving' | 'transit' | 'walking' | 'cycling' | 'multimodal';

export interface TripPlan {
  id: string;
  origin: LatLng;
  originName: string;
  destination: LatLng;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  routes: Route[];
  preferredMode: TravelMode;
  createdAt: string;
}

export interface Route {
  id: string;
  mode: TravelMode;
  distance: number;
  duration: number;
  durationInTraffic: number;
  polyline: string;
  steps: RouteStep[];
  fare?: number;
  currency?: string;
  carbonEmission: number;
  tolls: number;
}

export type RouteStepManeuver =
  | 'depart'
  | 'arrive'
  | 'turn_left'
  | 'turn_right'
  | 'straight'
  | 'merge'
  | 'exit'
  | 'board'
  | 'alight'
  | 'transfer'
  | 'walk';

export interface RouteStep {
  instruction: string;
  instructionAr: string;
  distance: number;
  duration: number;
  mode: TravelMode;
  maneuver: RouteStepManeuver;
  polyline: string;
  startLocation: LatLng;
  endLocation: LatLng;
  transitDetails?: {
    routeId: string;
    routeName: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    numStops: number;
  };
}

export interface SavedRoute {
  id: string;
  userId: string;
  name: string;
  origin: LatLng;
  originName: string;
  destination: LatLng;
  destinationName: string;
  preferredMode: TravelMode;
  waypoints: LatLng[];
  isFavorite: boolean;
  lastUsed: string;
  createdAt: string;
}

// ── User Profile ──────────────────────────────────────────────

export type UserLanguage = 'en' | 'ar';

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  language: UserLanguage;
  avatarUrl?: string;
  vehiclePlateNumbers: string[];
  preferredTravelMode: TravelMode;
  homeLocation?: LatLng;
  workLocation?: LatLng;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  savedRoutes: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Weather ───────────────────────────────────────────────────

export interface WeatherData {
  location: LatLng;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  conditionAr: string;
  iconCode: string;
  visibility: number;
  uvIndex: number;
  aqi: number;
  forecast: WeatherForecast[];
  updatedAt: string;
}

export interface WeatherForecast {
  date: string;
  temperatureHigh: number;
  temperatureLow: number;
  condition: string;
  conditionAr: string;
  iconCode: string;
  precipitationChance: number;
}

export type WeatherAlertSeverity = 'extreme' | 'severe' | 'moderate' | 'minor';

export interface WeatherAlert {
  id: string;
  type: string;
  typeAr: string;
  severity: WeatherAlertSeverity;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  area: LatLngBounds;
  startTime: string;
  endTime: string;
  issuedAt: string;
}

// ── Micro-mobility ────────────────────────────────────────────

export type BikeScooterVehicleType = 'bike' | 'e_bike' | 'scooter' | 'e_scooter';

export interface BikeScooterStation {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  operator: string;
  totalDocks: number;
  availableVehicles: number;
  availableDocks: number;
  vehicleTypes: BikeScooterVehicleType[];
  ratePerMinute: number;
  currency: string;
  isActive: boolean;
  distanceFromUser?: number;
  updatedAt: string;
}

// ── EV Charging ───────────────────────────────────────────────

export type ChargerType = 'level_1' | 'level_2' | 'dc_fast' | 'tesla_supercharger';

export type ChargerStatus = 'available' | 'in_use' | 'out_of_service' | 'reserved';

export interface EVChargingStation {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  operator: string;
  chargerTypes: ChargerType[];
  totalPorts: number;
  availablePorts: number;
  portStatuses: ChargerStatus[];
  pricePerKwh: number;
  currency: string;
  amenities: string[];
  is24Hours: boolean;
  distanceFromUser?: number;
  updatedAt: string;
}

// ── Loading Zones ─────────────────────────────────────────────

export type LoadingZoneStatus = 'available' | 'occupied' | 'reserved' | 'closed';

export interface LoadingZone {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  status: LoadingZoneStatus;
  maxDurationMinutes: number;
  operatingHours: string;
  vehicleSizeLimit: string;
  requiresPermit: boolean;
  updatedAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────

export interface DashboardSummary {
  activeIncidents: number;
  congestionLevel: LOSGrade;
  averageCitySpeed: number;
  parkingAvailability: number;
  transitOnTime: number;
  activeAlerts: number;
  weatherSummary: string;
  weatherSummaryAr: string;
  airQualityIndex: number;
  lastUpdated: string;
}

// ── SOS / Emergency ───────────────────────────────────────────

export type SOSType = 'accident' | 'medical' | 'fire' | 'security' | 'breakdown' | 'other';

export interface SOSRequest {
  id: string;
  userId: string;
  type: SOSType;
  location: LatLng;
  description: string;
  contactPhone: string;
  mediaUrls: string[];
  timestamp: string;
}

export interface SOSConfirmation {
  requestId: string;
  status: 'received' | 'dispatched' | 'en_route' | 'on_scene' | 'resolved';
  responderType: string;
  estimatedArrival?: string;
  referenceNumber: string;
  instructions: string;
  instructionsAr: string;
  updatedAt: string;
}

// ── Payments ──────────────────────────────────────────────────

export type PaymentMethod = 'credit_card' | 'debit_card' | 'apple_pay' | 'google_pay' | 'wallet';

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface PaymentResult {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  referenceId: string;
  receiptUrl?: string;
  createdAt: string;
}

// ── User Reports ──────────────────────────────────────────────

export type ReportCategory =
  | 'pothole'
  | 'signal_malfunction'
  | 'sign_damage'
  | 'road_hazard'
  | 'illegal_parking'
  | 'streetlight_out'
  | 'flooding'
  | 'other';

export interface ReportSubmission {
  id: string;
  userId: string;
  category: ReportCategory;
  description: string;
  location: LatLng;
  locationName: string;
  mediaUrls: string[];
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  referenceNumber: string;
  submittedAt: string;
  updatedAt: string;
}

// ── Work Zones ────────────────────────────────────────────────

export interface WorkZone {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  location: LatLng;
  boundary: LatLng[];
  affectedRoadSegments: string[];
  startDate: string;
  endDate: string;
  workHours: string;
  speedReduction: number;
  lanesAffected: number;
  detourRoute?: string;
  contactInfo: string;
  updatedAt: string;
}

// ── Low Emissions Zone ────────────────────────────────────────

export interface LowEmissionsZone {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  boundary: LatLng[];
  restrictedVehicleTypes: string[];
  exemptions: string[];
  enforcementHours: string;
  fineAmount: number;
  currency: string;
  effectiveDate: string;
  isActive: boolean;
  updatedAt: string;
}

// ── Evacuation ────────────────────────────────────────────────

export type EvacuationUrgency = 'immediate' | 'urgent' | 'advisory';

export interface EvacuationPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  urgency: EvacuationUrgency;
  affectedArea: LatLng[];
  evacuationRoutes: EvacuationRoute[];
  shelters: EvacuationShelter[];
  issuedAt: string;
  expiresAt?: string;
  contactInfo: string;
  updatedAt: string;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  nameAr: string;
  polyline: string;
  destination: string;
  destinationAr: string;
  estimatedTravelTime: number;
  capacity: string;
}

export interface EvacuationShelter {
  id: string;
  name: string;
  nameAr: string;
  location: LatLng;
  capacity: number;
  currentOccupancy: number;
  amenities: string[];
  contactPhone: string;
}
