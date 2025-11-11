// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel' // put nativewind in presets to avoid nested .plugins being treated as a plugin
    ],
    plugins: [
      'react-native-reanimated/plugin' // reanimated plugin should be last in plugins
    ]
  };
};