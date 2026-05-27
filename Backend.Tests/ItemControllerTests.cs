using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Artifax.Controllers;
using Artifax.Data;
using Artifax.Models;
using Artifax.DTOs;
using System;
using System.Threading.Tasks; 

namespace Backend.Tests
{
    public class ItemControllerTests
    {
        // Helper method to build an isolated, clean in-memory database context for every test
        private DbContextOptions<ArtifaxContext> GetDbContextOptions()
        {
            return new DbContextOptionsBuilder<ArtifaxContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task GetItem_WhenItemExists_ReturnsItemReadDto()
        {
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var testItem = new Item { ItemID = 1, ItemName = "Stainless Square Steel", ItemCategory = "Metal", ProductionTime = 120 };
            context.Items.Add(testItem);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);

            //ACT
            var result = await controller.GetItem(1);

            //ASSERT
            var actionResult = Assert.IsType<ActionResult<ItemReadDto>>(result);
            var returnedDto = Assert.IsType<ItemReadDto>(actionResult.Value);
            Assert.Equal("Stainless Square Steel", returnedDto.ItemName);
            Assert.Equal("Metal", returnedDto.ItemCategory);
        }

        [Fact]
        public async Task GetItem_WhenItemDoesNotExist_ReturnsNotFound()
        {
            //Look for nothing
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);

            //ACT
            var result = await controller.GetItem(999);

