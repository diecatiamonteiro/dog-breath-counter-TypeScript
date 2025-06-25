export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard Page</h1>
      <p>This is the dashboard page</p>
      {/* Footer Section - only visible until lg; from lg it's placed in the footer in NavigationDesktop.tsx */}
      <div className="mt-8 py-2 border-t border-primary/20 lg:hidden">
        <div className="text-xs text-foreground/70 text-left">
          <p>&copy; 2025 Paw Pulse. All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
