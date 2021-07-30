module.exports = (config) => {
  config.resolve.fallback = {
    path: false,
    fs: false,
    os: false,
  };

  return config;
};
