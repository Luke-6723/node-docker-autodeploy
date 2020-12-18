// Dependencies
const crypto = require('crypto')

/**
 * Github payload authentication middleware
 */
const sigHeaderName = 'x-hub-signature-256'

const verifyPayload = async (req, res, next) => {
  // Stringify body
  const payload = JSON.stringify(req.body)

  // Verify payload was sent
  if(!payload) return res.status(400).send('No payload')

  // Get signature from header
  const sig = req.get(sigHeaderName) || ''
  // Generate HMAC
  const hmac = crypto.createHmac('sha256', process.env.AUTH_HEADER)
  // Digest buffer
  const digest = Buffer.from('sha256=' + hmac.update(payload).digest('hex'), 'utf8')
  // Get checksum
  const checksum = Buffer.from(sig, 'utf8')
  // Verify signature
  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return res.status(403).send(`Unauthorized`)
  }

  // Continue
  return next()
}

module.exports = verifyPayload