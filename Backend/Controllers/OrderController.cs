using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;

namespace Artifax.Controllers
{
   
    /// Handles all order-related operations: CRUD + crafting.
    /// Crafting an order deducts materials from branch stock and adds finished products.
   
    [ApiController]
    [Route("api/[Controller]")]
    public class OrderController : ControllerBase
    {
        readonly ArtifaxContext context;

        public OrderController(ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GetRoutes

        // GET /api/Order — Returns all orders with their items (products) and branch info
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await context.Orders
                .Include(o => o.Items)           // Load the order items (join table)
                    .ThenInclude(i => i.Product) // Load the product details for each item
                .Include(o => o.Branch)          // Load the branch this order belongs to
                .ToListAsync();
            return Ok(orders);
        }

        // GET /api/Order/{id} — Returns a single order by ID with items and branch
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound($"Order with ID {id} not found.");

            return Ok(order);
        }

        #endregion

        #region CreateRoutes

        // POST /api/Order/create — Creates a new order with items
        // Request body: { branchID, employeeID, orderDateTime, orderExpedite, items: [{ productID, quantity }] }
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] Order newOrder)
        {
            // Validate that the branch exists in the database
            var branch = await context.Branches.FindAsync(newOrder.BranchID);
            if (branch == null)
                return BadRequest($"Branch with ID {newOrder.BranchID} does not exist.");

            // Validate that the employee exists in the database
            var employee = await context.Employees.FindAsync(newOrder.EmployeeID);
            if (employee == null)
                return BadRequest($"Employee with ID {newOrder.EmployeeID} does not exist.");

            // An order must have at least one item
            if (newOrder.Items == null || !newOrder.Items.Any())
                return BadRequest("Order must contain at least one item.");

            // Validate each item references an existing product and has a valid quantity
            foreach (var item in newOrder.Items)
            {
                var product = await context.Products.FindAsync(item.ProductID);
                if (product == null)
                    return BadRequest($"Product with ID {item.ProductID} does not exist.");

                if (item.Quantity <= 0)
                    return BadRequest("Each item must have a quantity greater than 0.");
            }

            // All new orders start as "Pending" they become "Crafted" after the craft endpoint is called
            newOrder.Status = "Pending";
            newOrder.Branch = null; // Clear the Branch object so Entity Framework doesn't try to create a duplicate branch the BranchID value is enough to link the order to the correct branch

            // Clear navigation properties on items to prevent EF from trying to insert/track related entities
            foreach (var item in newOrder.Items)
            {
                item.Order = null;
                item.Product = null;
            }

            context.Orders.Add(newOrder);
            await context.SaveChangesAsync();

            // Reload the order with all related data included for the response
            var created = await context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.Id == newOrder.Id);

            return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.Id }, created);
        }

        #endregion

        #region UpdateRoutes

        // PUT /api/Order/{id} — Updates an existing order (cannot update if already crafted)
        // Replaces all order items with the new ones provided in the request body
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] Order updatedOrder)
        {
            var existingOrder = await context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (existingOrder == null)
                return NotFound($"Order with ID {id} not found.");

            // Prevent updates to orders that have already been crafted (materials already deducted)
            if (existingOrder.Status == "Crafted")
                return BadRequest("Cannot update an order that has already been crafted.");

            // Validate the new branch exists
            var branch = await context.Branches.FindAsync(updatedOrder.BranchID);
            if (branch == null)
                return BadRequest($"Branch with ID {updatedOrder.BranchID} does not exist.");

            // Validate all new items reference existing products
            if (updatedOrder.Items != null)
            {
                foreach (var item in updatedOrder.Items)
                {
                    var product = await context.Products.FindAsync(item.ProductID);
                    if (product == null)
                        return BadRequest($"Product with ID {item.ProductID} does not exist.");
                }
            }

            // Update the order's basic fields
            existingOrder.BranchID = updatedOrder.BranchID;
            existingOrder.EmployeeID = updatedOrder.EmployeeID;
            existingOrder.OrderDateTime = updatedOrder.OrderDateTime;
            existingOrder.OrderExpedite = updatedOrder.OrderExpedite;

            // Remove all old items and replace with the new ones (full replacement strategy)
            context.OrderItems.RemoveRange(existingOrder.Items);
            if (updatedOrder.Items != null)
            {
                foreach (var item in updatedOrder.Items)
                {
                    existingOrder.Items.Add(new OrderItem
                    {
                        ProductID = item.ProductID,
                        Quantity = item.Quantity
                    });
                }
            }

            await context.SaveChangesAsync();

            // Reload with includes for the response
            var result = await context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.Id == id);

            return Ok(result);
        }

        #endregion

        #region DeleteRoutes

        // DELETE /api/Order/{id} — Deletes an order (cannot delete if already crafted)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound($"Order with ID {id} not found.");

            // Prevent deletion of crafted orders since materials have already been consumed
            if (order.Status == "Crafted")
                return BadRequest("Cannot delete an order that has already been crafted.");

            // Remove the order items first (child records) then the order itself
            context.OrderItems.RemoveRange(order.Items);
            context.Orders.Remove(order);
            await context.SaveChangesAsync();

            return NoContent(); // 204 — successful deletion
        }

        #endregion

        #region CraftRoutes

        // POST /api/Order/{id}/craft — Crafts an order by:
        // - Checking if the branch has enough raw materials
        // - Deducting raw materials from the branch's stock (BranchMaterial)
        // - Adding the finished products to the branch's inventory (BranchProduct)
        // - Marking the order status as "Crafted"
        [HttpPost("{id}/craft")]
        public async Task<IActionResult> CraftOrder(int id)
        {
            var order = await context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p!.ProductMaterial)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound($"Order with ID {id} not found.");

            if (order.Status == "Crafted")
                return BadRequest("This order has already been crafted.");

            // Load branch materials
            var branchMaterials = await context.BranchMaterials
                .Where(bm => bm.BranchID == order.BranchID)
                .ToListAsync();

            // Calculate total materials needed across all items
            var materialsNeeded = new Dictionary<int, int>(); // MaterialID -> total quantity needed

            foreach (var item in order.Items)
            {
                if (item.Product == null) continue;

                foreach (var pm in item.Product.ProductMaterial)
                {
                    if (materialsNeeded.ContainsKey(pm.MaterialId))
                        materialsNeeded[pm.MaterialId] += pm.Quantity * item.Quantity;
                    else
                        materialsNeeded[pm.MaterialId] = pm.Quantity * item.Quantity;
                }
            }

            // Check if branch has enough of each material
            var insufficientMaterials = new List<string>();
            foreach (var needed in materialsNeeded)
            {
                var branchMaterial = branchMaterials.FirstOrDefault(bm => bm.MaterialID == needed.Key);
                int available = branchMaterial?.BranchMaterialQuantity ?? 0;

                if (available < needed.Value)
                {
                    var material = await context.Materials.FindAsync(needed.Key);
                    string materialName = material?.MaterialName ?? $"ID {needed.Key}";
                    insufficientMaterials.Add($"{materialName}: need {needed.Value}, have {available}");
                }
            }

            if (insufficientMaterials.Any())
            {
                return BadRequest(new
                {
                    message = "Insufficient materials to craft this order.",
                    details = insufficientMaterials
                });
            }

            // Deduct materials from branch stock
            foreach (var needed in materialsNeeded)
            {
                var branchMaterial = branchMaterials.First(bm => bm.MaterialID == needed.Key);
                branchMaterial.BranchMaterialQuantity -= needed.Value;
            }

            // Add/update products in branch stock
            foreach (var item in order.Items)
            {
                var branchProduct = await context.BranchProducts
                    .FirstOrDefaultAsync(bp => bp.BranchID == order.BranchID && bp.ProductID == item.ProductID);

                if (branchProduct != null)
                {
                    branchProduct.ProductMaterialQuantity += item.Quantity;
                }
                else
                {
                    context.BranchProducts.Add(new BranchProduct
                    {
                        BranchID = order.BranchID,
                        ProductID = item.ProductID,
                        ProductMaterialQuantity = item.Quantity
                    });
                }
            }

            // Mark order as crafted
            order.Status = "Crafted";
            await context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Order {id} crafted successfully.",
                order
            });
        }

        #endregion
    }
}