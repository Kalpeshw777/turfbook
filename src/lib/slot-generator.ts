export interface SlotDefinition {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  price: number;
  timeBand: 'Morning' | 'Daytime' | 'Evening' | 'Night';
}

export function calculateSlotPrice(
  basePrice: number,
  startTime: string,
  dateStr: string,
  customRules?: Array<{ startTime: string; endTime: string; priceMultiplier: number; fixedPrice?: number | null }>
): { price: number; timeBand: 'Morning' | 'Daytime' | 'Evening' | 'Night' } {
  const hour = parseInt(startTime.split(':')[0], 10);
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = day === 0 || day === 6;

  // Check custom rules first
  if (customRules && customRules.length > 0) {
    for (const rule of customRules) {
      const ruleStart = parseInt(rule.startTime.split(':')[0], 10);
      const ruleEnd = parseInt(rule.endTime.split(':')[0], 10);
      if (hour >= ruleStart && hour < ruleEnd) {
        if (rule.fixedPrice) {
          return { price: rule.fixedPrice, timeBand: hour < 12 ? 'Morning' : hour < 17 ? 'Daytime' : hour < 21 ? 'Evening' : 'Night' };
        }
        return {
          price: Math.round(basePrice * rule.priceMultiplier),
          timeBand: hour < 12 ? 'Morning' : hour < 17 ? 'Daytime' : hour < 21 ? 'Evening' : 'Night',
        };
      }
    }
  }

  // Standard dynamic price bands
  let multiplier = 1.0;
  let timeBand: 'Morning' | 'Daytime' | 'Evening' | 'Night' = 'Daytime';

  if (hour >= 6 && hour < 9) {
    multiplier = 0.85; // Morning saver
    timeBand = 'Morning';
  } else if (hour >= 9 && hour < 17) {
    multiplier = 0.95; // Daytime standard
    timeBand = 'Daytime';
  } else if (hour >= 17 && hour < 21) {
    multiplier = 1.35; // Peak floodlit evening
    timeBand = 'Evening';
  } else {
    multiplier = 1.15; // Late night rush
    timeBand = 'Night';
  }

  if (isWeekend) {
    multiplier += 0.2; // 20% weekend demand premium
  }

  const roundedPrice = Math.round((basePrice * multiplier) / 50) * 50; // rounded to nearest 50 INR
  return { price: roundedPrice, timeBand };
}

export function generateDailySlots(
  openTime: string = '06:00',
  closeTime: string = '23:00',
  basePrice: number = 800,
  dateStr: string,
  customRules?: Array<{ startTime: string; endTime: string; priceMultiplier: number; fixedPrice?: number | null }>
): SlotDefinition[] {
  const startHour = parseInt(openTime.split(':')[0], 10);
  const endHour = parseInt(closeTime.split(':')[0], 10);
  const slots: SlotDefinition[] = [];

  for (let h = startHour; h < endHour; h++) {
    const sH = h.toString().padStart(2, '0') + ':00';
    const eH = (h + 1).toString().padStart(2, '0') + ':00';
    const { price, timeBand } = calculateSlotPrice(basePrice, sH, dateStr, customRules);

    slots.push({
      startTime: sH,
      endTime: eH,
      price,
      timeBand,
    });
  }

  return slots;
}
