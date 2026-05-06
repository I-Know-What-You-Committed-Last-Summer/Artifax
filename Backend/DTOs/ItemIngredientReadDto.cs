using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ItemIngredientReadDto
    {
        public int ItemIngredientID { get; set; }
        public int ProductID { get; set; }
        public int IngredientID { get; set; }
        public int IngredientQuantity { get; set; }
        public static ItemIngredientReadDto ToDto(ItemIngredient incoming)
        {
            ItemIngredientReadDto _result = new()
            {
                ItemIngredientID = incoming.ItemIngredientID,
                ProductID = incoming.ProductID,
                IngredientID = incoming.IngredientID,
                IngredientQuantity = incoming.IngredientQuantity
            };

            return _result;
        }
    }
}
