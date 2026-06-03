namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class ItemWriteDto
    {
        public string ItemName { get; set; }
        public string ItemCategory { get; set; }
        public int ProductionTime { get; set; }
        public float? Price { get; set; }
    }
}