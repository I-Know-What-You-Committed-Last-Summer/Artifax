using System.Diagnostics;
using Artifax.Data;
using Artifax.DTOs;
using Artifax.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class BranchController : ControllerBase
    {
        readonly ArtifaxContext context;

        public BranchController (ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GET
            [HttpGet]
            public async Task<ActionResult<IEnumerable<BranchDto>>> GetAll ()
            {
                return await context.Branches.Select(_branch => BranchDto.ToDto(_branch)).ToListAsync();
            }

            [HttpGet("{id}")]
            public async Task<ActionResult<IEnumerable<BranchDto>>> GetBranchById (int id)
            {
                var _result = await context.Branches.FindAsync(id);
                if (_result == null) return NotFound();
                return Ok(BranchDto.ToDto(_result));
            }
        #endregion

        #region CREATE
            [HttpPost]
            public async Task<ActionResult<BranchDto>> CreateBranch (BranchDto incoming)
            {
                if (context.Branches.Count() > 0) {
                    incoming.BranchID = context.Branches.Max(b => b.BranchID + 1);
                } else
                {
                    incoming.BranchID = 0;
                }

                Console.WriteLine($"BranchID [{incoming.BranchID}] BranchName [{incoming.BranchName}]");
                context.Branches.Add(incoming.ToBranch());
                await context.SaveChangesAsync();
                return CreatedAtAction("GetBranchById", new { id = incoming.BranchID}, incoming);;
            }
        #endregion

        #region UPDATE
            [HttpPatch]
            public async Task<ActionResult<Branch>> UpdateBranchName (int id, string incoming)
            {
                var _result = await context.Branches.FindAsync(id);
                if (_result == null) return NotFound();

                _result.BranchName = incoming;
                await context.SaveChangesAsync();

                return Ok(BranchDto.ToDto(_result));
            }
        #endregion

        #region DELETE
            [HttpDelete]
            public async Task<IActionResult> DeleteBranch (int id)
            {
                var _result = await context.Branches.FindAsync(id);
                if (_result == null) return NotFound();

                context.Branches.Remove(_result);
                await context.SaveChangesAsync();

                return NoContent();
            }
        #endregion
    }
}