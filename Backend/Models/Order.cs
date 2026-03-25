namespace Artifax.Models
{
    public class Order
    {
        public int OrderID {get; set;}
        public int ProductID {get; set;}
        public DateTime OrderDateTime {get; set;}
        public bool OrderExpedite {get; set;}
        public int BranchID {get; set;}
        public int EmployeeID {get; set;}

        //Defining the one relationship
        public Branch Branch { get; set; }
    }
}