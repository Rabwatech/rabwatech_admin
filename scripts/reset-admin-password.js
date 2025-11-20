/**
 * Script to reset admin password
 * 
 * Usage: node scripts/reset-admin-password.js <email> <newPassword>
 * Example: node scripts/reset-admin-password.js rabwtech@gmail.com MyNewPassword123
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local file manually
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing Supabase environment variables')
  console.error('Please make sure .env.local exists with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('❌ Usage: node scripts/reset-admin-password.js <email> <newPassword>')
  console.error('Example: node scripts/reset-admin-password.js rabwtech@gmail.com MyNewPassword123')
  process.exit(1)
}

if (newPassword.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long')
  process.exit(1)
}

async function resetPassword() {
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log(`🔍 Looking for user with email: ${email}...`)

    // List all users
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      process.exit(1)
    }

    const user = usersData.users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      console.log('\nAvailable users:')
      usersData.users.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`)
      })
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`)
    console.log(`🔐 Resetting password...`)

    // Update password
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError.message)
      process.exit(1)
    }

    console.log('✅ Password reset successfully!')
    console.log(`\nYou can now login with:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${newPassword}`)
    console.log(`\n⚠️  Please change this password after logging in!`)
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

resetPassword()

