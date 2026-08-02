/**
 * Utility functions for calculating and formatting estimated delivery dates.
 */

export interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  startDate: Date;
  endDate: Date;
  formattedRange: string;
  formattedStartDate: string;
  formattedEndDate: string;
  deliveryTag: string;
}

/**
 * Calculates delivery estimate based on lead days.
 * Defaults to guaranteed 3 days for District Village Delivery.
 */
export const getEstimatedDelivery = (
  minDays = 3,
  maxDays = 3,
  baseDate: Date = new Date()
): DeliveryEstimate => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + minDays);

  const end = new Date(baseDate);
  end.setDate(end.getDate() + maxDays);

  const dayOptions: Intl.DateTimeFormatOptions = { weekday: "short" };
  const fullDayOptions: Intl.DateTimeFormatOptions = { weekday: "long" };
  const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

  const startFullDay = start.toLocaleDateString("en-US", fullDayOptions);
  const startDateStr = start.toLocaleDateString("en-US", dateOptions);

  const endFullDay = end.toLocaleDateString("en-US", fullDayOptions);
  const endDateStr = end.toLocaleDateString("en-US", dateOptions);

  return {
    minDays,
    maxDays,
    startDate: start,
    endDate: end,
    formattedRange: `${startFullDay}, ${startDateStr}`,
    formattedStartDate: `${startFullDay}, ${startDateStr}`,
    formattedEndDate: `${endFullDay}, ${endDateStr}`,
    deliveryTag: "🚀 Guaranteed District Delivery (Within 3 Days)",
  };
};

/**
 * Calculates estimated delivery date based on pincode.
 */
export const getPincodeEstimate = (pincode: string): DeliveryEstimate => {
  return getEstimatedDelivery(3, 3);
};

/**
 * Formats a Date object or ISO string into a human-readable delivery string.
 * Example: "Wednesday, 5 Aug 2026"
 */
export const formatDeliveryDate = (dateStringOrObj?: string | Date): string => {
  if (!dateStringOrObj) {
    const defaultEstimate = getEstimatedDelivery(3, 3);
    return defaultEstimate.formattedStartDate;
  }

  const d = new Date(dateStringOrObj);
  if (isNaN(d.getTime())) {
    return getEstimatedDelivery(3, 3).formattedStartDate;
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return d.toLocaleDateString("en-US", options);
};

/**
 * Calculates and formats the expected delivery date for an order.
 * Guarantees delivery date is strictly 3 days after order creation date.
 */
export const getDeliveryDateForOrder = (order?: {
  estimatedDeliveryDate?: string | Date;
  deliveredAt?: string | Date;
  createdAt?: string | Date;
}): string => {
  if (!order) {
    return getEstimatedDelivery(3, 3).formattedStartDate;
  }

  if (order.deliveredAt) {
    return formatDeliveryDate(order.deliveredAt);
  }

  if (order.estimatedDeliveryDate) {
    return formatDeliveryDate(order.estimatedDeliveryDate);
  }

  if (order.createdAt) {
    const created = new Date(order.createdAt);
    if (!isNaN(created.getTime())) {
      const estimated = new Date(created);
      estimated.setDate(estimated.getDate() + 3);
      return formatDeliveryDate(estimated);
    }
  }

  return getEstimatedDelivery(3, 3).formattedStartDate;
};