            //ASSERT
            Assert.IsType<NotFoundResult>(result.Result);
        }
        [Fact]
        public async Task GetManyItems_WhenItemsExist_ReturnsListOfItemReadDto()
        {
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var testItem1 = new Item { ItemID = 1, ItemName = "Stainless Square Steel", ItemCategory = "Metal", ProductionTime = 120 };
            var testItem2 = new Item { ItemID = 2, ItemName = "Wooden Plank", ItemCategory = "Wood", ProductionTime = 60 };
            context.Items.AddRange(testItem1, testItem2);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);
            //ACT
            var result = await controller.GetAllItems();
            //ASSERT
            var actionResult = Assert.IsType<ActionResult<IEnumerable<ItemReadDto>>>(result);
            var returnedDtos = Assert.IsType<List<ItemReadDto>>(actionResult.Value);
            Assert.Equal(2, returnedDtos.Count);
        }
        [Fact]
        public async Task CreateItem_ValidObjectCreated_ReturnsCreatedResponse()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);

            var newItemDto = new ItemWriteDto
            {
                ItemName = "Titanium Gear",
                ItemCategory = "Metal",
                ProductionTime = 240
            };

            // ACT
            var result = await controller.CreateItem(newItemDto);

            // ASSERT
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedDto = Assert.IsType<ItemReadDto>(actionResult.Value);
            Assert.Equal("Titanium Gear", returnedDto.ItemName);
            Assert.Equal(1, await context.Items.CountAsync()); 
        }

        [Fact]
        public async Task UpdateItem_ExistingItemPassed_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var existingItem = new Item { ItemID = 1, ItemName = "Ninja Tabis", ItemCategory = "Wood", ProductionTime = 60 };
            context.Items.Add(existingItem);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);
            var updateDto = new ItemWriteDto { ItemName = "Plated Steelcaps", ItemCategory = "Wood", ProductionTime = 90 };

            // ACT
            var result = await controller.UpdateItem(1, updateDto);

            // ASSERT
            Assert.IsType<NoContentResult>(result);
            var updatedItem = await context.Items.FindAsync(1);
            Assert.Equal("Plated Steelcaps", updatedItem.ItemName);
            Assert.Equal(90, updatedItem.ProductionTime);
        }
        [Fact]
        public async Task DeleteItem_ExistingItem_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var existingItem = new Item { ItemID = 1, ItemName = "Iron Sword", ItemCategory = "Weapon", ProductionTime = 120 };
            context.Items.Add(existingItem);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.DeleteItem(1);

            // ASSERT
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.Items.CountAsync()); 
        }
        [Fact]
        public async Task DeleteItem_NonExistingItem_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var Items = new List<Item>
            {
                new Item { ItemID = 1, ItemName = "Dorans Blade", ItemCategory = "Weapon", ProductionTime = 120 },
                new Item { ItemID = 2, ItemName = "Dorans Ring", ItemCategory = "Consumable", ProductionTime = 30 }
            };
            context.Items.AddRange(Items);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.DeleteItem(3);

            // ASSERT
            Assert.IsType<NotFoundResult>(result);
            Assert.Equal(2, await context.Items.CountAsync()); 
        }
        //Blueprint tests
        [Fact]
        public async Task GetAllItemsWithIngredients_WhenDataExists_ReturnsItemBlueprints()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var product = new Item { ItemID = 1, ItemName = "Iron Sword", ItemCategory = "Weapon", ProductionTime = 300 };
            var ingredients = new List<Item> { new Item { ItemID = 2, ItemName = "Iron Ingot", ItemCategory = "Metal", ProductionTime = 60 }, new Item { ItemID=3, ItemName = "Stick", ItemCategory = "Wood", ProductionTime = 10 } };
            context.Items.Add(product);
            context.Items.AddRange(ingredients);

            var itemIngredients = new List<ItemIngredient>
            {
                new ItemIngredient { ItemIngredientID = 1, ProductID = 1, IngredientID = 2, IngredientQuantity = 2},
                new ItemIngredient { ItemIngredientID = 2, ProductID = 1, IngredientID = 3, IngredientQuantity = 1}
            };
            context.ItemIngredients.AddRange(itemIngredients);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.GetAllItemsWithIngredients();

            // ASSERT
            var actionResult = Assert.IsType<ActionResult<IEnumerable<ItemBlueprintReadDto>>>(result);
            var returnedBlueprints = Assert.IsType<List<ItemBlueprintReadDto>>(actionResult.Value);

            Assert.Single(returnedBlueprints); 
            
            var blueprint = returnedBlueprints[0];
            Assert.Equal("Iron Sword", blueprint.ItemName);
            Assert.Equal("Iron Ingot", blueprint.Ingredients[0].ItemName);
            Assert.Equal(2, blueprint.Ingredients[0].Quantity);
            Assert.Equal("Stick", blueprint.Ingredients[1].ItemName);
            Assert.Equal(1, blueprint.Ingredients[1].Quantity);
        }
        //Item ingredient tests
        [Fact]
        public async Task GetItemIngredient_WhenItemIngredientExists_ReturnsItemIngredientReadDto()
        {
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var testItemIngredient = new ItemIngredient {ItemIngredientID = 1, ProductID = 1, IngredientID = 2, IngredientQuantity = 3};
            context.ItemIngredients.Add(testItemIngredient);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);

            //ACT
            var result = await controller.GetItemIngredient(1);

            //ASSERT
            var actionResult = Assert.IsType<ActionResult<ItemIngredientReadDto>>(result);
            var returnedDto = Assert.IsType<ItemIngredientReadDto>(actionResult.Value);
            Assert.Equal(3, returnedDto.IngredientQuantity);
        }

        [Fact]
        public async Task GetItemIngredient_WhenItemIngredientDoesNotExist_ReturnsNotFound()
        {
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var testItemIngredient = new ItemIngredient {ItemIngredientID = 1, ProductID = 1, IngredientID = 2, IngredientQuantity = 3};
            context.ItemIngredients.Add(testItemIngredient);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);

            //ACT
            var result = await controller.GetItemIngredient(2);

            //ASSERT
            Assert.IsType<NotFoundResult>(result.Result);
        }
        [Fact]
        public async Task CreateItemIngredient_ValidObjectCreated_ReturnsCreatedResponse()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);

            var newItemIngredientDto = new ItemIngredientWriteDto
            {
                ProductID = 1,
                IngredientID = 2,
                IngredientQuantity = 3
            };

            // ACT
            var result = await controller.CreateItemIngredient(newItemIngredientDto);

            // ASSERT
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedDto = Assert.IsType<ItemIngredientReadDto>(actionResult.Value);
            Assert.Equal(3, returnedDto.IngredientQuantity);
            Assert.Equal(1, await context.ItemIngredients.CountAsync());
        }
        [Fact]
        public async Task UpdateItemIngredient_ExistingItemIngredientPassed_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var existingItem = new ItemIngredient {ItemIngredientID = 1, ProductID = 1, IngredientID = 2, IngredientQuantity = 3 };
            context.ItemIngredients.Add(existingItem);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);
            var updateDto = new ItemIngredientWriteDto { IngredientQuantity = 5 };

            // ACT
            var result = await controller.UpdateItemIngredient(1, updateDto);

            // ASSERT
            Assert.IsType<NoContentResult>(result);
            var updatedItem = await context.ItemIngredients.FindAsync(1);
            Assert.Equal(5, updatedItem.IngredientQuantity);
        }
        [Fact]
        public async Task DeleteItemIngredient_ExistingItemIngredient_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var existingItemIngredient = new ItemIngredient {ItemIngredientID = 1, ProductID = 1, IngredientID = 2, IngredientQuantity = 3 };
            context.ItemIngredients.Add(existingItemIngredient);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.DeleteItemIngredient(1);

            // ASSERT
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.ItemIngredients.CountAsync()); 
        }
        [Fact]
        public async Task DeleteItemIngredient_NonExistingItemIngredient_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var ItemIngredients = new List<ItemIngredient>
            {
                new ItemIngredient {ItemIngredientID = 1, ProductID = 1, IngredientID = 2, IngredientQuantity = 3 },
                new ItemIngredient {ItemIngredientID = 2, ProductID = 1, IngredientID = 3, IngredientQuantity = 4 }
            };
            context.ItemIngredients.AddRange(ItemIngredients);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.DeleteItemIngredient(3);

            // ASSERT
            Assert.IsType<NotFoundResult>(result);
            Assert.Equal(2, await context.ItemIngredients.CountAsync()); 
        }

        //Branch Item tests


        [Fact]
        public async Task GetAllBranchItems_WhenDataExists_ReturnsListOfBranchItemCapacityReadDto()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var capacity1 = new BranchItemCapacity { BranchItemCapacityID = 1, BranchID = 10, ItemID = 101, ItemQuantity = 50 };
            var capacity2 = new BranchItemCapacity { BranchItemCapacityID = 2, BranchID = 20, ItemID = 102, ItemQuantity = 100 };
            context.BranchItemCapacities.AddRange(capacity1, capacity2);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.GetAllBranchItems();

            // ASSERT
            var actionResult = Assert.IsType<ActionResult<IEnumerable<BranchItemCapacityReadDto>>>(result);
            var returnedDtos = Assert.IsType<List<BranchItemCapacityReadDto>>(actionResult.Value);
            Assert.Equal(2, returnedDtos.Count);
        }

        [Fact]
        public async Task GetItemsByBranch_WhenBranchHasItems_ReturnsFilteredList()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var capacity1 = new BranchItemCapacity { BranchItemCapacityID = 1, BranchID = 1, ItemID = 101, ItemQuantity = 50 };
            var capacity2 = new BranchItemCapacity { BranchItemCapacityID = 2, BranchID = 1, ItemID = 102, ItemQuantity = 30 };
            var capacity3 = new BranchItemCapacity { BranchItemCapacityID = 3, BranchID = 2, ItemID = 103, ItemQuantity = 99 }; // Different branch
            context.BranchItemCapacities.AddRange(capacity1, capacity2, capacity3);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.GetItemsByBranch(1);

            // ASSERT
            var actionResult = Assert.IsType<ActionResult<IEnumerable<BranchItemCapacityReadDto>>>(result);
            var returnedDtos = Assert.IsType<List<BranchItemCapacityReadDto>>(actionResult.Value);
            Assert.Equal(2, returnedDtos.Count);
            Assert.All(returnedDtos, dto => Assert.Equal(1, dto.BranchID));
        }

        [Fact]
        public async Task GetBranchItemsByID_WhenCapacityExists_ReturnsBranchItemCapacityReadDto()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var testCapacity = new BranchItemCapacity { BranchItemCapacityID = 1, BranchID = 5, ItemID = 500, ItemQuantity = 25 };
            context.BranchItemCapacities.Add(testCapacity);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.GetBranchItemsByID(1);

            // ASSERT
            var actionResult = Assert.IsType<ActionResult<BranchItemCapacityReadDto>>(result);
            var returnedDto = Assert.IsType<BranchItemCapacityReadDto>(actionResult.Value);
            Assert.Equal(5, returnedDto.BranchID);
            Assert.Equal(25, returnedDto.ItemQuantity);
        }

        [Fact]
        public async Task GetBranchItemsByID_WhenCapacityDoesNotExist_ReturnsNotFound()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);

            // ACT
            var result = await controller.GetBranchItemsByID(999);

            // ASSERT
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateBranchItems_ValidObjectCreated_ReturnsCreatedResponse()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);

            var newCapacityDto = new BranchItemCapacityWriteDto
            {
                BranchID = 3,
                ItemID = 303,
                ItemQuantity = 75
            };

            // ACT
            var result = await controller.CreateBranchItems(newCapacityDto);

            // ASSERT
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedDto = Assert.IsType<BranchItemCapacityReadDto>(actionResult.Value);
            Assert.Equal(3, returnedDto.BranchID);
            Assert.Equal(75, returnedDto.ItemQuantity);
            Assert.Equal(1, await context.BranchItemCapacities.CountAsync());
        }

        [Fact]
        public async Task UpdateBranchItemCapacity_ExistingCapacityPassed_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var existingCapacity = new BranchItemCapacity { BranchItemCapacityID = 1, BranchID = 2, ItemID = 202, ItemQuantity = 10 };
            context.BranchItemCapacities.Add(existingCapacity);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);
            var updateDto = new BranchItemCapacityWriteDto { BranchID = 2, ItemID = 202, ItemQuantity = 150 }; // Updated quantity

            // ACT
            var result = await controller.UpdateBranchItemCapacity(1, updateDto);

            // ASSERT
            Assert.IsType<NoContentResult>(result);
            var updatedCapacity = await context.BranchItemCapacities.FindAsync(1);
            Assert.Equal(150, updatedCapacity.ItemQuantity);
        }

        [Fact]
        public async Task UpdateBranchItemCapacity_NonExistingCapacityPassed_ReturnsNotFound()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);
            var updateDto = new BranchItemCapacityWriteDto { BranchID = 2, ItemID = 202, ItemQuantity = 150 };

            // ACT
            var result = await controller.UpdateBranchItemCapacity(999, updateDto);

            // ASSERT
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteBranchItemCapacity_ExistingCapacity_ReturnsNoContent()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var existingCapacity = new BranchItemCapacity { BranchItemCapacityID = 1, BranchID = 4, ItemID = 404, ItemQuantity = 40 };
            context.BranchItemCapacities.Add(existingCapacity);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.DeleteBranchItemCapacity(1);

            // ASSERT
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.BranchItemCapacities.CountAsync());
        }

        [Fact]
        public async Task DeleteBranchItemCapacity_NonExistingCapacity_ReturnsNotFound()
        {
            // ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var existingCapacity = new BranchItemCapacity { BranchItemCapacityID = 1, BranchID = 4, ItemID = 404, ItemQuantity = 40 };
            context.BranchItemCapacities.Add(existingCapacity);
            await context.SaveChangesAsync();

            var controller = new ItemController(context);

            // ACT
            var result = await controller.DeleteBranchItemCapacity(999);

            // ASSERT
            Assert.IsType<NotFoundResult>(result);
            Assert.Equal(1, await context.BranchItemCapacities.CountAsync());
        }
    }
}