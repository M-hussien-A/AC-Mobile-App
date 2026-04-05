# ACUD ITS Traveler Information Mobile App

**NAC Phase 1 — Government District, New Administrative Capital, Egypt**

A modern, high-usability mobile application for citizens, providing real-time traffic information, journey planning, parking services, transit integration, and emergency alerts for the New Administrative Capital.

## Tech Stack

- **Framework:** React Native + Expo (managed workflow, TypeScript)
- **Navigation:** React Navigation v6 (bottom tabs + stack navigators)
- **State Management:** Zustand
- **Maps:** react-native-maps (Google Maps provider)
- **i18n:** react-i18next (Arabic RTL + English LTR)
- **Forms:** React Hook Form + Zod validation
- **Icons:** @expo/vector-icons (MaterialCommunityIcons)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

## App Structure

```
src/
├── components/     # 35+ reusable UI components
│   ├── common/     # Button, Card, Badge, SkeletonLoader, SearchBar, BottomSheet
│   ├── map/        # TrafficMapView, markers, overlays, legend
│   ├── traffic/    # LOS indicators, queue bars, speed display
│   ├── parking/    # Availability gauge, parking cards, session timer
│   ├── transit/    # Route diagrams, arrival cards, alert banners
│   ├── alerts/     # Alert cards, severity badges, SOS button
│   ├── payment/    # Wallet balance, payment selector, QR display
│   └── journey/    # Mode selector, route cards, navigation bar
├── screens/        # 43 screens across 5 tabs + auth
│   ├── auth/       # Splash, Onboarding, Login, Register
│   ├── home/       # Dashboard, Traffic Map, Incidents, DMS, Road Work
│   ├── journey/    # Planner, Routes, Navigation, Saved, History
│   ├── services/   # Parking, Transit, Mobility, Loading Zones, POI
│   ├── alerts/     # Alert List, Detail, Emergency SOS, Evacuation
│   └── profile/    # Profile, Wallet, Violations, Settings, Report
├── navigation/     # React Navigation stacks and tabs
├── stores/         # Zustand state stores (7 stores)
├── services/       # Mock API service layer (14 services)
├── mocks/          # Mock JSON data files (11 files)
├── theme/          # Colors, typography, spacing, dark mode
├── i18n/           # Arabic + English translations (~300 keys each)
├── types/          # TypeScript interfaces (30+ types)
└── utils/          # Helper functions
```

## Features

| Feature | Description |
|---------|-------------|
| **Real-Time Traffic Map** | 9 toggleable layers, 57 intersections, LOS color-coded roads |
| **Journey Planning** | Multimodal (drive/transit/walk/cycle), route comparison, CO2 estimates |
| **Turn-by-Turn Navigation** | Mock GPS, speed alerts, rerouting prompts |
| **Parking Services** | Map with availability, reservation, payment, QR entry, session timer |
| **Transit Integration** | LRT/Monorail/Bus routes, schedules, fare payment, QR tickets |
| **Shared Mobility** | Bike/scooter stations, EV charging map, ride hailing |
| **Emergency SOS** | 3-second press-hold activation, GPS auto-capture, reference tracking |
| **Evacuation Routes** | Map with routes and rally points during emergencies |
| **Violation Management** | View violations with evidence, pay fines in-app |
| **Citizen Reporting** | Report issues with photo capture and GPS location |
| **Wallet System** | In-app wallet with top-up and transaction history |

## Design

- **Brand Colors:** Primary `#1F4E79` (dark blue), Accent `#D4A84B` (gold)
- **Language:** Arabic (RTL) default, English (LTR) switchable
- **Dark Mode:** Full dark theme support
- **Accessibility:** Screen reader support, font size adjustment, high contrast mode
- **Map Center:** Government District at 30.0194° N, 31.7600° E

## Data

All data is served from mock JSON files with simulated API delays (300-800ms). No backend required.

- 57 signalized intersections across the Government District
- 8 sample traffic incidents with severity levels
- 12 DMS (Dynamic Message Sign) messages
- 10 parking facilities with real-time availability
- 5 transit routes (LRT, Monorail, Bus)
- 25 alerts across 6 categories
- 7 traffic violations

## License

Proprietary — ACUD (Administrative Capital for Urban Development)
