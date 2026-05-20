namespace Artifax.Models
{
    public class ItemIngredient
    {
        public int ItemIngredientID { get; set; }
        public int ProductID { get; set; } 
        public int IngredientID { get; set; } 
        public int IngredientQuantity { get; set; }
        public Item ProductItem { get; set; }
        public Item IngredientItem { get; set; }
    }
}