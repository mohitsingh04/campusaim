import { getCode } from "country-list";

export const getCountryCode = (countryName: string): string => {
  let code = getCode(countryName);
  if (!code) {
    const fallbacks: Record<string, string> = {
      Russia: "RU",
      USA: "US",
      "United States": "US",
      UK: "GB",
      "United Kingdom": "GB",
      UAE: "AE",
      India: "IN",
    };
    code = fallbacks[countryName] || "";
  }
  return code;
};
