namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ProductMaterialWriteDto
    {
        public int ProductId { get; set; }
        public int MaterialId { get; set; }
        public int Quantity { get; set; }
    }
}