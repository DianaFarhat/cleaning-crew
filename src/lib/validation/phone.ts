import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

export const lebanesePhoneInputSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const phone = parsePhoneNumberFromString(value, "LB");
    const type = phone?.getType();

    const isLebaneseMobile =
      phone?.isValid() &&
      phone.country === "LB" &&
      (type === "MOBILE" || type === "FIXED_LINE_OR_MOBILE");

    if (!phone || !isLebaneseMobile) {
      ctx.addIssue({ code: "custom", message: "Enter a valid Lebanese mobile number" });
      return z.NEVER;
    }

    return phone.number; // "+9613123456"
    // 👥 real users in DB? use this instead: return phone.nationalNumber; // "3123456"
  });