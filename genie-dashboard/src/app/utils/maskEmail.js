export function maskEmail(email = "") {
    if (!email || typeof email !== "string") return "—";

    const [local, domain] = email.split("@");
    if (!local || !domain) return email;

    if (local.length <= 2) {
        return `${local[0]}*@${domain}`;
    }

    const start = local.slice(0, 2);
    const end = local.slice(-2);

    return `${start}${"*".repeat(Math.max(local.length - 4, 2))}${end}@${domain}`;
}
