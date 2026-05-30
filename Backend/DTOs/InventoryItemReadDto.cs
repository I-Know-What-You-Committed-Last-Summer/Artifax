using Artifax.Models;

namespace Artifax.DTOs
{
    public class InventoryItemReadDto
    {
        public int InventoryItemId { get; set; }
        public string InventoryItemName { get; set; }
        public string InventoryItemCategory { get; set; }
        public int InventoryItemProductionTime { get; set; }
        public int InventoryItemQuantity { get; set; }
        public string InventoryItemBranchName { get; set;}
        public InventoryItemReadDto(Item item, Branch branch, BranchItemCapacity capacity)
        {
            InventoryItemId = item.ItemID;
            InventoryItemName = item.ItemName;
            InventoryItemCategory = item.ItemCategory;
            InventoryItemProductionTime = item.ProductionTime;
            InventoryItemQuantity = capacity.ItemQuantity;
            InventoryItemBranchName = branch.BranchName;
        }
    }
}