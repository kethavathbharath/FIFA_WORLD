module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        browser: true,
        node: true,
        jest: true,
        NexusData: "readonly",
        NexusCharts: "readonly",
        NexusStadiumMap: "readonly",
        CommandCenter: "readonly",
        CrowdAnalytics: "readonly",
        SmartNavigation: "readonly",
        AIAssistant: "readonly",
        Operations: "readonly",
        MultiLanguage: "readonly",
        NexusApp: "readonly",
        Chart: "readonly",
        echarts: "readonly",
        L: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
      "eqeqeq": "error",
      "curly": "off",
      "no-eval": "error",
      "no-implied-eval": "error"
    }
  }
];
