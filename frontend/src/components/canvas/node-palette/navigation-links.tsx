import { LayoutGrid, History, Sparkles } from 'lucide-react';
import { NavItem } from './nav-item';

export const NavigationLinks = ({
    id,
    sidebarCollapsed,
    handleCreateExample
}: {
    id?: string,
    sidebarCollapsed: boolean,
    handleCreateExample: () => void
}) => (
    <>
        <NavItem
            to="/workflows"
            icon={<LayoutGrid className="h-4 w-4" />}
            label="All Workflows"
            sidebarCollapsed={sidebarCollapsed}
        />

        {id && (
            <div className="flex flex-col gap-1 border-t border-border/5 pt-2 mt-1">
                <NavItem
                    to={`/workflows/${id}/history`}
                    icon={<History className="h-4 w-4" />}
                    label="Archives"
                    sidebarCollapsed={sidebarCollapsed}
                />
                <NavItem
                    onClick={handleCreateExample}
                    icon={<Sparkles className="h-4 w-4 text-primary" />}
                    label="Generate AI Workflow"
                    className="hover:bg-primary/5 hover:text-primary"
                    sidebarCollapsed={sidebarCollapsed}
                />
            </div>
        )}
    </>
);
