using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class IngredientBlueprintWriteDto
    {
        public int IngredientID {get;set;}
        public int IngredientQuantity {get;set;}
    }
}