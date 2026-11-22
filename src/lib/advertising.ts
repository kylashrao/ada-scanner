import { publisher } from "./site";

export const adConfig = {
  publisher,
  slot: process.env.ADSENSE_ENABLED === "true" && /^\d+$/.test(process.env.ADSENSE_GUIDE_SLOT ?? "")
    ? process.env.ADSENSE_GUIDE_SLOT
    : undefined,
};
