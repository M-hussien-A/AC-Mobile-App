import { mockFetch } from './api';

interface ReportSubmission {
  category: string;
  description: string;
  lat: number;
  lng: number;
  photoUri?: string;
}

export async function submitReport(report: ReportSubmission): Promise<{ referenceNumber: string; success: boolean }> {
  return mockFetch({
    referenceNumber: `RPT-${Date.now().toString(36).toUpperCase()}`,
    success: true,
  }, 1200);
}

export async function sendSOS(
  type: 'accident' | 'medical' | 'security',
  lat: number,
  lng: number,
  peopleCount: number
): Promise<{ referenceNumber: string }> {
  return mockFetch({
    referenceNumber: `SOS-${Date.now().toString(36).toUpperCase()}`,
  }, 500);
}

export async function getEvacuationPlan(): Promise<{
  routes: Array<{ id: string; name: string; nameAr: string; coordinates: [number, number][] }>;
  rallyPoints: Array<{ id: string; name: string; nameAr: string; lat: number; lng: number }>;
  instructions: Array<{ step: number; instruction: string; instructionAr: string }>;
}> {
  return mockFetch({
    routes: [
      {
        id: 'EVAC-R1',
        name: 'Primary Evacuation Route',
        nameAr: 'مسار الإخلاء الرئيسي',
        coordinates: [[30.0194, 31.76], [30.022, 31.755], [30.025, 31.75], [30.03, 31.745]],
      },
      {
        id: 'EVAC-R2',
        name: 'Secondary Evacuation Route',
        nameAr: 'مسار الإخلاء الثانوي',
        coordinates: [[30.0194, 31.76], [30.018, 31.765], [30.015, 31.77], [30.01, 31.78]],
      },
    ],
    rallyPoints: [
      { id: 'RP-1', name: 'Government Plaza Rally Point', nameAr: 'نقطة تجمع ساحة الحكومة', lat: 30.03, lng: 31.745 },
      { id: 'RP-2', name: 'East Gate Rally Point', nameAr: 'نقطة تجمع البوابة الشرقية', lat: 30.01, lng: 31.78 },
    ],
    instructions: [
      { step: 1, instruction: 'Leave the building calmly using the nearest exit', instructionAr: 'غادر المبنى بهدوء من أقرب مخرج' },
      { step: 2, instruction: 'Follow the green evacuation route signs', instructionAr: 'اتبع لافتات مسار الإخلاء الخضراء' },
      { step: 3, instruction: 'Proceed to the nearest rally point', instructionAr: 'توجه إلى أقرب نقطة تجمع' },
      { step: 4, instruction: 'Wait for further instructions from authorities', instructionAr: 'انتظر تعليمات إضافية من السلطات' },
    ],
  });
}
