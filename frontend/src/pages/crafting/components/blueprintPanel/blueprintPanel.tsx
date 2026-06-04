import React, { FC, useState, useEffect } from 'react';
import './blueprintPanel.css';
import unitIcon from '../../../../assets/images/uniitIcon.png';
import { Blueprint, BlueprintMaterial } from '../craftingData';
import FilterSelect from '../../../../components/common/FilterSelect';
import { useApi } from '../../../../hooks';

interface Category {
  id: string;
  label: string;
}

interface IngredientBlueprint {
  ingredientID: number;
  itemName: string;
  itemCategory: string;
  quantity: number;
}

interface BlueprintPanelProps {
  selectedBlueprintId: string;
  filter: string;
  onFilterChange: (filter: string) => void;
  onSelectBlueprint: (blueprintId: string) => void;
  onCreateBlueprint: () => void;
}

const categories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'metal', label: 'Metal' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'other', label: 'Other' },
];

const computeCraftable = (materials: BlueprintMaterial[]): number => {
  if (!materials || materials.length === 0) return 0;
  return materials.reduce((minValue, material) => {
    const count = Math.floor(material.have / material.need);
    return Math.min(minValue, count);
  }, Infinity) || 0;
};

const BlueprintPanel: FC<BlueprintPanelProps> = ({ 
  selectedBlueprintId, 
  filter, 
  onFilterChange, 
  onSelectBlueprint,
  onCreateBlueprint,
}) => {
  const api = useApi();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch blueprints from API on component mount.
   */
  useEffect(() => {
    fetchBlueprintsFromApi();
  }, []);

  /**
   * Auto-select the first blueprint when blueprints are loaded.
   */
  useEffect(() => {
    if (blueprints.length > 0 && !selectedBlueprintId) {
      // Automatically select the first blueprint in the list
      onSelectBlueprint(blueprints[0].id);
    }
  }, [blueprints, selectedBlueprintId, onSelectBlueprint]);

  /**
   * Fetches blueprint data from the backend.

   */
  const fetchBlueprintsFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all blueprint items from the backend endpoint.
      // The backend returns items and their ingredients together.
      const response = await api.get('/Item/item/allItemBlueprints');
      const apiBlueprints = response.data;

      // Also fetch inventory (items + branch quantities) so we can populate "have" values
      const [itemsResp, branchResp] = await Promise.all([
        api.get('/Item/item'),
        api.get('/Item/Branch')
      ]);

      let inventoryMap: Record<string, number> = {};
      const items = itemsResp.data;
      const branchItems = branchResp.data;

      // map itemID -> itemName
      const idToName: Record<number, string> = {};
      items.forEach((it: any) => { idToName[it.itemID] = it.itemName; });

      // sum quantities by itemName across branches
      branchItems.forEach((bic: any) => {
        const name = idToName[bic.itemID];
        if (!name) return;
        inventoryMap[name] = (inventoryMap[name] || 0) + (bic.itemQuantity || 0);
      });

      // Map API shape into our local Blueprint type.
      const blueprints: Blueprint[] = apiBlueprints.map((item: any) => {
        const rawCategory = (item.itemCategory ?? 'other').toLowerCase();
        // Map to valid categories
        let normalizedCategory = 'other';
        if (rawCategory.includes('metal')) normalizedCategory = 'metal';
        else if (rawCategory.includes('mechanical')) normalizedCategory = 'mechanical';
        else if (rawCategory.includes('electronics')) normalizedCategory = 'electronics';
        else if (rawCategory.includes('furniture')) normalizedCategory = 'furniture';

        const materials = (item.ingredients ?? item.Ingredients ?? []).map((ing: any) => ({
          name: ing.itemName,
          need: ing.quantity,
          have: inventoryMap[ing.itemName] || 0,
        }));

        return {
          id: `bp-${item.itemID}`,
          name: item.itemName,
          description: `Production time: ${item.productionTime}s`,
          category: normalizedCategory as any,
          have: inventoryMap[item.itemName] || 0,
          craft: 0,
          materials,
        } as Blueprint;
      });

      // Store the mapped blueprints in local component state.
      setBlueprints(blueprints);
      // console.log('app fetched blueprints', blueprints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching blueprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlueprints = filter === 'all'
    ? blueprints
    : blueprints.filter((blueprint) => blueprint.category === filter);

  return (
    <div className="blueprint-panel">
      <div className="blueprint-header">
        <h3>Blueprints</h3>
        <div className="blueprint-filter">
          <label htmlFor="blueprintFilter">Filter Blueprints</label>
          <FilterSelect
            value={filter}
            onChange={onFilterChange}
            ariaLabel="Blueprint filter"
            options={categories.map((option) => ({ label: option.label, value: option.id }))}
          />
        </div>
      </div>

      {loading && <div className="blueprint-loading">Loading blueprints...</div>}
      {error && <div className="blueprint-error">Error: {error}</div>}

      <div className="blueprint-list">
        {filteredBlueprints.map((blueprint) => {
          const craftable = computeCraftable(blueprint.materials);
          const cardClass = `blueprint-card ${selectedBlueprintId === blueprint.id ? 'active' : ''} ${craftable === 0 ? 'cant-craft' : ''}`;

          return (
            <button
              key={blueprint.id}
              type="button"
              className={cardClass}
              onClick={() => onSelectBlueprint(blueprint.id)}
            >
              <div className="blueprint-card-main">
                <img src={unitIcon} alt="Blueprint icon" className="blueprint-card-icon" />
                <div>
                  <h4>{blueprint.name}</h4>
                </div>
              </div>
              <div className="blueprint-card-meta">
                <div className="meta-block">
                  <span className="meta-label">Have</span>
                  <strong>{blueprint.have}</strong>
                </div>
                <div className="meta-block">
                  <span className="meta-label">Craft</span>
                  <strong>{craftable}</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="blueprint-actions">
        <button type="button" className="blueprint-new-btn" onClick={onCreateBlueprint}>New Blueprint</button>
      </div>
    </div>
  );
};

export default BlueprintPanel;
