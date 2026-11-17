import type { IconType } from 'react-icons';
import {
  FiBarChart2,
  FiCheckSquare,
  FiClipboard,
  FiSettings,
  FiClock,
  FiShield,
  FiHome,
  FiUsers,
} from 'react-icons/fi';

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: FiHome },
  { href: '/jugadores', label: 'Jugadores', icon: FiUsers },
  { href: '/votacion', label: 'Votación de niveles', icon: FiCheckSquare },
  { href: '/campeonato', label: 'Configuración del campeonato', icon: FiShield },
  { href: '/seleccion', label: 'Selección de equipos', icon: FiClipboard },
  { href: '/comparacion', label: 'Comparación de equipos', icon: FiBarChart2 },
  { href: '/historial', label: 'Historial', icon: FiClock },
  { href: '/configuracion', label: 'Configuración', icon: FiSettings },
];
