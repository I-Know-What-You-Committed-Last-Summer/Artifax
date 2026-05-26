namespace Artifax.Models
{
    public class ItemIngredient
    {
        public int ItemIngredientID { get; set; }
        public int ProductID { get; set; } //FK
        public int IngredientID { get; set; } //FK
        public int IngredientQuantity { get; set; }
        public Item ProductItem { get; set; }
        public Item IngredientItem { get; set; }
    }
}