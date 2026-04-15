namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class BranchProductWriteDto
    {
        public int ProductID {get;set;}
        public int BranchID {get;set;}
        public int ProductMaterialQuantity {get;set;}
    }
}