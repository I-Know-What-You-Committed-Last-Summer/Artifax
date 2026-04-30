namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class BranchItemCapacityWriteDto
    {
        public int BranchID { get; set; }
        public int ItemID { get; set; }
        public int ItemQuantity { get; set; }
    }
}