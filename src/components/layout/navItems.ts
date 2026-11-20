import type { IconType } from 'react-icons';
import {
  FiAward,
  FiBarChart2,
  FiSettings,
  FiClock,
  FiShield,
  FiHome,
  FiSliders,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  group: string;
}

export const NAV_GROUPS = ['Gestión', 'Torneo', 'Competencia', 'Sistema'] as const;

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', icon: FiHome, group: 'Gestión' },
  { href: '/jugadores', label: 'Jugadores', icon: FiUsers, group: 'Gestión' },
  { href: '/equipos', label: 'Equipos', icon: FiShield, group: 'Torneo' },
  { href: '/clasificacion', label: 'Clasificación', icon: FiTrendingUp, group: 'Torneo' },
  { href: '/rankings', label: 'Rankings', icon: FiAward, group: 'Torneo' },
  { href: '/campeonato', label: 'Configuración del campeonato', icon: FiSliders, group: 'Competencia' },
  { href: '/comparacion', label: 'Comparación de equipos', icon: FiBarChart2, group: 'Competencia' },
  { href: '/historial', label: 'Historial', icon: FiClock, group: 'Competencia' },
  { href: '/configuracion', label: 'Configuración', icon: FiSettings, group: 'Sistema' },
];
