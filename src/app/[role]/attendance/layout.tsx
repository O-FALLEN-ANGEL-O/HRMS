
export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Manage your check-in, check-out, and track your attendance log.</p>
      </div>
      {children}
    </div>
  );
}
