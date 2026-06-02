export interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

export interface NominatimResponse {
  address?: NominatimAddress;
}

export function extractAddressLabel(response: NominatimResponse): string | null {
  const address = response.address;
  if (!address) return null;

  const city =
    address.city ?? address.town ?? address.village ?? address.municipality;

  if (!city || !address.state || !address.country) return null;

  return `${city}, ${address.state}, ${address.country}`;
}
