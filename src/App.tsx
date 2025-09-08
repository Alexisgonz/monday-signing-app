import DocumentPage from "./pages/document view";

export default function App() {
  // Puedes tomar el id de la URL, de props, etc.
  const documentId = 'abc123'; // <-- reemplaza por uno real

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 border-b bg-white">
        <h1 className="text-lg font-semibold">Visor de Documento</h1>
      </header>

      <DocumentPage documentId={documentId} />
    </div>
  );
}