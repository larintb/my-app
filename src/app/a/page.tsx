// Admin routes will be handled here
// This will redirect to /a/admin for superuser
// Or handle business admin token registration

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}