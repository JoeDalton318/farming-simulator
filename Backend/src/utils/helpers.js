function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function calculateYield(baseYield, isFertilized) {
  return isFertilized ? baseYield * 1.5 : baseYield;
}

module.exports = {
  formatDuration,
  calculateYield,
};
