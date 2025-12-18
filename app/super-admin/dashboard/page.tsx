<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ShieldCheck, LogOut, LayoutDashboard, Users, GraduationCap, ArrowRight, Activity, Search } from "lucide-react"
import { AddInstituteAdminDialog } from "./add-institute-admin-dialog"
import { Input } from "@/components/ui/input"
import { InstituteStatusToggle } from "./institute-status-toggle"
import { InstituteCard } from "./institute-card"

export default async function SuperAdminDashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata.role !== 'super_admin') {
        redirect('/auth/login')
    }

    const adminClient = createAdminClient()

    // Fetch all users AND institutes status
    // Using Promise.all for efficiency
    const [usersResult, institutesResult] = await Promise.all([
        adminClient.auth.admin.listUsers({ perPage: 2000 }),
        adminClient.from('institutes').select('*')
    ])

    const users = usersResult.data.users
    const institutes = institutesResult.data || []

    if (usersResult.error) {
        console.error("Error fetching users:", usersResult.error)
        return <div className="p-8 text-center text-red-500">Error loading dashboard data. Please check logs.</div>
    }

    const instituteAdmins = users.filter(u => u.user_metadata.role === 'institute_admin')

    // Create a map for quick status lookup by code
    const instituteStatusMap = institutes.reduce((acc, inst) => {
        acc[inst.code] = inst.status
        return acc
    }, {} as Record<string, string>)

    // Calculate Stats per Institute
    const instituteStats = users.reduce((acc, currentUser) => {
        const code = currentUser.user_metadata.institute_code
        if (!code) return acc

        if (!acc[code]) {
            acc[code] = { students: 0, teachers: 0 }
        }

        if (currentUser.user_metadata.role === 'student') {
            acc[code].students++
        } else if (currentUser.user_metadata.role === 'teacher') {
            acc[code].teachers++
        }

        return acc
    }, {} as Record<string, { students: number, teachers: number }>)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">NeuroNxt <span className="text-foreground font-medium">Admin</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end text-sm">
                            <span className="font-semibold text-foreground">{user.user_metadata.full_name || "Super Admin"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <form action={async () => {
                            "use server"
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            redirect('/auth/login')
                        }}>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="container mx-auto py-8 space-y-8 px-4">

                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Total Institutes</CardTitle>
                            <Building2 className="h-4 w-4 text-white/80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{instituteAdmins.length}</div>
                            <p className="text-xs text-indigo-100 mt-1">Registered Organizations</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white dark:bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {Object.values(instituteStats).reduce((a, b) => a + b.students, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Across all institutes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white dark:bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
                            <GraduationCap className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {Object.values(instituteStats).reduce((a, b) => a + b.teachers, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Faculty members</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Institute Management Section */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Institutes</h2>
                            <p className="text-muted-foreground">Manage and monitor all registered educational institutes.</p>
                        </div>
                        <AddInstituteAdminDialog />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instituteAdmins.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white dark:bg-card rounded-2xl border border-dashed shadow-sm">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No Institutes Registered</h3>
                                <p className="text-muted-foreground mb-4">Get started by creating your first institute admin account.</p>
                            </div>
                        ) : (
                            instituteAdmins.map(admin => {
                                const stats = instituteStats[admin.user_metadata.institute_code] || { students: 0, teachers: 0 }
                                const instituteData = institutes.find(inst => inst.code === admin.user_metadata.institute_code);
                                const status = instituteData ? instituteData.status : 'active';
                                const instituteCode = admin.user_metadata.institute_code || ""

                                return (
                                    <InstituteCard
                                        key={admin.id}
                                        admin={admin}
                                        stats={stats}
                                        initialStatus={status}
                                        instituteCode={instituteCode}
                                    />
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
=======
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ShieldCheck, LogOut, LayoutDashboard, Users, GraduationCap, ArrowRight, Activity, Search } from "lucide-react"
import { AddInstituteAdminDialog } from "./add-institute-admin-dialog"
import { Input } from "@/components/ui/input"
import { InstituteStatusToggle } from "./institute-status-toggle"
import { InstituteCard } from "./institute-card"

export default async function SuperAdminDashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata.role !== 'super_admin') {
        redirect('/auth/login')
    }

    const adminClient = createAdminClient()

    // Fetch all users AND institutes status
    // Using Promise.all for efficiency
    const [usersResult, institutesResult] = await Promise.all([
        adminClient.auth.admin.listUsers({ perPage: 2000 }),
        adminClient.from('institutes').select('*')
    ])

    const users = usersResult.data.users
    const institutes = institutesResult.data || []

    if (usersResult.error) {
        console.error("Error fetching users:", usersResult.error)
        return <div className="p-8 text-center text-red-500">Error loading dashboard data. Please check logs.</div>
    }

    const instituteAdmins = users.filter(u => u.user_metadata.role === 'institute_admin')

    // Create a map for quick status lookup by code
    const instituteStatusMap = institutes.reduce((acc, inst) => {
        acc[inst.code] = inst.status
        return acc
    }, {} as Record<string, string>)

    // Calculate Stats per Institute
    const instituteStats = users.reduce((acc, currentUser) => {
        const code = currentUser.user_metadata.institute_code
        if (!code) return acc

        if (!acc[code]) {
            acc[code] = { students: 0, teachers: 0 }
        }

        if (currentUser.user_metadata.role === 'student') {
            acc[code].students++
        } else if (currentUser.user_metadata.role === 'teacher') {
            acc[code].teachers++
        }

        return acc
    }, {} as Record<string, { students: number, teachers: number }>)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">NeuroNxt <span className="text-foreground font-medium">Admin</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end text-sm">
                            <span className="font-semibold text-foreground">{user.user_metadata.full_name || "Super Admin"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <form action={async () => {
                            "use server"
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            redirect('/auth/login')
                        }}>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="container mx-auto py-8 space-y-8 px-4">

                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Total Institutes</CardTitle>
                            <Building2 className="h-4 w-4 text-white/80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{instituteAdmins.length}</div>
                            <p className="text-xs text-indigo-100 mt-1">Registered Organizations</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white dark:bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {Object.values(instituteStats).reduce((a, b) => a + b.students, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Across all institutes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white dark:bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
                            <GraduationCap className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {Object.values(instituteStats).reduce((a, b) => a + b.teachers, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Faculty members</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Institute Management Section */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Institutes</h2>
                            <p className="text-muted-foreground">Manage and monitor all registered educational institutes.</p>
                        </div>
                        <AddInstituteAdminDialog />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instituteAdmins.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white dark:bg-card rounded-2xl border border-dashed shadow-sm">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No Institutes Registered</h3>
                                <p className="text-muted-foreground mb-4">Get started by creating your first institute admin account.</p>
                            </div>
                        ) : (
                            instituteAdmins.map(admin => {
                                const stats = instituteStats[admin.user_metadata.institute_code] || { students: 0, teachers: 0 }
                                const instituteData = institutes.find(inst => inst.code === admin.user_metadata.institute_code);
                                const status = instituteData ? instituteData.status : 'active';
                                const instituteCode = admin.user_metadata.institute_code || ""

                                return (
                                    <InstituteCard
                                        key={admin.id}
                                        admin={admin}
                                        stats={stats}
                                        initialStatus={status}
                                        instituteCode={instituteCode}
                                    />
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
>>>>>>> 8c01869 (Chat Page 99% Completed)
