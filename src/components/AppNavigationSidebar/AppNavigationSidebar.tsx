import { Link, useLocation } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/Collapsible';
import { 
  ChevronDown,
  Download, 
  Image,
  InfoIcon, 
  LogOut, 
  PanelsTopLeft, 
  Settings2,
  ToyBrick, 
  Waypoints 
} from 'lucide-react';
import { 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/ui/Sidebar';

import './AppNavigationSidebar.css';

const NAV_ITEMS = [
  { to: '/images',   icon: Image,   label: 'Images'   },
  { to: '/annotate', icon: PanelsTopLeft, label: 'Workspace' },
  { to: '/graph',    icon: Waypoints, label: 'Knowledge Graph' },
  { to: '/model',    icon: ToyBrick,  label: 'Data Model' },
  { to: '/export',   icon: Download,  label: 'Export'   },
  { to: '/settings', icon: Settings2, label: 'Settings' },
];

const ABOUT_ITEMS = [
  { to: '/about',  label: 'IMMARKUS' },
  { to: '/markus', label: 'X-MARKUS' },
  { href: 'https://github.com/rsimon/immarkus/wiki', label: 'Help' },
];

interface Props {
  openImageCount?: number;
}

export const AppNavigationSidebar = ({ openImageCount = 0 }: Props) => {
  const { pathname } = useLocation();

  return (
    <aside
      className="main-nav flex flex-col justify-between relative min-w-62 [&>div]:bg-[#f1f5f9] overflow-y-auto">
      <div>
        <SidebarHeader className="text-imarkus font-medium text-xl p-4">
          <button
            className="font-[Lexend] text-left px-1.5"
            onClick={() => location.href = '/'}>
            IMMARKUS
          </button>
        </SidebarHeader>

        <SidebarContent className="p-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(to)}>
                      <Link to={to}>
                        <Icon />
                        {label}
                        {label === 'Workspace' && openImageCount > -1 && (
                          <SidebarMenuBadge>{openImageCount}</SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                <Collapsible 
                  defaultOpen
                  className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <InfoIcon />
                        About
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {ABOUT_ITEMS.map(({ to, href, label }) => (
                          <SidebarMenuSubItem key={label}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={to ? pathname === to : false}>
                              {href
                                ? <a href={href} target="_blank" rel="noreferrer">{label}</a>
                                : <Link to={to!}>{label}</Link>}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>

      <SidebarFooter>
        <button
          className="flex items-center p-2.5"
          onClick={() => location.href = '/'}>
          <LogOut size={18} className="mr-2" /> Exit
        </button>
      </SidebarFooter>
    </aside>
  );
};