namespace Artifax.Models
{
  
    /// Represents a production order placed at a branch.
    /// An order contains a list of items (products + quantities) to be crafted.
    /// Status tracks whether the order is "Pending" or "Crafted".
   
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