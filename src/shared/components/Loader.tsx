import React from "react";

type LoaderProps = {
  scale?: number;
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const Loader = ({
  scale = 1,
  fullScreen = true,
  text = "Aguarde un momento...",
  className = ""
}:LoaderProps) => {
    const containerStyle: React.CSSProperties = fullScreen
      ? { minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: `${scale * 10}px`, gap: '1em' }
      : { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: `${scale * 10}px`, gap: '1em' };

  return (
        <div className={`${fullScreen ? 'coverBack' : ''} ${className}`}>
      <div style={containerStyle}>
        {text && <h2 className='loaderFont' style={{ fontSize: `${scale * 2}rem`, margin: 0 }}>{text}</h2>}
        <div className="loader-container">
    {/* <div style={{display:'flex', flexDirection:'row', justifyContent:'center',alignItems:'center', height:'100vh', width: '100vw'}}> */}
      <div className="loader">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Loader;
