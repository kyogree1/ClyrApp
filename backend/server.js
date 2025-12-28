import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import midtransClient from "midtrans-client"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use((req, _res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`)
  next()
})

const PORT = Number(process.env.PORT || 9000)

/* =======================
   SUPABASE ADMIN
======================= */
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* =======================
   MIDTRANS SNAP
======================= */
const snap = new midtransClient.Snap({
  isProduction: false, // sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY,
})

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (_req, res) => {
  res.send("CLYR Backend is running 🚀")
})

/* =======================
   CREATE TRANSACTION
======================= */
app.post("/api/create-transaction", async (req, res) => {
  try {
    const { email, user_id } = req.body

    if (!email || !user_id) {
      return res.status(400).json({
        error: "email dan user_id wajib dikirim",
      })
    }

    const orderId = `CLYR-${Date.now()}`

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: 500,
      },
      customer_details: { email },

      // 🔥 KUNCI UTAMA
      custom_field1: user_id,
    })

    res.json({
      token: transaction.token,
      order_id: orderId,
    })
  } catch (err) {
    console.error("❌ Create Transaction Error:", err)
    res.status(500).json({ error: "Failed to create transaction" })
  }
})

/* =======================
   MIDTRANS WEBHOOK
======================= */
app.post("/api/midtrans/webhook", async (req, res) => {
  try {
    const notif = req.body

    console.log("🔔 WEBHOOK:", notif.transaction_status)

    const status = notif.transaction_status
    const fraud = notif.fraud_status
    const userId = notif.custom_field1

    const isPaid =
      status === "settlement" ||
      (status === "capture" && fraud === "accept")

    if (!isPaid) {
      return res.status(200).send("Ignored")
    }

    if (!userId) {
      console.error("❌ user_id tidak ditemukan di webhook")
      return res.status(400).send("user_id missing")
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", userId)

    if (error) {
      console.error("❌ Supabase error:", error)
      return res.status(500).send("DB error")
    }

    console.log(`✅ PREMIUM AKTIF UNTUK USER ${userId}`)
    res.status(200).send("OK")
  } catch (err) {
    console.error("❌ Webhook Error:", err)
    res.status(500).send("Webhook error")
  }
})

/* =======================
   404
======================= */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" })
})

/* =======================
   START
======================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
})
