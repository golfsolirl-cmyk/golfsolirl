/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
export const readIncomingMessageBodyUtf8 = async (req) => {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}
