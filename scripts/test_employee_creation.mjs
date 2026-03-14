
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

async function testEmployeeCreation() {
    const testEmail = `test_employee_${Date.now()}@pozu.com`
    const testPassword = 'Password123!'
    const testName = 'Test Employee'
    
    console.log(`Attempting to create employee: ${testEmail}`)

    // 1. Create in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
            full_name: testName
        }
    })

    if (authError) {
        console.error('Auth Error:', authError.message)
        return
    }

    const userId = authData.user.id
    console.log(`Auth user created successfully with ID: ${userId}`)

    // 2. Upsert in Profiles
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            email: testEmail,
            full_name: testName,
            role: 'staff'
        })

    if (profileError) {
        console.error('Profile Error:', profileError.message)
        // Cleanup auth user
        await supabaseAdmin.auth.admin.deleteUser(userId)
        console.log('Auth user cleaned up.')
        return
    }

    console.log('Profile created successfully.')
    
    // 3. Cleanup
    await supabaseAdmin.auth.admin.deleteUser(userId)
    console.log('Test successful. Temporary user deleted.')
}

testEmployeeCreation()
