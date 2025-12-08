const AuthBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-sidebar">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-transparent" />
      
      {/* Colored glow effects */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px]" />
      
      {/* Top dark gradient */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-sidebar via-sidebar/90 to-transparent" />
    </div>
  );
};

export default AuthBackground;
