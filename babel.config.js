// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxImportSource: 'nativewind',
        unstable_react_compiler: false   // ← this disables the broken compiler
      }],
      'nativewind/babel'
    ],
    plugins: [
      'react-native-reanimated/plugin' // must be last
    ]
  };
};