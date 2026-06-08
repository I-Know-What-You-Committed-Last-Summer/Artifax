using Artifax.Models;
namespace Artifax.DTOs
{
    //Dto for the format we would want to fetch an ingredient with.
    public class IngredientBlueprintReadDto
    {
        public int IngredientID {get;set;}
        public string ItemName {get;set;}
        public string ItemCategory {get;set;}
        public float? ItemPrice {get;set;}
        public int Quantity {get;set;}
    }
}