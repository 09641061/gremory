export default function WelcomePage() {
  return (
    <div className="flex h-full items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">Configure your account to get started</p>
      </div>
    </div>
  );
}
