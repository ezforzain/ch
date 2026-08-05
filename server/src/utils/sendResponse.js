/** Consistent success envelope for every endpoint: { success, message, data, meta? }. */
export function sendResponse(res, statusCode, message, data = null, meta = undefined) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}
