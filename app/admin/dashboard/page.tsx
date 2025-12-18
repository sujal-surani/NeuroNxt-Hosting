import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, UserPlus, Users, GraduationCap, Building, LogOut, Mail, ShieldAlert } from "lucide-react"
import { AddTeacherDialog } from "./add-teacher-dialog"
import { StudentActionButtons } from "./student-action-buttons"
import { DeleteUserButton } from "./delete-user-button"
import { formatBranchName } from "@/lib/utils"

import { AdminPostNoticeButton } from "./admin-post-notice-button"
import { EditStudentDialog } from "./edit-student-dialog"
import { PausedWarningModal } from "./paused-warning-modal"

export default async function AdminDashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata.role !== 'institute_admin') {
        redirect('/auth/login')
    }

    const instituteCode = user.user_metadata.institute_code
    const adminClient = createAdminClient()

    const { data: institute } = await supabase
        .from('institutes')
        .select('status')
        .eq('code', instituteCode)
        .single()

    const isPaused = institute?.status === 'paused'

    // Fetch all users (limit 1000 for now)
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
        console.error("Error fetching users:", error)
        return <div>Error loading dashboard</div>
    }

    // Filter users by institute code
    const instituteUsers = users.filter(u => u.user_metadata.institute_code === instituteCode)

    // Filter students: Must match role, status, AND have a confirmed email
    const pendingStudents = instituteUsers.filter(u => u.user_metadata.role === 'student' && u.user_metadata.status === 'pending' && u.email_confirmed_at)
    const activeStudents = instituteUsers.filter(u => u.user_metadata.role === 'student' && u.user_metadata.status === 'active' && u.email_confirmed_at)
    const teachers = instituteUsers.filter(u => u.user_metadata.role === 'teacher')

    return (
        <div className="min-h-screen bg-background/50">
            <div className="container mx-auto py-10 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Institute Dashboard</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building className="w-4 h-4" />
                            <span>Institute Code: <span className="font-mono font-medium text-foreground">{instituteCode}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isPaused && <AdminPostNoticeButton />}
                        <div className="text-sm text-right hidden md:block">
                            <div className="font-medium">{user.user_metadata.full_name || "Admin"}</div>
                            <div className="text-muted-foreground">{user.email}</div>
                        </div>
                        <form action={async () => {
                            "use server"
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            redirect('/auth/login')
                        }}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Paused Warning Banner */}
                {isPaused && (
                    <>
                        <PausedWarningModal isPaused={isPaused} />
                        <div className="bg-destructive/15 border-destructive/50 text-destructive dark:border-destructive border p-4 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="p-2 bg-destructive/10 rounded-full">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Institute Access Paused</h3>
                                <p className="text-sm opacity-90">
                                    This institute has been temporarily paused by the platform administrator.
                                    Management actions (adding/editing/deleting users) are currently disabled.
                                    Access for students and teachers has been restricted.
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{activeStudents.length}</div>
                            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Active students enrolled</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Pending Approvals</CardTitle>
                            <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">{pendingStudents.length}</div>
                            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Students waiting for review</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-100 dark:border-emerald-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Total Teachers</CardTitle>
                            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{teachers.length}</div>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Faculty members registered</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="pending" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="teachers">Teachers</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-primary" />
                                    Pending Student Approvals
                                </CardTitle>
                                <CardDescription>Review and approve new student registrations.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pendingStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                        <CheckCircle className="w-12 h-12 mb-4 text-muted-foreground/50" />
                                        <p className="text-lg font-medium">All caught up!</p>
                                        <p className="text-sm">No pending student approvals at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingStudents.map(student => (
                                            <div key={student.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                        {student.user_metadata.full_name?.[0] || "S"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-lg">{student.user_metadata.full_name}</div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Mail className="w-3 h-3" /> {student.email}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="outline" className="bg-background">
                                                                {formatBranchName(student.user_metadata.branch)}
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-background">
                                                                Sem {student.user_metadata.semester}
                                                            </Badge>
                                                            <Badge variant="secondary" className="font-mono">
                                                                {student.user_metadata.enrollment_number}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isPaused && (
                                                    <StudentActionButtons
                                                        studentId={student.id}
                                                        studentName={student.user_metadata.full_name}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="teachers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold tracking-tight">Faculty Members</h2>
                            {!isPaused && <AddTeacherDialog instituteCode={instituteCode} />}
                        </div>
                        <Card>
                            <CardContent className="pt-6">
                                {teachers.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No teachers found</p>
                                        <p className="text-sm">Add your first teacher to get started.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {teachers.map(teacher => (
                                            <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                        {teacher.user_metadata.full_name?.[0] || "T"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{teacher.user_metadata.full_name}</div>
                                                        <div className="text-sm text-muted-foreground">{teacher.email}</div>
                                                        <div className="text-xs text-muted-foreground mt-1 font-medium text-indigo-600 dark:text-indigo-400">
                                                            {formatBranchName(teacher.user_metadata.branch)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">Active</Badge>
                                                    {!isPaused && (
                                                        <DeleteUserButton
                                                            userId={teacher.id}
                                                            userName={teacher.user_metadata.full_name}
                                                            userRole="Teacher"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="students" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Enrolled Students</CardTitle>
                                <CardDescription>List of all active students in your institute.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activeStudents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No active students</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeStudents.map(student => (
                                            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                                        {student.user_metadata.full_name?.[0] || "S"}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{student.user_metadata.full_name}</div>
                                                        <div className="text-sm text-muted-foreground">{student.email}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {formatBranchName(student.user_metadata.branch)} • Sem {student.user_metadata.semester} • {student.user_metadata.enrollment_number}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Enrolled</Badge>
                                                    {!isPaused && (
                                                        <>
                                                            <EditStudentDialog student={student} />
                                                            <DeleteUserButton
                                                                userId={student.id}
                                                                userName={student.user_metadata.full_name}
                                                                userRole="Student"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div >
        </div >
    )
}
