using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ItemBlueprintReadDto
    {
        public int ItemID {get;set;}
        public string ItemName {get;set;}
        public string ItemCategory {get;set;}
        public int ProductionTime {get;set;}
        public float? Price {get;set;}
        public List<IngredientBlueprintReadDto> Ingredients {get;set;} = new List<IngredientBlueprintReadDto>();
    }
}