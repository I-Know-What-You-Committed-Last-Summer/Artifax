import React, { FC, useState, useEffect } from 'react';
import './blueprintPanel.css';
import unitIcon from '../../../../assets/images/uniitIcon.png';
import { Blueprint, BlueprintMaterial } from '../craftingData';

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
}

const categories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
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
  onSelectBlueprint
}) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch blueprints from API on component mount.
   * This effect runs once when the component is first loaded.
   */
  useEffect(() => {
    fetchBlueprintsFromApi();
  }, []);

  /**
   * Auto-select the first blueprint when blueprints are loaded.
   * This ensures the user always sees a blueprint without needing to manually select one.
   */
  useEffect(() => {
    if (blueprints.length > 0 && !selectedBlueprintId) {
      // Automatically select the first blueprint in the list
      onSelectBlueprint(blueprints[0].id);
    }
  }, [blueprints, selectedBlueprintId, onSelectBlueprint]);

  /**
   * Fetches blueprint data from the backend.
   * 
   * Process:
   * - Only calls: GET /api/Item/itemIngredient/item/{itemId}
   * - This endpoint returns the recipe/ingredients needed to craft a specific item
   * - Example: To craft "Circuit Board", it returns 5x "Resistor" and 3x "Capacitor"
   * - Creates Blueprint objects from the ingredient data returned
   */
  const fetchBlueprintsFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate item IDs to fetch blueprints for (1 through 10)
      // This will attempt to fetch blueprints from the itemIngredient endpoint for each ID
      const itemIds = Array.from({ length: 10 }, (_, i) => i + 1);

      // Fetch blueprints for all item IDs in parallel
      // We use Promise.allSettled() to continue even if some requests fail
      const results = await Promise.allSettled(
        itemIds.map(async (itemID) => {
          try {
            // Call the itemIngredient endpoint to get the recipe for this item
            const ingredientsResponse = await fetch(
              `http://localhost:5253/api/Item/itemIngredient/item/${itemID}`
            );

            // If no data exists for this item ID, skip it
            if (!ingredientsResponse.ok) {
              return null;
            }

            const ingredients: IngredientBlueprint[] = await ingredientsResponse.json();
            
            // Skip if no ingredients returned
            if (!ingredients || ingredients.length === 0) {
              return null;
            }

            // Extract category from the first ingredient
            const category = ingredients[0]?.itemCategory?.toLowerCase() || 'mechanical';

            // Create a blueprint from the ingredients data
            const blueprint: Blueprint = {
              id: `bp-${itemID}`,
              name: `Item ${itemID}`,
              description: 'Recipe Blueprint',
              category: category as any,
              have: 0,
              craft: 0,
              materials: ingredients.map((ing) => ({
                name: ing.itemName,
                need: ing.quantity,
                have: 0,
              })),
            };

            return blueprint;
          } catch (err) {
            console.error(`Error fetching blueprint for item ${itemID}:`, err);
            return null;
          }
        })
      );

      // Filter out null results and extract successful blueprints
      const blueprints = results
        .filter((result) => result.status === 'fulfilled' && result.value !== null)
        .map((result) => (result as PromiseFulfilledResult<Blueprint>).value);

      setBlueprints(blueprints);
      console.log('app fetched blueprints', blueprints);
    } catch (err) {
      // If fetch fails completely, display the error to the user
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching blueprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlueprints = filter === 'all'
    ? blueprints
    : blueprints.filter((blueprint) => blueprint.category === filter as any);

  return (
    <div className="blueprint-panel">
      <div className="blueprint-header">
        <h3>Blueprints</h3>
        <div className="blueprint-filter">
          <label htmlFor="blueprintFilter">Filter Blueprints</label>
          <select id="blueprintFilter" value={filter} onChange={(e) => onFilterChange(e.target.value)}>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="blueprint-loading">Loading blueprints...</div>}
      {error && <div className="blueprint-error">Error: {error}</div>}

      <div className="blueprint-list">
        {filteredBlueprints.map((blueprint) => {
          const craftable = computeCraftable(blueprint.materials);
          const isDisabled = craftable === 0;
          const cardClass = `blueprint-card ${selectedBlueprintId === blueprint.id ? 'active' : ''} ${isDisabled ? 'cant-craft' : ''}`;

          return (
            <button
              key={blueprint.id}
              type="button"
              className={cardClass}
              onClick={() => !isDisabled && onSelectBlueprint(blueprint.id)}
              disabled={isDisabled}
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
        <button type="button" className="blueprint-new-btn">New Blueprint</button>
      </div>
    </div>
  );
};

export default BlueprintPanel;
