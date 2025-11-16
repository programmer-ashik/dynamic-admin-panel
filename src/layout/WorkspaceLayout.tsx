import { Topbar } from '../components/shell/Topbar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import { Sidebar } from '../components/shell/Sidebar';
import { Outlet } from 'react-router-dom';
import { RightPanel } from '../components/shell/RightPanel';
import { AIPane } from '../components/ai/AIPane';
import { useEffect, useRef } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const WorkspaceLayout = () => {
  const rightPanelOpen = useSelector((state: RootState) => state.global.rightPanelOpen);
  const sidebarCollapsed = useSelector((state: RootState) => state.global.sidebarCollapsed);
  const aiPaneOpen = useSelector((state: RootState) => state.global.aiPanelOpen);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  // Collapse/expand left panel
  useEffect(() => {
    if (leftPanelRef.current) {
      if (sidebarCollapsed) {
        leftPanelRef.current.resize(5); // Collapsed to ~5%
      } else {
        leftPanelRef.current.resize(18); // Expanded to default
      }
    }
  }, [sidebarCollapsed]);
  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          ref={leftPanelRef}
          defaultSize={18}
          minSize={5}
          maxSize={30}
          collapsible
          collapsedSize={5}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={rightPanelOpen ? 56 : 82}>
          <div className="h-full overflow-auto">
            <Outlet />
          </div>
        </ResizablePanel>

        {rightPanelOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel ref={rightPanelRef} defaultSize={26} minSize={20} maxSize={40}>
              {/* <RightPanel /> */}
              <p>This is right palane</p>
            </ResizablePanel>
          </>
        )}

        {aiPaneOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={24} minSize={20} maxSize={35}>
              {/* <AIPane currentFilter={undefined} /> */}
              <p>Ai Panale</p>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default WorkspaceLayout;
