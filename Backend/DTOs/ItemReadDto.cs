using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ItemReadDto
    {
        public int ItemID {get;set;}
        public string ItemName {get;set;}
        public string ItemCategory {get;set;}
        public int ProductionTime {get;set;}
        public float? Price {get;set;}
        public static ItemReadDto ToDto (Item incoming)
        {
            ItemReadDto _result = new()
            {
                ItemID = incoming.ItemID,
                ItemName = incoming.ItemName,
                ItemCategory = incoming.ItemCategory,
                ProductionTime = incoming.ProductionTime,
                Price = incoming.Price
            };

            return _result;
        }
    }
}