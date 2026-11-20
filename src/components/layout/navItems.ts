export interface NavItem {
  href: string;
  label: string;
  icon: string;
  group: string;
}

export const NAV_GROUPS = ['Gestión', 'Torneo', 'Competencia', 'Sistema'] as const;

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', icon: 'home', group: 'Gestión' },
  { href: '/jugadores', label: 'Jugadores', icon: 'group', group: 'Gestión' },
  { href: '/equipos', label: 'Equipos', icon: 'shield', group: 'Torneo' },
  { href: '/clasificacion', label: 'Clasificación', icon: 'trending_up', group: 'Torneo' },
  { href: '/rankings', label: 'Rankings', icon: 'military_tech', group: 'Torneo' },
  { href: '/campeonato', label: 'Configuración del campeonato', icon: 'tune', group: 'Competencia' },
  { href: '/comparacion', label: 'Comparación de equipos', icon: 'bar_chart', group: 'Competencia' },
  { href: '/historial', label: 'Historial', icon: 'history', group: 'Competencia' },
  { href: '/configuracion', label: 'Configuración', icon: 'settings', group: 'Sistema' },
];
