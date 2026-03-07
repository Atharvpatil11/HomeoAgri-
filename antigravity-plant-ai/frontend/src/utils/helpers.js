export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const calculateHealthStatus = (healthScore) => {
    if (healthScore >= 90) return 'Generate';
    if (healthScore >= 70) return 'Healthy';
    if (healthScore >= 50) return 'Warning';
    return 'Critical';
};
