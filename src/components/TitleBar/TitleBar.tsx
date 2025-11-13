import { Minus, Square, X } from 'lucide-react';

export function TitleBar() {
  const handleMinimize = () => {
    (window as any).electron.windowControl('minimize');
  };

  const handleMaximize = () => {
    (window as any).electron.windowControl('maximize');
  };

  const handleClose = () => {
    (window as any).electron.windowControl('close');
  };

  return (
    <div className="h-8 bg-background border-b flex items-center justify-between select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center px-3 gap-2">
        <span className="text-sm font-semibold">PostBoy</span>
      </div>
      
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className="h-8 w-12 hover:bg-accent flex items-center justify-center transition-colors"
          title="最小化"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-12 hover:bg-accent flex items-center justify-center transition-colors"
          title="最大化"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="h-8 w-12 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
          title="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
