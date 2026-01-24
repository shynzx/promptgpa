export default function Header() {
  return (
    <header className="w-full  py-4 shadow-sm mb-6">
      <div className="max-w-2xl mx-auto px-5 flex items-center justify-center gap-3">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="w-10 h-10" 
        />
        <h1 className="text-2xl font-normal m-0">PromptGPA</h1>
      </div>
    </header>
  );
}
