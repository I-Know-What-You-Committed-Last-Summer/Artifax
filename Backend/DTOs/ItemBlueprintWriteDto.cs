using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ItemBlueprintWriteDto
    {
        public int ItemID {get;set;}
        public int ProductionTime {get;set;}
        public float? Price {get;set;}
        public List<IngredientBlueprintWriteDto> Ingredients {get;set;} = new List<IngredientBlueprintWriteDto>();
    }
}