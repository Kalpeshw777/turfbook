export interface QRPayload {
  code: string;
  bookingId: string;
  turfName: string;
  groundName: string;
  customerName: string;
  date: string;
  time: string;
  duration: number;
  totalAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  signature: string;
}

export function generateBookingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'TB-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function encodeQRPayload(data: Omit<QRPayload, 'signature'>): string {
  const payloadStr = JSON.stringify({
    ...data,
    signature: Buffer.from(`${data.code}:${data.date}:${data.totalAmount}`).toString('base64'),
  });
  return payloadStr;
}

export function decodeQRPayload(qrString: string): QRPayload | null {
  try {
    const parsed = JSON.parse(qrString);
    if (!parsed.code || !parsed.signature) return null;
    return parsed as QRPayload;
  } catch {
    return null;
  }
}
