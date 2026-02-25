// DuomiSteve Avatar Component for Web
// 8x8 conceptual grid for face
// Skin: #F0A57C, Hair: #4A3020, Eyes: #3B82F6, Glasses: #000000 (with opacity or just black rims)
export const DuomiSteve = ({ className = "w-32 h-32" }: { className?: string }) => (
  <svg viewBox="0 0 8 8" className={`${className} bg-[#F0A57C]`} shapeRendering="crispEdges">
    {/* Hair */}
    <path d="M0 0h8v2H0z" fill="#4A3020" />
    <path d="M0 2h1v1H0zM7 2h1v1H7z" fill="#4A3020" />
    
    {/* Eyes */}
    <path d="M1 3h2v1H1zM5 3h2v1H5z" fill="#FFFFFF" />
    <path d="M2 3h1v1H2zM6 3h1v1H6z" fill="#3B82F6" />
    
    {/* Glasses (Black Rim) */}
    <path d="M1 3h2v1H1zM5 3h2v1H5z" fill="none" stroke="#000" strokeWidth="0.5" />
    <path d="M3 3.5h2" stroke="#000" strokeWidth="0.5" />
    
    {/* Mouth */}
    <path d="M2 6h4v1H2z" fill="#8B4513" />
  </svg>
);
