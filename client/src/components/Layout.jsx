import Sidebar from "./Sidebar";
export default function Layout(_a) {
    var children = _a.children;
    return (<div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>);
}
