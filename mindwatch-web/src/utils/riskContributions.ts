export function computeRiskContributions(reasons: string[]) {
  let phq9 = 0;
  let behavior = 0;
  let activity = 0;
  reasons.forEach((r) => {
    if (r.startsWith("phq9")) phq9 += 1;
    if (r.includes("behavior")) behavior += 1;
    if (r.includes("activity")) activity += 1;
  });
  const total = phq9 + behavior + activity || 1;
  return [
    { label: "PHQ-9", value: Math.round((phq9 / total) * 100), color: "bg-blue-600" },
    { label: "Behavior", value: Math.round((behavior / total) * 100), color: "bg-purple-600" },
    { label: "Activity", value: Math.round((activity / total) * 100), color: "bg-green-600" },
  ];
}
