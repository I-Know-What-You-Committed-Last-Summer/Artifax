using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;
using Artifax.DTOs;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class ItemController : ControllerBase
    {
        private readonly ArtifaxContext _context;
        public ItemController(ArtifaxContext context)
        {
            _context = context;
        }

        //TODO: Crud for items and itemRecipes

        #region ItemEndpoints

        //List of all items
        [HttpGet("item/")]
        public async Task<ActionResult<IEnumerable<ItemReadDto>>> GetAllItems()
        {
            return await _context.Items.Select(i => ItemReadDto.ToDto(i)).ToListAsync();
        }
        [HttpGet("item/{id}")]
        public async Task<ActionResult<ItemReadDto>> GetItem(int id)
        {
            var _item = await _context.Items.FindAsync(id);
            if (_item == null)
            {
                return NotFound();
            }
            return ItemReadDto.ToDto(_item);
        }
        [HttpPost("item/")]
        public async Task<ActionResult<Item>> CreateItem(ItemWriteDto incoming)
        {
            Item _item = new Item()
            {
                ItemCategory = incoming.ItemCategory,
                ItemName = incoming.ItemName,
                ProductionTime = incoming.ProductionTime
            };
            _context.Items.Add(_item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetItem), new {id = _item.ItemID}, new ItemReadDto()
            {
                ItemID = _item.ItemID,
                ItemName = _item.ItemName,
                ItemCategory = _item.ItemCategory
            });
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, ItemWriteDto incoming)
        {
            var _item = await _context.Items.FindAsync(id);
            if (_item == null)
            {
                return NotFound();
            }
            _item.ItemName=incoming.ItemName;
            _item.ItemCategory=incoming.ItemCategory;
            _item.ProductionTime=incoming.ProductionTime;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var _item = await _context.Items.FindAsync(id);
            if (_item == null)
            {
                return NotFound();
            }
            _context.Items.Remove(_item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        #endregion

        #region ItemRecipeEndpoints
        //All item ingredients
        [HttpGet("itemIngredient/")]
        public async Task<ActionResult<IEnumerable<ItemIngredientReadDto>>> GetAllItemIngredients()
        {
            return await _context.ItemIngredients.Select(ig => ItemIngredientReadDto.ToDto(ig)).ToListAsync();
        }

        // Get a specific item ingredient by ID
        [HttpGet("itemIngredient/{id}")]
        public async Task<ActionResult<ItemIngredientReadDto>> GetItemIngredient(int id)
        {
            var _itemIngredient = await _context.ItemIngredients.FindAsync(id);
            if (_itemIngredient == null)
            {
                return NotFound();
            }
            return ItemIngredientReadDto.ToDto(_itemIngredient);
        }
        [HttpGet("itemIngredient/item/{itemId}")]
        public async Task<ActionResult<IEnumerable<IngredientBlueprintReadDto>>> GetIngredientsForItem(int itemId)
        {
            var blueprint = await (from ingredient in _context.ItemIngredients join item in _context.Items on ingredient.IngredientID equals item.ItemID where ingredient.ProductID == itemId select new IngredientBlueprintReadDto
            {
                IngredientID = item.ItemID,
                ItemName = item.ItemName,
                ItemCategory = item.ItemCategory,
                Quantity = ingredient.IngredientQuantity
            }).ToListAsync();
            if (!blueprint.Any())
            {
                return NotFound();
            }
            return blueprint;
        }

        // Create a new item ingredient
        [HttpPost("itemIngredient/")]
        public async Task<ActionResult<ItemIngredient>> CreateItemIngredient(ItemIngredientWriteDto incoming)
        {
            ItemIngredient _itemIngredient = new ItemIngredient()
            {
                IngredientID = incoming.IngredientID,
                IngredientQuantity = incoming.IngredientQuantity,
                ProductID = incoming.ProductID
            };
            
            _context.ItemIngredients.Add(_itemIngredient);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetItemIngredient), new { id = _itemIngredient.ItemIngredientID }, new ItemIngredientReadDto()
            {
                ItemIngredientID = _itemIngredient.ItemIngredientID,
                IngredientID = _itemIngredient.IngredientID,
                IngredientQuantity = _itemIngredient.IngredientQuantity,
                ProductID = _itemIngredient.ProductID
            });
        }

        // Update an existing item ingredient
        [HttpPut("itemIngredient/{id}")]
        public async Task<IActionResult> UpdateItemIngredient(int id, ItemIngredientWriteDto incoming)
        {
            var _itemIngredient = await _context.ItemIngredients.FindAsync(id);
            if (_itemIngredient == null)
            {
                return NotFound();
            }
            
            _itemIngredient.IngredientID = incoming.IngredientID;
            _itemIngredient.IngredientQuantity = incoming.IngredientQuantity;
            _itemIngredient.ProductID = incoming.ProductID;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Delete an item ingredient
        [HttpDelete("itemIngredient/{id}")]
        public async Task<IActionResult> DeleteItemIngredient(int id)
        {
            var _itemIngredient = await _context.ItemIngredients.FindAsync(id);
            if (_itemIngredient == null)
            {
                return NotFound();
            }
            
            _context.ItemIngredients.Remove(_itemIngredient);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        #endregion

        //TODO: Might move this to a its own controller
        #region BranchItemEndpoints
        [HttpGet("AllBranchItems/{branchID}")]
        public async Task<ActionResult<IEnumerable<ItemReadDto>>> GetItemsByBranch(int branchID)
        {
            return await _context.BranchItemCapacities.Where(bic => bic.BranchID == branchID).Select(bic => ItemReadDto.ToDto(bic.Item)).ToListAsync();
        }
        #endregion
    }
}