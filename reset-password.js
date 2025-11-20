/**
 * Simple password reset script - can be run from project root
 * Usage: node reset-password.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
      }
    })
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables')
  console.error('Looking for: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function resetPassword() {
  const email = 'rabwtech@gmail.com'
  const newPassword = 'Admin@123'
  
  console.log(`🔍 Finding user: ${email}...`)
  
  const { data: usersData } = await adminClient.auth.admin.listUsers()
  const user = usersData.users.find(u => u.email === email)
  
  if (!user) {
    console.error('❌ User not found')
    process.exit(1)
  }
  
  console.log(`✅ Found user: ${user.email}`)
  console.log(`🔐 Setting password...`)
  
  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    password: newPassword
  })
  
  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
  
  console.log('✅ Password reset successfully!')
  console.log(`\nLogin credentials:`)
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${newPassword}`)
}

resetPassword().catch(console.error)

