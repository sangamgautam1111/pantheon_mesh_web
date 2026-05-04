export type ViewerLocation = {
    latitude?: number;
    longitude?: number;
    countryCode?: string;
    regionCode?: string;
    city?: string;
    label: string;
    source: "ip" | "browser";
};

export const normalizePlace = (value?: string | null) => String(value || "").trim().toLowerCase();

export const distanceKm = (
    fromLat?: number | null,
    fromLng?: number | null,
    toLat?: number | null,
    toLng?: number | null,
) => {
    if (![fromLat, fromLng, toLat, toLng].every((value) => typeof value === "number" && Number.isFinite(value))) {
        return null;
    }

    const earthRadiusKm = 6371;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad((toLat as number) - (fromLat as number));
    const dLng = toRad((toLng as number) - (fromLng as number));
    const lat1 = toRad(fromLat as number);
    const lat2 = toRad(toLat as number);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const localRank = (need: {
    city?: string;
    stateCode?: string;
    countryCode?: string;
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
}, viewer: ViewerLocation | null) => {
    if (!viewer) return 0;

    let rank = 0;
    const needCity = normalizePlace(need.city);
    const viewerCity = normalizePlace(viewer.city);
    const needState = normalizePlace(need.stateCode);
    const viewerState = normalizePlace(viewer.regionCode);
    const needCountry = normalizePlace(need.countryCode);
    const viewerCountry = normalizePlace(viewer.countryCode);

    if (needCity && viewerCity && needCity === viewerCity) rank += 500;
    if (needState && viewerState && needState === viewerState) rank += 220;
    if (needCountry && viewerCountry && needCountry === viewerCountry) rank += 80;

    const km = distanceKm(need.latitude, need.longitude, viewer.latitude, viewer.longitude);
    if (km !== null) {
        rank += Math.max(0, 320 - km);
    }

    if (normalizePlace(need.location).includes(viewerCity) && viewerCity) rank += 120;
    return rank;
};

export const needDistanceLabel = (need: {
    city?: string;
    stateCode?: string;
    countryCode?: string;
    latitude?: number | null;
    longitude?: number | null;
}, viewer: ViewerLocation | null) => {
    return "Anywhere in Nepal";
};
