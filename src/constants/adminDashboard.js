export const METRIC_COLORS = {
  schoolsRegistered: "#E4B3BF",
  activitiesUploaded: "#81B6BC",
  averageCompletion: "#006D6A",
  pendingReports: "#EFB446",
};

export const METRIC_CARD_CONFIG = {
  schoolsRegistered: {
    color: METRIC_COLORS.schoolsRegistered,
    tooltip:
      "Total number of schools registered in the wellness program. This includes both active and inactive schools.",
  },
  activitiesUploaded: {
    color: METRIC_COLORS.activitiesUploaded,
    tooltip:
      "Number of wellness activities uploaded for schools to implement. These activities cover various dimensions of student wellness.",
  },
  averageCompletion: {
    color: METRIC_COLORS.averageCompletion,
    tooltip:
      "Average completion rate of wellness activities across all registered schools. A higher percentage indicates greater engagement with wellness initiatives.",
  },
  pendingReports: {
    color: METRIC_COLORS.pendingReports,
    tooltip:
      "Number of reports pending review or action. These reports may require additional information or approval before they can be finalized.",
  },
};

export const RECOMMENDATION_SAVE_BUTTON_COLOR = "#FB7185";
