import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import midtransClient from "midtrans-client"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()

/* =======================
   CORS (AMAN PROD)
======================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://clyr-app.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
)

app.use(express.json())

/* =======================
   LOGGER
======================= */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

/* =======================
   PORT (RAILWAY)
======================= */
const PORT = Number(process.env.PORT || 3000)

/* =======================
   SUPABASE ADMIN
======================= */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("❌ SUPABASE ENV MISSING")
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* =======================
   MIDTRANS SNAP (SANDBOX)
======================= */
if (!process.env.MIDTRANS_SERVER_KEY) {
  throw new Error("❌ MIDTRANS_SERVER_KEY MISSING")
}

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
})

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (_req, res) => {
  res.send("CLYR Backend is running 🚀")
})

/* =========================================================
   1️⃣ PREMIUM PRIBADI (Rp 500 – TESTING)
========================================================= */
app.post("/api/create-transaction", async (req, res) => {
  try {
    const { email, user_id } = req.body
    if (!email || !user_id) {
      return res.status(400).json({ error: "email & user_id required" })
    }

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: `CLYR-${Date.now()}`,
        gross_amount: 500,
      },
      customer_details: { email },
      item_details: [
        {
          id: "clyr_premium",
          price: 500,
          quantity: 1,
          name: "CLYR Premium (Testing)",
        },
      ],
      custom_field1: user_id,
      custom_field2: "PREMIUM",
    })

    res.json({ token: transaction.token })
  } catch (err) {
    console.error("❌ CREATE TRANSACTION ERROR:", err)
    res.status(500).json({ error: "Failed to create transaction" })
  }
})

/* =========================================================
   2️⃣ GIFT PREMIUM (Rp 2.500)
========================================================= */
app.post("/api/gift/create-transaction", async (req, res) => {
  try {
    const { email, user_id } = req.body
    if (!email || !user_id) {
      return res.status(400).json({ error: "email & user_id required" })
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_premium")
      .eq("id", user_id)
      .single()

    if (!profile?.is_premium) {
      return res.status(403).json({ error: "Premium only" })
    }

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: `CLYR-GIFT-${Date.now()}`,
        gross_amount: 2500,
      },
      customer_details: { email },
      item_details: [
        {
          id: "clyr_gift",
          price: 2500,
          quantity: 1,
          name: "CLYR Premium Gift (Max 5 Accounts)",
        },
      ],
      custom_field1: user_id,
      custom_field2: "GIFT",
    })

    res.json({ token: transaction.token })
  } catch (err) {
    console.error("❌ GIFT TRANSACTION ERROR:", err)
    res.status(500).json({ error: "Failed to create gift transaction" })
  }
})

/* =========================================================
   3️⃣ MIDTRANS WEBHOOK
========================================================= */
app.post("/api/midtrans/webhook", async (req, res) => {
  try {
    const notif = req.body
    const status = notif.transaction_status
    const fraud = notif.fraud_status
    const userId = notif.custom_field1
    const type = notif.custom_field2

    const isPaid =
      status === "settlement" ||
      (status === "capture" && fraud === "accept")

    if (!isPaid) return res.status(200).send("Ignored")

    if (type === "PREMIUM") {
      await supabaseAdmin
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", userId)

      console.log(`✅ PREMIUM AKTIF UNTUK USER ${userId}`)
    }

    if (type === "GIFT") {
      console.log(`🎁 GIFT PAYMENT SUCCESS by ${userId}`)
    }

    res.status(200).send("OK")
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err)
    res.status(500).send("Webhook error")
  }
})

/* =========================================================
   404
========================================================= */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" })
})

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`)
})
