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
   MIDTRANS SNAP (SANDBOX)
======================= */
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
    console.error(err)
    res.status(500).json({ error: "Failed to create premium transaction" })
  }
})

/* =========================================================
   2️⃣ GIFT PREMIUM (Rp 2.500 – MAX 5 AKUN)
========================================================= */
app.post("/api/gift/create-transaction", async (req, res) => {
  try {
    const { email, user_id } = req.body
    if (!email || !user_id) {
      return res.status(400).json({ error: "email & user_id required" })
    }

    // 🔐 WAJIB PREMIUM
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
    console.error(err)
    res.status(500).json({ error: "Failed to create gift transaction" })
  }
})

/* =========================================================
   3️⃣ MIDTRANS WEBHOOK (PREMIUM & GIFT)
========================================================= */
app.post("/api/midtrans/webhook", async (req, res) => {
  try {
    const notif = req.body

    const status = notif.transaction_status
    const fraud = notif.fraud_status
    const userId = notif.custom_field1
    const type = notif.custom_field2 // PREMIUM / GIFT

    const isPaid =
      status === "settlement" ||
      (status === "capture" && fraud === "accept")

    if (!isPaid) return res.status(200).send("Ignored")

    /* ================= PREMIUM ================= */
    if (type === "PREMIUM") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .single()

      if (profile?.is_premium) {
        console.log("ℹ️ User already premium")
        return res.status(200).send("Already premium")
      }

      await supabaseAdmin
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", userId)

      console.log(`✅ PREMIUM AKTIF UNTUK USER ${userId}`)
    }

    /* ================= GIFT ================= */
    if (type === "GIFT") {
      console.log(`🎁 GIFT PAYMENT SUCCESS by ${userId}`)
      // ❗ Tidak mengaktifkan premium
      // Gift code dibuat via /api/gift/generate
    }

    res.status(200).send("OK")
  } catch (err) {
    console.error("❌ Webhook Error:", err)
    res.status(500).send("Webhook error")
  }
})

/* =========================================================
   4️⃣ GENERATE GIFT CODE (PREMIUM ONLY)
========================================================= */
app.post("/api/gift/generate", async (req, res) => {
  const { user_id } = req.body
  if (!user_id) return res.status(400).json({ error: "user_id required" })

  const { data: user } = await supabaseAdmin
    .from("profiles")
    .select("is_premium")
    .eq("id", user_id)
    .single()

  if (!user?.is_premium) {
    return res.status(403).json({ error: "Premium only" })
  }

  const code =
    "CLYR-GIFT-" + Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data, error } = await supabaseAdmin
    .from("gift_codes")
    .insert({
      code,
      created_by: user_id,
      max_uses: 5,
      used_count: 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: "Failed to create gift code" })
  }

  res.json({ code: data.code, max_uses: data.max_uses })
})

/* =========================================================
   5️⃣ REDEEM GIFT CODE (FREE USER)
========================================================= */
app.post("/api/gift/redeem", async (req, res) => {
  const { user_id, code } = req.body
  if (!user_id || !code) {
    return res.status(400).json({ error: "user_id & code required" })
  }

  const { data: gift } = await supabaseAdmin
    .from("gift_codes")
    .select("*")
    .eq("code", code)
    .single()

  if (!gift || !gift.is_active) {
    return res.status(400).json({ error: "Invalid gift code" })
  }

  if (gift.used_count >= gift.max_uses) {
    return res.status(400).json({ error: "Gift code exhausted" })
  }

  await supabaseAdmin
    .from("profiles")
    .update({ is_premium: true })
    .eq("id", user_id)

  await supabaseAdmin
    .from("gift_codes")
    .update({ used_count: gift.used_count + 1 })
    .eq("id", gift.id)

  res.json({ success: true })
})

// =======================
// GET GIFT STATUS
// =======================
app.get("/api/gift/status/:code", async (req, res) => {
  const { code } = req.params

  if (!code) {
    return res.status(400).json({ error: "code required" })
  }

  const { data, error } = await supabaseAdmin
    .from("gift_codes")
    .select("code, used_count, max_uses, is_active")
    .eq("code", code)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: "Gift code not found" })
  }

  res.json({
    code: data.code,
    usedCount: data.used_count,
    maxUses: data.max_uses,
    isActive: data.is_active,
  })
})

/* =========================================================
   6️⃣ GET MY GIFT CODES (HISTORY)
========================================================= */
app.get("/api/gift/my/:userId", async (req, res) => {
  const { userId } = req.params

  const { data, error } = await supabaseAdmin
    .from("gift_codes")
    .select("code, used_count, max_uses, is_active, created_at")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json({ error: "Failed fetch gift history" })
  }

  res.json({ gifts: data })
})


/* =======================
   404
======================= */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" })
})

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
})
