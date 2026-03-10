require("dotenv").config()

const delay = ms => new Promise(r => setTimeout(r, ms))
const RATE_DELAY = parseInt(process.env.RATE_DELAY_MS || "7000", 10)

let queue = Promise.resolve()

function sendSafe(sock, jid, message) {
  queue = queue.then(async () => {
    await delay(RATE_DELAY)
    const result = await sock.sendMessage(jid, message)
    return result
  }).catch(err => {
    console.error(err)
    return null // Return null instead of undefined so caller knows it failed
  })

  return queue
}

module.exports = { sendSafe }
