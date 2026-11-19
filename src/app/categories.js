import { Bird, Boxes, Leaf, Sprout, Sun } from 'lucide-react';

// Keep category and subcategory navigation in one place for future expansion.
export const categories = [
  {
    id: 'biodiversity',
    name: 'Biodiversity',
    description: 'Explore biodiversity monitoring and field records.',
    icon: Bird,
    subcategories: ['Biodiversity_sub1', 'Biodiversity_sub2'],
  },
  {
    id: 'slm-activities',
    name: 'SLM activities',
    description: 'Browse sustainable land management activities.',
    icon: Leaf,
    subcategories: ['SLM activities_sub1', 'SLM activities_sub2'],
  },
  {
    id: 'agroforestry',
    name: 'agroforestry',
    description: 'Organize agroforestry projects and observations.',
    icon: Sprout,
    subcategories: ['agroforestry_sub1', 'agroforestry_sub2'],
  },
  {
    id: 'energy',
    name: 'energy',
    description: 'Track energy-related project information.',
    icon: Sun,
    subcategories: ['energy_sub1', 'energy_sub2'],
  },
  {
    id: 'value-chain',
    name: 'value chain',
    description: 'Review value-chain workspaces.',
    icon: Boxes,
    subcategories: ['Tea Small holder Baseline', 'Value chain_sub1', 'Value chain_sub2'],
  },
];
