export const chartTheme = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  axis: {
    stroke: "#e5e7eb",
    tick: {
      fill: "#6b7280",
      fontSize: 12,
      fontWeight: 500,
    },
  },

  grid: {
    stroke: "#d1d5db",
    strokeOpacity: 0.3,
    strokeDasharray: "3 3",
  },

  tooltip: {
    bg: "white",
    border: "#e5e7eb",
    shadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  },

  header: {
    borderBottom: "1px solid #f3f4f6",
    padding: "0 24px 16px 24px",
    title: { fontSize: 18, fontWeight: 600, color: "#111827" },
    desc: { fontSize: 14, color: "#6b7280", lineHeight: 1.4 },
  },
  pie: {
    colors: ["#4f46e5", "#6366f1", "#a5b4fc", "#c7d2fe", "#e0e7ff"],

    hoverOpacity: 0.6,
    transition: "opacity 0.25s ease",

    legend: {
      iconSize: 10,
      topPadding: 12,
    },
  },
};
