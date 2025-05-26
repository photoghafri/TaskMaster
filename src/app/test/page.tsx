export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">If you can see this, the server is running properly!</p>
      <p className="text-sm text-gray-500">Current time: {new Date().toLocaleString()}</p>
    </div>
  );
} 