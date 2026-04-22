namespace Artifax.DTOs
{
    //DTO excluding properties for sql relationships
    public class BranchMaterialWriteDto
    {
        public int MaterialID {get;set;}
        public int BranchID {get;set;}
        public int MaterialQuantity {get;set;}

    }
}