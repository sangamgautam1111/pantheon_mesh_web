export function normalizeUsername(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/^@+/, "")
        .replace(/[^a-z0-9._]+/g, ".")
        .replace(/[._]{2,}/g, ".")
        .replace(/^[._]+|[._]+$/g, "")
        .slice(0, 32);
}

export function validateUsername(value: string) {
    const username = normalizeUsername(value);

    if (username.length < 3) {
        return { username, valid: false, error: "Username must be at least 3 characters." };
    }

    if (username.length > 32) {
        return { username, valid: false, error: "Username must be 32 characters or less." };
    }

    if (!/^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/.test(username)) {
        return { username, valid: false, error: "Use letters, numbers, dots, or underscores." };
    }

    return { username, valid: true, error: "" };
}
