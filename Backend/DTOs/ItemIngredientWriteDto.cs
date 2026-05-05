namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ItemIngredientWriteDto
    {
        public int ProductID { get; set; }
        public int IngredientID { get; set; }
        public int IngredientQuantity { get; set; }
    }
}