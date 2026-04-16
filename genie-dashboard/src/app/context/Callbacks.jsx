export const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
            return "green";
        case "pending":
            return "yellow";
        case "suspended":
            return "red";
        default:
            return "blue";
    }
};

export const getLeadStatus = (percentage) => {
    if (percentage < 30) return "Poor";
    if (percentage < 50) return "Average";
    if (percentage < 70) return "Good";
    if (percentage < 85) return "Very Good";
    return "Excellent";
};