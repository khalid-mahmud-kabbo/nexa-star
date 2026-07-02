/** Returns today's date as YYYY-MM-DD in UTC, used as the key for daily usage counters. */
function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { todayUTC };
