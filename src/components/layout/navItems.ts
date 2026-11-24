export interface NavItem {
  href: string;
  label: string;
  icon: string;
  group: string;
}

export const NAV_GROUPS = ['Gestión', 'Torneo', 'Sistema'] as const;

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', icon: 'home', group: 'Gestión' },
  { href: '/jugadores', label: 'Jugadores', icon: 'group', group: 'Gestión' },
  { href: '/equipos', label: 'Equipos', icon: 'shield', group: 'Torneo' },
  { href: '/clasificacion', label: 'Clasificación', icon: 'trending_up', group: 'Torneo' },
  { href: '/rankings', label: 'Rankings', icon: 'military_tech', group: 'Torneo' },
  { href: '/configuracion', label: 'Configuración', icon: 'settings', group: 'Sistema' },
];
