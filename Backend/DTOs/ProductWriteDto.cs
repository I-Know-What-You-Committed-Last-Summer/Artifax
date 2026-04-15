namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ProductWriteDto
    {
        public string ProductName {get; set;}
        public float ProductionDuration {get; set;}
        public string ProductImageURL {get; set;}
    }
}