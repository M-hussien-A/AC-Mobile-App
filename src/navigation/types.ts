export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  TrafficMap: undefined;
  IncidentDetail: { incidentId: string };
  DMSMessageList: undefined;
  RoadWorkDetail: { workZoneId: string };
};

export type JourneyStackParamList = {
  JourneyPlanner: { destinationLat?: number; destinationLng?: number; destinationName?: string } | undefined;
  RouteResults: { planId: string };
  Navigation: { routeId: string };
  SavedRoutes: undefined;
  TripHistory: undefined;
};

export type ParkingStackParamList = {
  ParkingMap: undefined;
  ParkingDetail: { facilityId: string };
  ParkingReservation: { facilityId: string };
  ParkingPayment: { reservationId: string; amount: number };
  ParkingSession: { sessionId: string };
};

export type TransitStackParamList = {
  TransitRoutes: undefined;
  TransitSchedule: { routeId: string };
  TransitAlerts: undefined;
  TransitFarePayment: { routeId?: string };
};

export type SharedMobilityStackParamList = {
  BikeScooterMap: undefined;
  RideHailing: undefined;
  EVChargingMap: undefined;
};

export type ServicesStackParamList = {
  ServicesHub: undefined;
  ParkingMap: undefined;
  ParkingDetail: { facilityId: string };
  ParkingReservation: { facilityId: string };
  ParkingPayment: { reservationId: string; amount: number };
  ParkingSession: { sessionId: string };
  TransitRoutes: undefined;
  TransitSchedule: { routeId: string };
  TransitAlerts: undefined;
  TransitFarePayment: { routeId?: string };
  BikeScooterMap: undefined;
  RideHailing: undefined;
  EVChargingMap: undefined;
  LoadingZone: undefined;
  PointsOfInterest: undefined;
  LEZInfo: undefined;
  NMTRoutePlanning: undefined;
};

export type AlertsStackParamList = {
  AlertsList: { category?: string } | undefined;
  AlertDetail: { alertId: string };
  EmergencySOS: undefined;
  EvacuationRoute: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Wallet: undefined;
  TransactionHistory: undefined;
  ViolationHistory: undefined;
  ViolationPayment: { violationId: string };
  Settings: undefined;
  NotificationPreferences: undefined;
  Language: undefined;
  Accessibility: undefined;
  ReportIssue: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  JourneyTab: undefined;
  ServicesTab: undefined;
  AlertsTab: undefined;
  ProfileTab: undefined;
};
