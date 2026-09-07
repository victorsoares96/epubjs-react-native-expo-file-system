module.exports = {
  'src/**/*.ts?(x)': () => ['npm run lint:fix', 'npm run type-check'],
};
