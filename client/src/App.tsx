function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Vite + React + Tailwind</h1>
      <p className="text-lg">
        🚀 Your setup is working! Edit <code className="font-mono">src/App.tsx</code> to get started.
      </p>
      <button
        onClick={() => alert("Button clicked!")}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
      >
        Test Button
      </button>
    </div>
  );
}

export default App;
