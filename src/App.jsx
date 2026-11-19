import { useState } from 'react';
import HomePage from './features/home/HomePage';
import WorkspacePlaceholder from './features/workspaces/WorkspacePlaceholder';
import BaselineWorkspace from './features/value-chain/baseline/BaselineWorkspace';

export default function App() {
  const [workspace, setWorkspace] = useState(null);

  const openSubcategory = (category, subcategory) => {
    if (category.id === 'value-chain' && subcategory === 'Tea Small holder Baseline') {
      setWorkspace({ type: 'Tea Small holder Baseline', category, subcategory });
      return;
    }

    setWorkspace({ type: 'placeholder', category, subcategory });
  };

  if (!workspace) {
    return <HomePage onSelectSubcategory={openSubcategory} />;
  }

  if (workspace.type === 'Tea Small holder Baseline') {
    return <BaselineWorkspace onBack={() => setWorkspace(null)} />;
  }

  return (
    <WorkspacePlaceholder
      category={workspace.category}
      subcategory={workspace.subcategory}
      onBack={() => setWorkspace(null)}
    />
  );
}
