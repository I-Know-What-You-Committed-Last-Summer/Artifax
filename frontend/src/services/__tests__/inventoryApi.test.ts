import { getItemCategoryOptions } from '../inventoryApi';

describe('getItemCategoryOptions', () => {
  it('deduplicates, trims, filters blanks, and sorts categories', () => {
    const items = [
      { ItemCategory: 'Furniture' },
      { ItemCategory: '  Metals  ' },
      { ItemCategory: 'Furniture' },
      { ItemCategory: '' },
      { ItemCategory: '   ' },
    ];

    expect(getItemCategoryOptions(items)).toEqual(['Furniture', 'Metals']);
  });
});