const catchAsync = require('../utils/catchAsync');
const reportService = require('../services/report.service');

/** Primer y último día del mes actual, en formato YYYY-MM-DD. */
function currentMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toISO = (d) => d.toISOString().substring(0, 10);
  return { dateFrom: toISO(first), dateTo: toISO(last) };
}

/**
 * GET /api/reports/summary?dateFrom=&dateTo=
 * Si no se envían fechas, se usa el mes en curso por defecto.
 */
exports.getSummary = catchAsync(async (req, res) => {
  const defaults = currentMonthRange();
  const dateFrom = req.query.dateFrom || defaults.dateFrom;
  const dateTo = req.query.dateTo || defaults.dateTo;

  const result = await reportService.getSummary({ dateFrom, dateTo });

  res.json({ success: true, data: result });
});
