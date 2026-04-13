using Artifax.Models;

namespace Artifax.DTOs
{
    public class ProductReadDto
    {
        public int ProductID {get; set;}
        public string ProductName {get; set;}
        public float ProductionDuration {get; set;}
        public string ProductImageURL {get; set;}

        public static ProductReadDto toDto(Product incoming)
        {
            ProductReadDto _result = new()
            {
                ProductID = incoming.ProductID,
                ProductName = incoming.ProductName,
                ProductionDuration = incoming.ProductionDuration,
                ProductImageURL = incoming.ProductImageURL
            };

            return _result;
        }
    }
}