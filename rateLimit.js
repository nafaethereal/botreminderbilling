require("dotenv").config()

const delay = ms => new Promise(r => setTimeout(r, ms))
const RATE_DELAY = parseInt(process.env.RATE_DELAY_MS || "7000", 10)

let queue = Promise.resolve()

function sendSafe(sock, jid, message) {
  queue = queue.then(async () => {
    await delay(RATE_DELAY)
    return await sock.sendMessage(jid, message)
  }).catch(console.error)

  return queue
}

module.exports = { sendSafe }
