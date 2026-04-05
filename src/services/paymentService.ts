import { mockFetch } from './api';

interface Transaction {
  id: string;
  type: 'parking' | 'transit' | 'fine' | 'topUp';
  description: string;
  descriptionAr: string;
  amountEGP: number;
  date: string;
}

export async function processPayment(
  amount: number,
  method: 'wallet' | 'card' | 'qr' | 'nfc',
  description: string
): Promise<{ transactionId: string; qrCode: string; success: boolean }> {
  return mockFetch({
    transactionId: `TXN-${Date.now()}`,
    qrCode: `QR-PAY-${Date.now()}`,
    success: true,
  }, 1000);
}

export async function getWalletBalance(): Promise<number> {
  return mockFetch(2500);
}

export async function topUpWallet(amount: number, method: 'card' | 'mobile'): Promise<{ newBalance: number }> {
  return mockFetch({ newBalance: 2500 + amount }, 800);
}

export async function getTransactions(): Promise<Transaction[]> {
  return mockFetch([
    { id: 'TXN-001', type: 'parking', description: 'Parking - Gov District Garage A', descriptionAr: 'موقف - مرآب الحي الحكومي أ', amountEGP: -25, date: '2026-04-05T10:30:00Z' },
    { id: 'TXN-002', type: 'transit', description: 'LRT - Gov District to CBD', descriptionAr: 'قطار خفيف - الحي الحكومي إلى وسط المدينة', amountEGP: -15, date: '2026-04-04T08:15:00Z' },
    { id: 'TXN-003', type: 'topUp', description: 'Wallet Top-up', descriptionAr: 'شحن المحفظة', amountEGP: 500, date: '2026-04-03T14:00:00Z' },
    { id: 'TXN-004', type: 'fine', description: 'Speed Violation Fine', descriptionAr: 'غرامة تجاوز السرعة', amountEGP: -1500, date: '2026-04-02T09:00:00Z' },
    { id: 'TXN-005', type: 'parking', description: 'Parking - Al Amal Axis P2', descriptionAr: 'موقف - محور الأمل P2', amountEGP: -30, date: '2026-04-01T16:45:00Z' },
    { id: 'TXN-006', type: 'topUp', description: 'Wallet Top-up', descriptionAr: 'شحن المحفظة', amountEGP: 1000, date: '2026-03-30T11:00:00Z' },
  ]);
}
