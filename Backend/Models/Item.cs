namespace Artifax.Models
{
    public class Item
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; }
        public string ItemCategory { get; set; }
        public int ProductionTime { get; set; }

        public ICollection<BranchItemCapacity> BranchItemCapacities { get; set; }


        //I believe we need two as it is a FK on the other field twice.
        //TODO: Complete this: https://stackoverflow.com/questions/28570916/defining-multiple-foreign-key-for-the-same-table-in-entity-framework-code-first
        public ICollection<ItemIngredient> ProductItemIngredients { get; set; }
        public ICollection<ItemIngredient> IngredientItemIngredients { get; set; }

    }
}