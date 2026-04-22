using Artifax.Models;
namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ProductMaterialReadDto
    {
        public int ProductMaterialId { get; set; }
        public int ProductId { get; set; }
        public int MaterialId { get; set; }
        public int Quantity { get; set; }

        public static ProductMaterialReadDto ToDto(ProductMaterial incoming)
        {
            ProductMaterialReadDto _result = new()
            {
                ProductMaterialId = incoming.ProductMaterialId,
                ProductId = incoming.ProductId,
                MaterialId = incoming.MaterialId,
                Quantity = incoming.Quantity,
            };

            return _result;
        }
    }
}