import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        },
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/auth") &&
        !request.nextUrl.pathname.startsWith("/login") &&
        request.nextUrl.pathname !== "/"
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
    }

    if (user) {
        const role = user.user_metadata.role
        const path = request.nextUrl.pathname
        const instituteCode = user.user_metadata.institute_code



        if (role === 'institute_admin') {
            if (!path.startsWith('/admin/dashboard') && !path.startsWith('/auth') && !path.startsWith('/api') && !path.startsWith('/access-denied')) {
                const url = request.nextUrl.clone()
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }
        } else if (role === 'super_admin') {
            if (!path.startsWith('/super-admin/dashboard') && !path.startsWith('/auth') && !path.startsWith('/api')) {
                const url = request.nextUrl.clone()
                url.pathname = '/super-admin/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}
